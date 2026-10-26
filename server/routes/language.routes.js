import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getLanguages,
  getUiText,
  getLanguagesAdmin,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  reorderLanguages,
  getTranslations,
  updateTranslations,
} from "../controllers/language.controller.js";

const router = Router();

router.get("/", getLanguages);
router.get("/ui", getUiText);
router.get("/admin", protect, getLanguagesAdmin);

router.post("/", protect, createLanguage);
router.put("/reorder", protect, reorderLanguages);
router.put("/:id", protect, updateLanguage);
router.delete("/:id", protect, deleteLanguage);

router.get("/:code/translations", protect, getTranslations);
router.put("/:code/translations", protect, updateTranslations);

export default router;
