import Payment from "../models/Payment.js";
import { notifyUser } from "../services/notification.service.js";
import { getIO } from "../sockets/socket.js";
import Schedule from "../models/Schedule.js";
import QueueEntry from "../models/QueueEntry.js";
import Procurement from "../models/Procurement.js";


const populateChain = {
  path: "procurement",
  populate: {
    path: "queueEntry",
    populate: [{ path: "farmer", select: "name phone email" }, { path: "schedule" }],
  },
};

export const getMyMandiPayments = async (req, res) => {
  try {
    const scheduleIds = await Schedule.find({ mandi: req.user.mandiId }).distinct("_id");
    const entryIds = await QueueEntry.find({ schedule: { $in: scheduleIds } }).distinct("_id");
    const procurementIds = await Procurement.find({ queueEntry: { $in: entryIds } }).distinct("_id");

    const payments = await Payment.find({ procurement: { $in: procurementIds } })
      .populate({ path: "procurement", populate: { path: "queueEntry", populate: "farmer" } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(populateChain);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const entry = payment.procurement.queueEntry;
    const isOwnerAdmin = req.user.role === "MANDI_ADMIN" && entry.schedule.mandi.toString() === req.user.mandiId?.toString();
    const isOwnerFarmer = req.user.role === "FARMER" && entry.farmer._id.toString() === req.user._id.toString();
    const isGovtOfficer = req.user.role === "GOVT_OFFICER";

    if (!isOwnerAdmin && !isOwnerFarmer && !isGovtOfficer) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = { PENDING: "PROCESSED", PROCESSED: "RELEASED" };

    if (!["PROCESSED", "RELEASED"].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be PROCESSED or RELEASED" });
    }

    const payment = await Payment.findById(req.params.id).populate(populateChain);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const entry = payment.procurement.queueEntry;
    if (entry.schedule.mandi.toString() !== req.user.mandiId?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: not your Mandi's payment" });
    }

    if (validTransitions[payment.status] !== status) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${payment.status} to ${status}` });
    }

    const updated = await Payment.findOneAndUpdate(
      { _id: payment._id, status: payment.status },
      { $set: { status, ...(status === "RELEASED" ? { releasedAt: new Date() } : {}) } },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ success: false, message: "Payment status changed concurrently — please retry" });
    }

    const farmerId = entry.farmer._id;

    if (status === "RELEASED") {
      await notifyUser(farmerId, "PAYMENT_RELEASED", `Your payment of ₹${updated.amount} has been released.`);
    }

    getIO().to(`user:${farmerId}`).emit("payment:updated", {
      paymentId: updated._id,
      status: updated.status,
      amount: updated.amount,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};