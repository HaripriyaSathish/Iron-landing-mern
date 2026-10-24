import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getSettings, updateSettings, sendTest } from "../controllers/mailSettings.controller.js";

// Admin only: everything here needs a login
const router = Router();

router.get("/", protect, getSettings);
router.put("/", protect, updateSettings);
router.post("/test", protect, sendTest);

export default router;
