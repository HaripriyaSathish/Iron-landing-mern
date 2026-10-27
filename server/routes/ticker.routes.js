import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getTicker,
  getTickerAdmin,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
} from "../controllers/ticker.controller.js";

const router = Router();

router.get("/", getTicker);
router.get("/admin", protect, getTickerAdmin);

router.post("/items", protect, createItem);
router.put("/items/reorder", protect, reorderItems);
router.put("/items/:id", protect, updateItem);
router.delete("/items/:id", protect, deleteItem);

export default router;
