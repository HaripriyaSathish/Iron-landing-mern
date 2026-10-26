import httpError from "../utils/httpError.js";
import { destroyImage } from "../utils/cloudinaryCleanup.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { getServicesSection, updateServicesSection, Service } from "../models/services.model.js";

// "" or null clears the price (hides it on the card); otherwise a whole number of rupees
function parsePrice(value) {
  if (value === undefined) return undefined;
  if (value === null || String(value).trim() === "") return null;
  const price = Number(value);
  if (!Number.isInteger(price) || price < 0) throw httpError(400, "Price must be a whole number of rupees");
  return price;
}

// Text fields + optional image from multipart/form-data
function buildServiceData(body, file) {
  const data = { ...body, price: parsePrice(body.price) };
  delete data.image_url;
  delete data.image_public_id;
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

// Public: section heading + visible service cards
export async function getServices(req, res) {
  const [section, services] = await Promise.all([getServicesSection(), Service.findAll({ activeOnly: true })]);
  res.json({
    success: true,
    data: { section: req.translate("services_section", section), services: req.translate("services", services) },
  });
}

// Admin: includes hidden services
export async function getServicesAdmin(req, res) {
  const [section, services] = await Promise.all([getServicesSection(), Service.findAll()]);
  res.json({ success: true, data: { section, services } });
}

export async function updateSection(req, res) {
  const body = req.body ?? {};
  for (const key of ["tagline", "heading"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  res.json({ success: true, data: await updateServicesSection(body) });
}

export async function createService(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["title", "description"]);
  const data = buildServiceData(body, req.file);
  data.is_active = toBool(body.is_active);
  res.status(201).json({ success: true, data: await Service.create(data) });
}

export async function updateService(req, res) {
  const body = req.body ?? {};
  const current = await Service.findById(req.params.id);
  if (!current) throw httpError(404, "Service not found");

  for (const key of ["title", "description"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }

  const data = buildServiceData(body, req.file);
  const service = await Service.update(req.params.id, data);
  if (data.image_url !== undefined) await destroyImage(current.image_public_id);

  res.json({ success: true, data: service });
}

export async function deleteService(req, res) {
  const current = await Service.findById(req.params.id);
  if (!current) throw httpError(404, "Service not found");
  await Service.remove(req.params.id);
  await destroyImage(current.image_public_id);
  res.json({ success: true, message: "Service deleted" });
}

export async function reorderServices(req, res) {
  await Service.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await Service.findAll() });
}
