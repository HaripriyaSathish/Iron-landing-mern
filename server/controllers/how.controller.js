import httpError from "../utils/httpError.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { getHowSection, updateHowSection, HowStep } from "../models/how.model.js";

// Public: section heading + visible steps
export async function getHow(req, res) {
  const [section, steps] = await Promise.all([getHowSection(), HowStep.findAll({ activeOnly: true })]);
  res.json({ success: true, data: { section, steps } });
}

// Admin: includes hidden steps
export async function getHowAdmin(req, res) {
  const [section, steps] = await Promise.all([getHowSection(), HowStep.findAll()]);
  res.json({ success: true, data: { section, steps } });
}

export async function updateSection(req, res) {
  const body = req.body ?? {};
  for (const key of ["tagline", "heading"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  res.json({ success: true, data: await updateHowSection(body) });
}

export async function createStep(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["icon", "title", "description"]);
  const step = await HowStep.create({ ...body, is_active: toBool(body.is_active) });
  res.status(201).json({ success: true, data: step });
}

export async function updateStep(req, res) {
  const body = req.body ?? {};
  if (!(await HowStep.findById(req.params.id))) throw httpError(404, "Step not found");
  for (const key of ["icon", "title", "description"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  const data = { ...body };
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  res.json({ success: true, data: await HowStep.update(req.params.id, data) });
}

export async function deleteStep(req, res) {
  if (!(await HowStep.remove(req.params.id))) throw httpError(404, "Step not found");
  res.json({ success: true, message: "Step deleted" });
}

export async function reorderSteps(req, res) {
  await HowStep.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await HowStep.findAll() });
}
