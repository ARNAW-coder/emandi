import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    procurement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Procurement",
      required: true,
      unique: true, // exactly one payment per procurement, ever
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSED", "RELEASED"],
      default: "PENDING",
    },
    releasedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;