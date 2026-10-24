import httpError from "../utils/httpError.js";
import { destroyImage } from "../utils/cloudinaryCleanup.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { getAboutSection, updateAboutSection, AboutHighlight } from "../models/about.model.js";

// Public: section text + visible highlight cards
export async function getAbout(req, res) {
  const [section, highlights] = await Promise.all([getAboutSection(), AboutHighlight.findAll({ activeOnly: true })]);
  res.json({ success: true, data: { section, highlights } });
}

// Admin: includes hidden highlights
export async function getAboutAdmin(req, res) {
  const [section, highlights] = await Promise.all([getAboutSection(), AboutHighlight.findAll()]);
  res.json({ success: true, data: { section, highlights } });
}

// multipart/form-data: image (file, optional), remove_image + text fields
export async function updateSection(req, res) {
  const body = req.body ?? {};
  const current = await getAboutSection();

  for (const key of ["tagline", "heading", "content"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }

  const data = { ...body };
  delete data.image_url;
  delete data.image_public_id;

  if (req.file) {
    data.image_url = req.file.path;
    data.image_public_id = req.file.filename;
  } else if (toBool(body.remove_image, false)) {
    data.image_url = null;
    data.image_public_id = null;
  }

  const section = await updateAboutSection(data);
  if (data.image_url !== undefined) await destroyImage(current?.image_public_id);

  res.json({ success: true, data: section });
}

export async function createHighlight(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["icon", "title"]);
  const highlight = await AboutHighlight.create({ ...body, is_active: toBool(body.is_active) });
  res.status(201).json({ success: true, data: highlight });
}

export async function updateHighlight(req, res) {
  const body = req.body ?? {};
  if (!(await AboutHighlight.findById(req.params.id))) throw httpError(404, "Highlight not found");
  const data = { ...body };
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  res.json({ success: true, data: await AboutHighlight.update(req.params.id, data) });
}

export async function deleteHighlight(req, res) {
  if (!(await AboutHighlight.remove(req.params.id))) throw httpError(404, "Highlight not found");
  res.json({ success: true, message: "Highlight deleted" });
}

export async function reorderHighlights(req, res) {
  await AboutHighlight.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await AboutHighlight.findAll() });
}
