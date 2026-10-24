import { Router } from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getServices,
  getServicesAdmin,
  updateSection,
  createService,
  updateService,
  deleteService,
  reorderServices,
} from "../controllers/services.controller.js";

const router = Router();

router.get("/", getServices);
router.get("/admin", protect, getServicesAdmin);
router.put("/section", protect, updateSection);

router.post("/", protect, upload.single("image"), createService);
router.put("/reorder", protect, reorderServices);
router.put("/:id", protect, upload.single("image"), updateService);
router.delete("/:id", protect, deleteService);

export default router;
