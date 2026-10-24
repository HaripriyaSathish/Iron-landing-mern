import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getContact, updateContact } from "../controllers/contact.controller.js";

const router = Router();

router.get("/", getContact);
router.put("/", protect, updateContact);

export default router;
