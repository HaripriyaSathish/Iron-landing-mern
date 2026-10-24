import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { login, me, changePassword } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.get("/me", protect, me);
router.put("/password", protect, changePassword);

export default router;
