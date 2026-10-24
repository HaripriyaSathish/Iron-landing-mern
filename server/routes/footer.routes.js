import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getFooter,
  getFooterAdmin,
  updateSettings,
  createSocial,
  updateSocial,
  deleteSocial,
  reorderSocials,
} from "../controllers/footer.controller.js";

const router = Router();

router.get("/", getFooter);
router.get("/admin", protect, getFooterAdmin);
router.put("/settings", protect, updateSettings);

router.post("/socials", protect, createSocial);
router.put("/socials/reorder", protect, reorderSocials);
router.put("/socials/:id", protect, updateSocial);
router.delete("/socials/:id", protect, deleteSocial);

export default router;
