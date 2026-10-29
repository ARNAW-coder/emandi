import mongoose from "mongoose";

const queueEntrySchema = new mongoose.Schema(
  {
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["WAITING", "WEIGHING", "COMPLETED", "CANCELLED"],
      default: "WAITING",
    },
    checkedInAt: { type: Date, default: Date.now },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    fiveLeftAlertEnabled: { type: Boolean, default: false },
    fiveLeftAlertSent: { type: Boolean, default: false },
    turnAlertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A farmer cannot check into the same schedule twice — enforced by the
// database itself, not just application logic (see explanation above).
queueEntrySchema.index({ schedule: 1, farmer: 1 }, { unique: true });

// The admin's live queue view and position calculations filter by
// schedule + status constantly (e.g. "all WAITING entries for schedule X").
queueEntrySchema.index({ schedule: 1, status: 1 });

// Token numbers must be unique per schedule, and we constantly sort/filter
// by tokenNumber (position calculation, admin queue ordering). Making this
// index unique is a second line of defense: even if the counter logic ever
// had a bug, MongoDB itself would refuse a duplicate token in the same schedule.
queueEntrySchema.index({ schedule: 1, tokenNumber: 1 }, { unique: true });

const QueueEntry = mongoose.model("QueueEntry", queueEntrySchema);
export default QueueEntry;