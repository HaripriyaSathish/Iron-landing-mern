import { Router } from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { getSeo, updateSeo } from "../controllers/seo.controller.js";

const router = Router();

router.get("/", getSeo);
router.put(
  "/",
  protect,
  upload.fields([
    { name: "favicon", maxCount: 1 },
    { name: "og_image", maxCount: 1 },
  ]),
  updateSeo
);

export default router;
