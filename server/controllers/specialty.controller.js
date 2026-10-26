import httpError from "../utils/httpError.js";
import { destroyImage } from "../utils/cloudinaryCleanup.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { SpecialtyBlock } from "../models/specialty.model.js";

// Text fields + optional image from multipart/form-data
function buildData(body, file) {
  const data = { ...body };
  delete data.image_url;
  delete data.image_public_id;
  for (const key of ["tagline", "intro", "points", "image_alt"]) {
    if (body[key] !== undefined) data[key] = String(body[key]).trim() || null;
  }
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  if (file) {
    data.image_url = file.path;
    data.image_public_id = file.filename;
  } else if (toBool(body.remove_image, false)) {
    data.image_url = null;
    data.image_public_id = null;
  }
  return data;
}

// Public: visible blocks in the visitor's language
export async function getSpecialties(req, res) {
  res.json({ success: true, data: req.translate("specialty_blocks", await SpecialtyBlock.findAll({ activeOnly: true })) });
}

export async function getSpecialtiesAdmin(req, res) {
  res.json({ success: true, data: await SpecialtyBlock.findAll() });
}

export async function createBlock(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["title"]);
  const data = buildData(body, req.file);
  data.is_active = toBool(body.is_active);
  res.status(201).json({ success: true, data: await SpecialtyBlock.create(data) });
}

export async function updateBlock(req, res) {
  const body = req.body ?? {};
  const current = await SpecialtyBlock.findById(req.params.id);
  if (!current) throw httpError(404, "Block not found");
  if (body.title !== undefined && !String(body.title).trim()) throw httpError(400, "title cannot be empty");

  const data = buildData(body, req.file);
  const block = await SpecialtyBlock.update(req.params.id, data);
  if (data.image_url !== undefined) await destroyImage(current.image_public_id);
  res.json({ success: true, data: block });
}

export async function deleteBlock(req, res) {
  const current = await SpecialtyBlock.findById(req.params.id);
  if (!current) throw httpError(404, "Block not found");
  await SpecialtyBlock.remove(req.params.id);
  await destroyImage(current.image_public_id);
  res.json({ success: true, message: "Block deleted" });
}

export async function reorderBlocks(req, res) {
  await SpecialtyBlock.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await SpecialtyBlock.findAll() });
}
