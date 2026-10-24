import httpError from "../utils/httpError.js";
import { destroyImage } from "../utils/cloudinaryCleanup.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { getNavbarSettings, updateNavbarSettings, NavLink } from "../models/navbar.model.js";

// Public: what the landing page navbar needs
export async function getNavbar(req, res) {
  const [settings, links] = await Promise.all([getNavbarSettings(), NavLink.findAll({ activeOnly: true })]);
  res.json({ success: true, data: { settings, links } });
}

// Admin: includes hidden links
export async function getNavbarAdmin(req, res) {
  const [settings, links] = await Promise.all([getNavbarSettings(), NavLink.findAll()]);
  res.json({ success: true, data: { settings, links } });
}

// multipart/form-data: logo (file, optional), logo_alt, cta_text, cta_link, remove_logo
export async function updateSettings(req, res) {
  const body = req.body ?? {};
  const current = await getNavbarSettings();
  const data = { logo_alt: body.logo_alt, cta_text: body.cta_text, cta_link: body.cta_link };

  for (const key of ["cta_text", "cta_link"]) {
    if (data[key] !== undefined && !String(data[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }

  if (req.file) {
    data.logo_url = req.file.path;
    data.logo_public_id = req.file.filename;
  } else if (toBool(body.remove_logo, false)) {
    data.logo_url = null;
    data.logo_public_id = null;
  }

  const settings = await updateNavbarSettings(data);
  if (data.logo_url !== undefined) await destroyImage(current?.logo_public_id);

  res.json({ success: true, data: settings });
}

export async function createLink(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["label", "target"]);
  const link = await NavLink.create({ ...body, is_active: toBool(body.is_active) });
  res.status(201).json({ success: true, data: link });
}

export async function updateLink(req, res) {
  const body = req.body ?? {};
  if (!(await NavLink.findById(req.params.id))) throw httpError(404, "Menu link not found");
  const data = { ...body };
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  res.json({ success: true, data: await NavLink.update(req.params.id, data) });
}

export async function deleteLink(req, res) {
  if (!(await NavLink.remove(req.params.id))) throw httpError(404, "Menu link not found");
  res.json({ success: true, message: "Menu link deleted" });
}

export async function reorderLinks(req, res) {
  await NavLink.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await NavLink.findAll() });
}
