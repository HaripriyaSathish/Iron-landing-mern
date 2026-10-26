import { Router } from "express";
import { protect } from "../middleware/auth.js";
import uploadAudio from "../middleware/uploadAudio.js";
import { getMusic, getMusicAdmin, updateMusic } from "../controllers/music.controller.js";

const router = Router();

router.get("/", getMusic);
router.get("/admin", protect, getMusicAdmin);
router.put("/", protect, uploadAudio.single("music"), updateMusic);

export default router;
