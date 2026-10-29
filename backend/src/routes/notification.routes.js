import { Router } from "express";
import { getMyNotifications, markAsRead } from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getMyNotifications);
router.patch("/:id/read", protect, markAsRead);

export default router;