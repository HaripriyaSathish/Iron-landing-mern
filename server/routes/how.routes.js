import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getHow,
  getHowAdmin,
  updateSection,
  createStep,
  updateStep,
  deleteStep,
  reorderSteps,
} from "../controllers/how.controller.js";

const router = Router();

router.get("/", getHow);
router.get("/admin", protect, getHowAdmin);
router.put("/section", protect, updateSection);

router.post("/steps", protect, createStep);
router.put("/steps/reorder", protect, reorderSteps);
router.put("/steps/:id", protect, updateStep);
router.delete("/steps/:id", protect, deleteStep);

export default router;
