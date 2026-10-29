import QueueEntry from "../models/QueueEntry.js";
import { getIO } from "../sockets/socket.js";

export const broadcastQueueUpdate = async (scheduleId) => {
  const queue = await QueueEntry.find({
    schedule: scheduleId,
    status: { $in: ["WAITING", "WEIGHING"] },
  })
    .select("tokenNumber status")
    .sort({ tokenNumber: 1 });

  getIO().to(`schedule:${scheduleId}`).emit("queue:update", {
    scheduleId,
    queue,
  });
};