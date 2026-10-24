import httpError from "../utils/httpError.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { getWhySection, updateWhySection, WhyFeature } from "../models/why.model.js";

// Public: section heading + visible feature cards
export async function getWhy(req, res) {
  const [section, features] = await Promise.all([getWhySection(), WhyFeature.findAll({ activeOnly: true })]);
  res.json({ success: true, data: { section, features } });
}

// Admin: includes hidden features
export async function getWhyAdmin(req, res) {
  const [section, features] = await Promise.all([getWhySection(), WhyFeature.findAll()]);
  res.json({ success: true, data: { section, features } });
}

export async function updateSection(req, res) {
  const body = req.body ?? {};
  for (const key of ["tagline", "heading"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  res.json({ success: true, data: await updateWhySection(body) });
}

export async function createFeature(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["icon", "title", "description"]);
  const feature = await WhyFeature.create({ ...body, is_active: toBool(body.is_active) });
  res.status(201).json({ success: true, data: feature });
}

export async function updateFeature(req, res) {
  const body = req.body ?? {};
  if (!(await WhyFeature.findById(req.params.id))) throw httpError(404, "Reason not found");
  for (const key of ["icon", "title", "description"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  const data = { ...body };
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  res.json({ success: true, data: await WhyFeature.update(req.params.id, data) });
}

export async function deleteFeature(req, res) {
  if (!(await WhyFeature.remove(req.params.id))) throw httpError(404, "Reason not found");
  res.json({ success: true, message: "Reason deleted" });
}

export async function reorderFeatures(req, res) {
  await WhyFeature.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await WhyFeature.findAll() });
}
