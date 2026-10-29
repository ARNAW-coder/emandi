import Mandi from "../models/Mandi.js";

export const getMandis = async (req, res) => {
  try {
    const mandis = await Mandi.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: mandis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMandiById = async (req, res) => {
  try {
    const mandi = await Mandi.findById(req.params.id);
    if (!mandi) {
      return res.status(404).json({ success: false, message: "Mandi not found" });
    }
    res.status(200).json({ success: true, data: mandi });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};