import Schedule from "../models/Schedule.js";

export const createSchedule = async (req, res) => {
  try {
    const { crop, date, startTime, endTime, maxFarmers } = req.body;

    if (!crop || !date || !startTime || !endTime || !maxFarmers) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!req.user.mandiId) {
      return res.status(400).json({ success: false, message: "Your account has no assigned Mandi" });
    }

    const schedule = await Schedule.create({
      mandi: req.user.mandiId, // NEVER trust mandiId from the request body
      crop,
      date,
      startTime,
      endTime,
      maxFarmers,
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSchedules = async (req, res) => {
  try {
    const { crop, date, mandiId, status } = req.query;
    const filter = {};

    if (crop) filter.crop = crop;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    // A MANDI_ADMIN browsing without specifying a mandi sees only their own
    if (req.user.role === "MANDI_ADMIN" && !mandiId) {
      filter.mandi = req.user.mandiId;
    } else if (mandiId) {
      filter.mandi = mandiId;
    }

    const schedules = await Schedule.find(filter).populate("mandi", "name location").sort({ date: 1 });
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate("mandi", "name location");
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    if (schedule.mandi.toString() !== req.user.mandiId?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: not your Mandi's schedule" });
    }

    const allowedFields = ["crop", "date", "startTime", "endTime", "maxFarmers"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) schedule[field] = req.body[field];
    });

    await schedule.save();
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    if (schedule.mandi.toString() !== req.user.mandiId?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: not your Mandi's schedule" });
    }

    schedule.status = "CLOSED";
    await schedule.save();

    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};