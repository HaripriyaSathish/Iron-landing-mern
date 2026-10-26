import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Music files. Cloudinary keeps audio under its "video" type; a video file is accepted too
// and only its sound is played (see music.controller.js).
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "iron_landing/music",
    resource_type: "video",
    allowed_formats: ["mp3", "mpeg", "m4a", "aac", "wav", "ogg", "mp4", "mov", "webm"],
  },
});

export default multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 }, // 40 MB
});
