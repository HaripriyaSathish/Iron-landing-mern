import { Router } from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getNavbar,
  getNavbarAdmin,
  updateSettings,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
} from "../controllers/navbar.controller.js";

const router = Router();

router.get("/", getNavbar);
router.get("/admin", protect, getNavbarAdmin);
router.put("/settings", protect, upload.single("logo"), updateSettings);

router.post("/links", protect, createLink);
router.put("/links/reorder", protect, reorderLinks);
router.put("/links/:id", protect, updateLink);
router.delete("/links/:id", protect, deleteLink);

export default router;
