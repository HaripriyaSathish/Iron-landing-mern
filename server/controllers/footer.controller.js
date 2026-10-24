import httpError from "../utils/httpError.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import {
  getFooterSettings,
  updateFooterSettings,
  SocialLink,
  SOCIAL_PLATFORMS,
} from "../models/footer.model.js";
import { getNavbarSettings, NavLink } from "../models/navbar.model.js";
import { Service } from "../models/services.model.js";
import { getContactSection } from "../models/contact.model.js";

const URL_RE = /^https?:\/\/\S+$/i;

function validateSocial(platform, url) {
  if (platform !== undefined && !SOCIAL_PLATFORMS.includes(platform)) {
    throw httpError(400, `platform must be one of: ${SOCIAL_PLATFORMS.join(", ")}`);
  }
  if (url !== undefined && !URL_RE.test(String(url).trim())) {
    throw httpError(400, "Link must start with http:// or https://");
  }
}

// Public: everything the footer shows, assembled from the sections it reuses
export async function getFooter(req, res) {
  const settings = await getFooterSettings();
  const [navbar, links, services, contact, socials] = await Promise.all([
    getNavbarSettings(),
    NavLink.findAll({ activeOnly: true }),
    Service.findAll({ activeOnly: true }),
    getContactSection(),
    SocialLink.findAll({ activeOnly: true }),
  ]);

  res.json({
    success: true,
    data: {
      settings,
      logo: { url: navbar?.logo_url ?? null, alt: navbar?.logo_alt ?? "" },
      links: links.map(({ label, target }) => ({ label, target })),
      services: services.slice(0, settings.services_limit).map(({ id, title }) => ({ id, title })),
      contact: contact && {
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        map_url: contact.map_url,
      },
      socials,
    },
  });
}

// Admin: footer text + all social links (including hidden)
export async function getFooterAdmin(req, res) {
  const [settings, socials] = await Promise.all([getFooterSettings(), SocialLink.findAll()]);
  res.json({ success: true, data: { settings, socials } });
}

export async function updateSettings(req, res) {
  const body = req.body ?? {};
  for (const key of ["links_title", "services_title", "contact_title", "copyright_text"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  const data = { ...body };
  if (body.services_limit !== undefined) {
    const limit = Number(body.services_limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw httpError(400, "Show 1 to 20 services");
    data.services_limit = limit;
  }
  res.json({ success: true, data: await updateFooterSettings(data) });
}

export async function createSocial(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["platform", "url"]);
  validateSocial(body.platform, body.url);
  const social = await SocialLink.create({ ...body, url: body.url.trim(), is_active: toBool(body.is_active) });
  res.status(201).json({ success: true, data: social });
}

export async function updateSocial(req, res) {
  const body = req.body ?? {};
  if (!(await SocialLink.findById(req.params.id))) throw httpError(404, "Social link not found");
  validateSocial(body.platform, body.url);
  const data = { ...body };
  if (body.url !== undefined) data.url = String(body.url).trim();
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  res.json({ success: true, data: await SocialLink.update(req.params.id, data) });
}

export async function deleteSocial(req, res) {
  if (!(await SocialLink.remove(req.params.id))) throw httpError(404, "Social link not found");
  res.json({ success: true, message: "Social link deleted" });
}

export async function reorderSocials(req, res) {
  await SocialLink.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await SocialLink.findAll() });
}
