import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { name, phone, password, role, mandiId,  email } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: "name, phone and password are required" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Phone number already registered" });
    }

    const user = await User.create({
      name,
      phone,
      password,
      role: role || "FARMER",
      mandiId: role === "MANDI_ADMIN" ? mandiId : null,
      email: email || null,
    });

    const token = generateToken(user);

    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "phone and password are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);
    
    res.status(200).json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  // req.user was already set by the `protect` middleware
  res.status(200).json({ success: true, data: { user: req.user } });
};