import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    mandi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandi",
      required: true,
    },
    crop: {
      type: String,
      enum: ["WHEAT", "RICE", "ONION", "TOMATO", "POTATO"],
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "16:00"
    maxFarmers: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "COMPLETED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

// Farmers browsing "today's schedules at Mandi X" — this is the most common
// read pattern on the farmer side.
scheduleSchema.index({ mandi: 1, date: 1 });

// Farmers browsing "what's open today across any mandi" and the govt
// dashboard's "active schedules" queries filter by exactly this pair.
scheduleSchema.index({ date: 1, status: 1 });

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;