import httpError from "../utils/httpError.js";
import { destroyImage } from "../utils/cloudinaryCleanup.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { HeroSlide } from "../models/heroSlide.model.js";

export async function getSlides(req, res) {
  res.json({ success: true, data: await HeroSlide.findAll({ activeOnly: true }) });
}

export async function getSlidesAdmin(req, res) {
  res.json({ success: true, data: await HeroSlide.findAll() });
}

// multipart/form-data: image (file, optional) + text fields
export async function createSlide(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["tagline", "heading", "description"]);

  const data = { ...body, is_active: toBool(body.is_active) };
  delete data.image_url;
  delete data.image_public_id;
  if (req.file) {
    data.image_url = req.file.path;
    data.image_public_id = req.file.filename;
  }
  res.status(201).json({ success: true, data: await HeroSlide.create(data) });
}

// multipart/form-data: image (file, optional), remove_image, + any text fields
export async function updateSlide(req, res) {
  const body = req.body ?? {};
  const current = await HeroSlide.findById(req.params.id);
  if (!current) throw httpError(404, "Slide not found");

  for (const key of ["tagline", "heading", "description"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }

  const data = { ...body };
  delete data.image_url;
  delete data.image_public_id;
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);

  if (req.file) {
    data.image_url = req.file.path;
    data.image_public_id = req.file.filename;
  } else if (toBool(body.remove_image, false)) {
    data.image_url = null;
    data.image_public_id = null;
  }

  const slide = await HeroSlide.update(req.params.id, data);
  if (data.image_url !== undefined) await destroyImage(current.image_public_id);

  res.json({ success: true, data: slide });
}

export async function deleteSlide(req, res) {
  const current = await HeroSlide.findById(req.params.id);
  if (!current) throw httpError(404, "Slide not found");
  await HeroSlide.remove(req.params.id);
  await destroyImage(current.image_public_id);
  res.json({ success: true, message: "Slide deleted" });
}

export async function reorderSlides(req, res) {
  await HeroSlide.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await HeroSlide.findAll() });
}
