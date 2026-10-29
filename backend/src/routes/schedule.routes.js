import { Router } from "express";
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  closeSchedule,
} from "../controllers/schedule.controller.js";

import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, requireRole("MANDI_ADMIN"), createSchedule);
router.get("/", protect, getSchedules);
router.get("/:id", protect, getScheduleById);
router.patch("/:id", protect, requireRole("MANDI_ADMIN"), updateSchedule);
router.patch("/:id/close", protect, requireRole("MANDI_ADMIN"), closeSchedule);

export default router;