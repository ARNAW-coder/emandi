import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "CHECK_IN_SUCCESS",
        "QUEUE_UPDATE",
        "FIVE_FARMERS_LEFT",
        "TURN_APPROACHING",
        "YOUR_TURN",
        "WEIGHING_STARTED",
        "PROCUREMENT_COMPLETED",
        "PAYMENT_RELEASED",
      ],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Notification history / bell dropdown always queries "this user's
// notifications, newest first" — this index makes that instant even
// as the collection grows across a full demo day.
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;