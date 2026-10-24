import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getTestimonials,
  getTestimonialsAdmin,
  updateSection,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from "../controllers/testimonials.controller.js";

const router = Router();

router.get("/", getTestimonials);
router.get("/admin", protect, getTestimonialsAdmin);
router.put("/section", protect, updateSection);

router.post("/", protect, createTestimonial);
router.put("/reorder", protect, reorderTestimonials);
router.put("/:id", protect, updateTestimonial);
router.delete("/:id", protect, deleteTestimonial);

export default router;
