import QueueEntry from "../models/QueueEntry.js";
import Schedule from "../models/Schedule.js";
import { getNextTokenNumber } from "../utils/getNextTokenNumber.js";
import { handleQueueChange } from "../services/queueEvents.service.js";
import { notifyUser } from "../services/notification.service.js";

export const checkIn = async (req, res) => {
  try {
    const {scheduleId, fiveLeftAlertEnabled } = req.body;
    const farmerId = req.user._id;

    if (!scheduleId) {
      return res.status(400).json({ success: false, message: "scheduleId is required" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    if (schedule.status !== "OPEN") {
      return res.status(400).json({ success: false, message: "Schedule is not open for check-in" });
    }

    // Reject stale schedules an admin forgot to close (date-only comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(schedule.date);
    scheduleDate.setHours(0, 0, 0, 0);
    if (scheduleDate < today) {
      return res.status(400).json({ success: false, message: "This schedule has already passed" });
    }

    // Friendly pre-check (the real guarantee is the unique index below)
    const alreadyCheckedIn = await QueueEntry.findOne({ schedule: scheduleId, farmer: farmerId });
    if (alreadyCheckedIn) {
      return res.status(409).json({ success: false, message: "You have already checked in for this schedule" });
    }

    // Atomically reserve the next token number
    const tokenNumber = await getNextTokenNumber(scheduleId);

    if (tokenNumber > schedule.maxFarmers) {
      return res.status(400).json({ success: false, message: "This schedule is full" });
    }

    let queueEntry;
    try {
      queueEntry = await QueueEntry.create({
        schedule: scheduleId,
  farmer: farmerId,
  tokenNumber,
  fiveLeftAlertEnabled: !!fiveLeftAlertEnabled,
      });
    } catch (error) {
      if (error.code === 11000) {
        // Caught a genuine race: another request for this same farmer+schedule
        // (or, in theory, a token collision) slipped in between our checks above.
        return res.status(409).json({ success: false, message: "Already checked in for this schedule" });
      }
      throw error;
    }

    await notifyUser(farmerId, "CHECK_IN_SUCCESS", `You have checked in. Your token number is ${tokenNumber}.`);

    const farmersAhead = await QueueEntry.countDocuments({
      schedule: scheduleId,
      status: { $in: ["WAITING", "WEIGHING"] },
      tokenNumber: { $lt: tokenNumber },
    });
    
    await handleQueueChange(scheduleId);

    res.status(201).json({
      success: true,
      data: {
        queueEntry,
        tokenNumber,
        position: farmersAhead + 1,
        farmersAhead,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPosition = async (req, res) => {
  try {
    const { scheduleId } = req.query;
    const farmerId = req.user._id;

    const entry = await QueueEntry.findOne({ schedule: scheduleId, farmer: farmerId });
    if (!entry) {
      return res.status(404).json({ success: false, message: "You have not checked in for this schedule" });
    }

    const farmersAhead = await QueueEntry.countDocuments({
      schedule: scheduleId,
      status: { $in: ["WAITING", "WEIGHING"] },
      tokenNumber: { $lt: entry.tokenNumber },
    });

    res.status(200).json({
      success: true,
      data: {
        tokenNumber: entry.tokenNumber,
        status: entry.status,
        position: entry.status === "WAITING" || entry.status === "WEIGHING" ? farmersAhead + 1 : null,
        farmersAhead,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQueueForSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    if (schedule.mandi.toString() !== req.user.mandiId?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: not your Mandi's schedule" });
    }

    const queue = await QueueEntry.find({ schedule: scheduleId })
      .populate("farmer", "name phone")
      .sort({ tokenNumber: 1 });

    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processNext = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    if (schedule.mandi.toString() !== req.user.mandiId?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: not your Mandi's schedule" });
    }

    const queueEntry = await QueueEntry.findOneAndUpdate(
      { schedule: scheduleId, status: "WAITING" },
      { $set: { status: "WEIGHING", startedAt: new Date() } },
      { sort: { tokenNumber: 1 }, new: true }
    ).populate("farmer", "name phone");

    if (!queueEntry) {
      return res.status(404).json({ success: false, message: "No farmers waiting in queue" });
    }
    
    await notifyUser(queueEntry.farmer._id, "YOUR_TURN", "It's your turn! Please proceed to the weighing counter.");
    await handleQueueChange(scheduleId);

    res.status(200).json({ success: true, data: queueEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeEntry = async (req, res) => {
  try {
    const { queueEntryId } = req.params;

    const existing = await QueueEntry.findById(queueEntryId).populate("schedule");
    if (!existing) {
      return res.status(404).json({ success: false, message: "Queue entry not found" });
    }
    if (existing.schedule.mandi.toString() !== req.user.mandiId?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: not your Mandi's schedule" });
    }

    // Atomic guard: only succeeds if this entry is still WEIGHING at the
    // moment this exact operation runs — prevents two "Complete" clicks
    // (or two admin tabs) from both completing the same farmer.
    const queueEntry = await QueueEntry.findOneAndUpdate(
      { _id: queueEntryId, status: "WEIGHING" },
      { $set: { status: "COMPLETED", completedAt: new Date() } },
      { new: true }
    );

    if (!queueEntry) {
      return res.status(400).json({ success: false, message: "This entry is not currently being weighed" });
    }
    
    
    await handleQueueChange(queueEntry.schedule);
    
    res.status(200).json({ success: true, data: queueEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};