import { Router } from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getAbout,
  getAboutAdmin,
  updateSection,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  reorderHighlights,
} from "../controllers/about.controller.js";

const router = Router();

router.get("/", getAbout);
router.get("/admin", protect, getAboutAdmin);
router.put("/", protect, upload.single("image"), updateSection);

router.post("/highlights", protect, createHighlight);
router.put("/highlights/reorder", protect, reorderHighlights);
router.put("/highlights/:id", protect, updateHighlight);
router.delete("/highlights/:id", protect, deleteHighlight);

export default router;
