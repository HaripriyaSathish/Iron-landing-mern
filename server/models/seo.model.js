import db from "../config/db.js";

const FIELDS = [
  "site_title",
  "meta_description",
  "meta_keywords",
  "og_title",
  "og_description",
  "og_image_url",
  "og_image_public_id",
  "favicon_url",
  "favicon_public_id",
  "canonical_url",
];

export async function getSeoSettings() {
  const [[row]] = await db.query("SELECT * FROM seo_settings WHERE id = 1");
  return row || null;
}

export async function updateSeoSettings(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE seo_settings SET ? WHERE id = 1", [values]);
  return getSeoSettings();
}
