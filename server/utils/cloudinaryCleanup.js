import cloudinary from "../config/cloudinary.js";

// Best-effort removal of a replaced/deleted image. Never blocks the request.
export async function destroyImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary cleanup failed:", err.message);
  }
}

// Same for music (stored as Cloudinary "video" resources)
export async function destroyAudio(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (err) {
    console.error("Cloudinary cleanup failed:", err.message);
  }
}
