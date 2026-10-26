import { Router } from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getSpecialties,
  getSpecialtiesAdmin,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
} from "../controllers/specialty.controller.js";

const router = Router();

router.get("/", getSpecialties);
router.get("/admin", protect, getSpecialtiesAdmin);
router.post("/", protect, upload.single("image"), createBlock);
router.put("/reorder", protect, reorderBlocks);
router.put("/:id", protect, upload.single("image"), updateBlock);
router.delete("/:id", protect, deleteBlock);

export default router;
