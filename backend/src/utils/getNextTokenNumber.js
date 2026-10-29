import Counter from "../models/Counter.js";

export const getNextTokenNumber = async (scheduleId) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: `schedule:${scheduleId}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};