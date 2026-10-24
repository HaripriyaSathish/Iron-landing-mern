import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getContacts,
  getContactsAdmin,
  createContact,
  updateContact,
  deleteContact,
  reorderContacts,
} from "../controllers/quickContact.controller.js";

const router = Router();

router.get("/", getContacts);
router.get("/admin", protect, getContactsAdmin);
router.post("/", protect, createContact);
router.put("/reorder", protect, reorderContacts);
router.put("/:id", protect, updateContact);
router.delete("/:id", protect, deleteContact);

export default router;
