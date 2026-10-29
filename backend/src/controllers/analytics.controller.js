import QueueEntry from "../models/QueueEntry.js";
import Procurement from "../models/Procurement.js";
import Payment from "../models/Payment.js";
import Mandi from "../models/Mandi.js";
import Schedule from "../models/Schedule.js";

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const getOverview = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const [totalFarmersToday, farmersServedToday, currentlyWaiting, avgWaitResult, procurementTotal, paymentReleasedTotal] =
      await Promise.all([
        QueueEntry.countDocuments({ checkedInAt: { $gte: start, $lt: end } }),
        QueueEntry.countDocuments({ checkedInAt: { $gte: start, $lt: end }, status: "COMPLETED" }),
        QueueEntry.countDocuments({ checkedInAt: { $gte: start, $lt: end }, status: "WAITING" }),
        QueueEntry.aggregate([
          { $match: { checkedInAt: { $gte: start, $lt: end }, status: "COMPLETED", completedAt: { $ne: null } } },
          { $project: { waitMinutes: { $divide: [{ $subtract: ["$completedAt", "$checkedInAt"] }, 60000] } } },
          { $group: { _id: null, avgWait: { $avg: "$waitMinutes" } } },
        ]),
        Procurement.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
        Payment.aggregate([
          { $match: { status: "RELEASED" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalFarmersToday,
        farmersServedToday,
        currentlyWaiting,
        averageWaitMinutes: avgWaitResult[0]?.avgWait ? Math.round(avgWaitResult[0].avgWait) : 0,
        totalProcurementAmount: procurementTotal[0]?.total || 0,
        totalPaymentsReleased: paymentReleasedTotal[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMandiDensity = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const mandis = await Mandi.find();

    const results = await Promise.all(
      mandis.map(async (mandi) => {
        const todaysSchedules = await Schedule.find({
          mandi: mandi._id,
          date: { $gte: start, $lt: end },
        }).select("_id");

        const scheduleIds = todaysSchedules.map((s) => s._id);

        const waitingCount = await QueueEntry.countDocuments({
          schedule: { $in: scheduleIds },
          status: "WAITING",
        });

        let density = "GREEN";
        if (waitingCount > 50) density = "RED";
        else if (waitingCount >= 20) density = "YELLOW";

        return {
          mandiId: mandi._id,
          name: mandi.name,
          location: mandi.location,
          currentlyWaiting: waitingCount,
          density,
        };
      })
    );

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};