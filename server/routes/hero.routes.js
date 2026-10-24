import { Router } from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getSlides,
  getSlidesAdmin,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
} from "../controllers/hero.controller.js";

const router = Router();

router.get("/", getSlides);
router.get("/admin", protect, getSlidesAdmin);
router.post("/", protect, upload.single("image"), createSlide);
router.put("/reorder", protect, reorderSlides);
router.put("/:id", protect, upload.single("image"), updateSlide);
router.delete("/:id", protect, deleteSlide);

export default router;
