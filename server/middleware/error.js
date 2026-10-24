import multer from "multer";
import { destroyImage } from "../utils/cloudinaryCleanup.js";

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";

  if (err instanceof multer.MulterError) {
    status = 400;
    if (err.code === "LIMIT_FILE_SIZE") message = "Image must be 5 MB or smaller";
  }
  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  }

  // Request failed after an image was uploaded: don't leave it orphaned in Cloudinary
  const uploaded = [req.file, ...Object.values(req.files || {}).flat()].filter(Boolean);
  uploaded.forEach((file) => destroyImage(file.filename));

  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message: status === 500 ? "Internal server error" : message });
}
