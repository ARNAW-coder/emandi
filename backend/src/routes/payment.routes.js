import { Router } from "express";
import { getPaymentById, updatePaymentStatus } from "../controllers/payment.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { getMyMandiPayments } from "../controllers/payment.controller.js";

const router = Router();

router.get("/mine", protect, requireRole("MANDI_ADMIN"), getMyMandiPayments);
router.get("/:id", protect, getPaymentById);
router.patch("/:id/status", protect, requireRole("MANDI_ADMIN"), updatePaymentStatus);

export default router;