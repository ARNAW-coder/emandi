import mongoose from "mongoose";

const procurementSchema = new mongoose.Schema(
  {
    queueEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QueueEntry",
      required: true,
      unique: true, // one procurement record per queue entry, ever — the backstop mentioned above
    },
    crop: {
      type: String,
      enum: ["WHEAT", "RICE", "ONION", "TOMATO", "POTATO"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0.01 },
    rate: { type: Number, required: true, min: 0.01 },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

const Procurement = mongoose.model("Procurement", procurementSchema);
export default Procurement;