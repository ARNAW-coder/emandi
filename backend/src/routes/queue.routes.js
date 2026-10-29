import { Router } from "express";
import { checkIn, getMyPosition, getQueueForSchedule,processNext,completeEntry} from "../controllers/queue.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/check-in", protect, requireRole("FARMER"), checkIn);
router.get("/my-position", protect, requireRole("FARMER"), getMyPosition);
router.get("/:scheduleId", protect, requireRole("MANDI_ADMIN"), getQueueForSchedule);
router.post("/:scheduleId/process", protect, requireRole("MANDI_ADMIN"), processNext);
router.post("/:queueEntryId/complete", protect, requireRole("MANDI_ADMIN"), completeEntry);

export default router;