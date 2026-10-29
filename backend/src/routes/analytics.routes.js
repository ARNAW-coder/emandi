import { Router } from "express";
import { getOverview, getMandiDensity } from "../controllers/analytics.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/overview", protect, requireRole("GOVT_OFFICER"), getOverview);
router.get("/mandi-density", protect, requireRole("GOVT_OFFICER"), getMandiDensity);

export default router;