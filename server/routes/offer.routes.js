import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getOffer, getOfferAdmin, updateOffer } from "../controllers/offer.controller.js";

const router = Router();

router.get("/", getOffer);
router.get("/admin", protect, getOfferAdmin);
router.put("/", protect, updateOffer);

export default router;
