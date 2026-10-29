import mongoose,{Schema} from "mongoose";

const mandiSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Mandi = mongoose.model("Mandi", mandiSchema);
export default Mandi;