import httpError from "../utils/httpError.js";
import { getContactSection, updateContactSection } from "../models/contact.model.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{7,20}$/;
const URL_RE = /^https?:\/\/\S+$/i;

export async function getContact(req, res) {
  res.json({ success: true, data: req.translate("contact_section", await getContactSection()) });
}

export async function updateContact(req, res) {
  const body = req.body ?? {};
  const data = { ...body };

  for (const key of ["tagline", "heading"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  // Optional fields: empty string clears them
  for (const key of ["phone", "whatsapp", "email", "map_url", "address", "business_hours", "whatsapp_message"]) {
    if (body[key] !== undefined && !String(body[key] ?? "").trim()) data[key] = null;
  }
  if (data.phone && !PHONE_RE.test(data.phone)) throw httpError(400, "Enter a valid phone number");
  if (data.whatsapp && !PHONE_RE.test(data.whatsapp)) throw httpError(400, "Enter a valid WhatsApp number");
  if (data.email && !EMAIL_RE.test(data.email)) throw httpError(400, "Enter a valid email address");
  if (data.map_url && !URL_RE.test(data.map_url)) throw httpError(400, "Map link must start with http:// or https://");

  res.json({ success: true, data: await updateContactSection(data) });
}
