import Procurement from "../models/Procurement.js";
import QueueEntry from "../models/QueueEntry.js";
import { notifyUser } from "../services/notification.service.js";
import { handleQueueChange } from "../services/queueEvents.service.js";
import Payment from "../models/Payment.js";

export const createProcurement = async (req, res) => {
  try {
    const { queueEntryId, quantity, rate } = req.body;

    if (!queueEntryId || quantity === undefined || rate === undefined) {
      return res.status(400).json({ success: false, message: "queueEntryId, quantity and rate are required" });
    }
    if (quantity <= 0 || rate <= 0) {
      return res.status(400).json({ success: false, message: "quantity and rate must be positive numbers" });
    }

    const entry = await QueueEntry.findById(queueEntryId).populate("schedule");
    if (!entry) {
      return res.status(404).json({ success: false, message: "Queue entry not found" });
    }
    if (entry.schedule.mandi.toString() !== req.user.mandiId?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: not your Mandi's queue entry" });
    }

    // Atomic guard — see explanation above. Only one concurrent request can win this.
    const updatedEntry = await QueueEntry.findOneAndUpdate(
      { _id: queueEntryId, status: "WEIGHING" },
      { $set: { status: "COMPLETED", completedAt: new Date() } },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(400).json({ success: false, message: "This entry is not currently being weighed" });
    }

    // Crop comes from the SCHEDULE, never from the request body — another
    // thing we don't trust the client to tell us correctly.
    const crop = entry.schedule.crop;
    const totalAmount = Number((quantity * rate).toFixed(2));

    let procurement;
    try {
      procurement = await Procurement.create({ queueEntry: queueEntryId, crop, quantity, rate, totalAmount });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: "Procurement already recorded for this entry" });
      }
      throw error;
    }

    const payment = await Payment.create({
  procurement: procurement._id,
  amount: totalAmount,
  status: "PENDING",
});

    await notifyUser(
      updatedEntry.farmer,
      "PROCUREMENT_COMPLETED",
      `Your crop procurement is complete: ${quantity}kg at ₹${rate}/kg — total ₹${totalAmount}.`
    );
    await handleQueueChange(entry.schedule._id);

    res.status(201).json({ success: true, data: { procurement, payment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProcurementById = async (req, res) => {
  try {
    const procurement = await Procurement.findById(req.params.id).populate({
      path: "queueEntry",
      populate: [
        { path: "farmer", select: "name phone" },
        { path: "schedule" },
      ],
    });
    if (!procurement) {
      return res.status(404).json({ success: false, message: "Procurement not found" });
    }

    const isOwnerAdmin =
      req.user.role === "MANDI_ADMIN" &&
      procurement.queueEntry.schedule.mandi.toString() === req.user.mandiId?.toString();
    const isOwnerFarmer =
      req.user.role === "FARMER" &&
      procurement.queueEntry.farmer._id.toString() === req.user._id.toString();
    const isGovtOfficer = req.user.role === "GOVT_OFFICER";

    if (!isOwnerAdmin && !isOwnerFarmer && !isGovtOfficer) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.status(200).json({ success: true, data: procurement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProcurements = async (req, res) => {
  try {
    const myEntryIds = await QueueEntry.find({ farmer: req.user._id }).distinct("_id");

    const procurements = await Procurement.find({ queueEntry: { $in: myEntryIds } })
      .populate({ path: "queueEntry", populate: { path: "schedule", populate: "mandi" } })
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ procurement: { $in: procurements.map((p) => p._id) } });
    const paymentByProcurement = Object.fromEntries(payments.map((p) => [p.procurement.toString(), p]));

    const data = procurements.map((p) => ({ ...p.toObject(), payment: paymentByProcurement[p._id.toString()] || null }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};