import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getWhy,
  getWhyAdmin,
  updateSection,
  createFeature,
  updateFeature,
  deleteFeature,
  reorderFeatures,
} from "../controllers/why.controller.js";

const router = Router();

router.get("/", getWhy);
router.get("/admin", protect, getWhyAdmin);
router.put("/section", protect, updateSection);

router.post("/features", protect, createFeature);
router.put("/features/reorder", protect, reorderFeatures);
router.put("/features/:id", protect, updateFeature);
router.delete("/features/:id", protect, deleteFeature);

export default router;
