import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../sockets/socket.js";
import { sendEmail } from "./email.service.js";
import { sendSMS, isSmsAvailable } from "./sms.service.js";

// Events important enough to interrupt someone outside the app.
// CHECK_IN_SUCCESS and QUEUE_UPDATE are deliberately excluded — website-only.
const CHANNEL_EVENTS = ["FIVE_FARMERS_LEFT", "TURN_APPROACHING", "YOUR_TURN", "PAYMENT_RELEASED"];

const SUBJECTS = {
  FIVE_FARMERS_LEFT: "e-Mandi: Only 5 farmers ahead of you",
  TURN_APPROACHING: "e-Mandi: Your turn is approaching",
  YOUR_TURN: "e-Mandi: It's your turn!",
  PAYMENT_RELEASED: "e-Mandi: Payment released",
};

export const notifyUser = async (userId, type, message) => {
  // 1. Website notification — always, every type, no exceptions.
  const notification = await Notification.create({ user: userId, type, message });
  getIO().to(`user:${userId}`).emit("notification:new", notification);

  // 2. External channel — only for the events that deserve it.
  if (CHANNEL_EVENTS.includes(type)) {
    const user = await User.findById(userId).select("phone email");
    let delivered = false;

    if (isSmsAvailable() && user?.phone) {
      try {
        await sendSMS(user.phone, `e-Mandi: ${message}`);
        delivered = true;
      } catch (error) {
        console.log(`[SMS FAILED, falling back to email] user ${userId}: ${error.message}`);
      }
    }

    if (!delivered && user?.email) {
      await sendEmail(user.email, SUBJECTS[type] || "e-Mandi Notification", message);
      delivered = true;
    }

    if (!delivered) {
      console.log(`[NOTIFICATION SKIPPED] No SMS or email channel available for user ${userId}`);
    }
  }

  return notification;
};