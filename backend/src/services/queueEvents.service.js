import QueueEntry from "../models/QueueEntry.js";
import { broadcastQueueUpdate } from "./queueBroadcast.service.js";
import { notifyUser } from "./notification.service.js";

const evaluateThresholdAlerts = async (scheduleId) => {
  const activeEntries = await QueueEntry.find({
    schedule: scheduleId,
    status: { $in: ["WAITING", "WEIGHING"] },
  }).sort({ tokenNumber: 1 });

  for (let i = 0; i < activeEntries.length; i++) {
    const entry = activeEntries[i];
    if (entry.status !== "WAITING") continue; // already being served — no forward-looking alert needed

    const farmersAhead = i; // entries before this one in the sorted active list

    if (entry.fiveLeftAlertEnabled && !entry.fiveLeftAlertSent && farmersAhead === 5) {
      entry.fiveLeftAlertSent = true;
      await entry.save();
      await notifyUser(entry.farmer, "FIVE_FARMERS_LEFT", "Only 5 farmers are ahead of you. Please be ready.");
    }

    if (!entry.turnAlertSent && farmersAhead === 1) {
      entry.turnAlertSent = true;
      await entry.save();
      await notifyUser(entry.farmer, "TURN_APPROACHING", "Only 1 farmer is ahead of you. Get ready for your turn.");
    }
  }
};

export const handleQueueChange = async (scheduleId) => {
  await broadcastQueueUpdate(scheduleId);
  await evaluateThresholdAlerts(scheduleId);
};