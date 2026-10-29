import { Router } from "express";
import { getMandis, getMandiById } from "../controllers/mandi.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getMandis);
router.get("/:id", protect, getMandiById);

export default router;