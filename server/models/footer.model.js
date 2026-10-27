import db from "../config/db.js";
import createListModel from "./listModel.js";

const FIELDS = [
  "about_text",
  "links_title",
  "services_title",
  "services_limit",
  "contact_title",
  "hours_short",
  "socials_title",
  "copyright_text",
];

export const SOCIAL_PLATFORMS = [
  "instagram",
  "youtube",
  "whatsapp",
  "telegram",
  "facebook",
  "twitter",
  "linkedin",
  "website",
];

export async function getFooterSettings() {
  const [[row]] = await db.query("SELECT * FROM footer_settings WHERE id = 1");
  return row || null;
}

export async function updateFooterSettings(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE footer_settings SET ? WHERE id = 1", [values]);
  return getFooterSettings();
}

export const SocialLink = createListModel("social_links", ["platform", "url", "is_active"]);
