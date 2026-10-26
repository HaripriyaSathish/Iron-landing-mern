import httpError from "../utils/httpError.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { QuickContact, CONTACT_TYPES } from "../models/quickContact.model.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{7,20}$/;

function validate(type, value) {
  if (!CONTACT_TYPES.includes(type)) throw httpError(400, `type must be one of: ${CONTACT_TYPES.join(", ")}`);
  if (type === "email" && !EMAIL_RE.test(value)) throw httpError(400, "Enter a valid email address");
  if (type !== "email" && !PHONE_RE.test(value)) throw httpError(400, "Enter a valid phone number");
}

export async function getContacts(req, res) {
  res.json({ success: true, data: req.translate("quick_contacts", await QuickContact.findAll({ activeOnly: true })) });
}

export async function getContactsAdmin(req, res) {
  res.json({ success: true, data: await QuickContact.findAll() });
}

export async function createContact(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["type", "label", "value"]);
  validate(body.type, String(body.value).trim());
  const contact = await QuickContact.create({ ...body, is_active: toBool(body.is_active) });
  res.status(201).json({ success: true, data: contact });
}

export async function updateContact(req, res) {
  const body = req.body ?? {};
  const current = await QuickContact.findById(req.params.id);
  if (!current) throw httpError(404, "Quick contact not found");

  validate(body.type ?? current.type, String(body.value ?? current.value).trim());
  const data = { ...body };
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  res.json({ success: true, data: await QuickContact.update(req.params.id, data) });
}

export async function deleteContact(req, res) {
  if (!(await QuickContact.remove(req.params.id))) throw httpError(404, "Quick contact not found");
  res.json({ success: true, message: "Quick contact deleted" });
}

export async function reorderContacts(req, res) {
  await QuickContact.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await QuickContact.findAll() });
}
