import db from "../config/db.js";

const FIELDS = [
  "tagline",
  "heading",
  "description",
  "primary_btn_text",
  "secondary_btn_text",
  "phone",
  "whatsapp",
  "whatsapp_message",
  "email",
  "address",
  "map_url",
  "business_hours",
];

export async function getContactSection() {
  const [[row]] = await db.query("SELECT * FROM contact_section WHERE id = 1");
  return row || null;
}

export async function updateContactSection(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE contact_section SET ? WHERE id = 1", [values]);
  return getContactSection();
}
