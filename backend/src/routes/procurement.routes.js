import { Router } from "express";
import { createProcurement, getProcurementById } from "../controllers/procurement.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { getMyProcurements } from "../controllers/procurement.controller.js";

const router = Router();

router.post("/", protect, requireRole("MANDI_ADMIN"), createProcurement);
router.get("/my", protect, requireRole("FARMER"), getMyProcurements);
router.get("/:id", protect, getProcurementById); // must come AFTER /my

export default router;