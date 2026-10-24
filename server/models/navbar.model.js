import db from "../config/db.js";
import createListModel from "./listModel.js";

const SETTINGS_FIELDS = ["logo_url", "logo_public_id", "logo_alt", "cta_text", "cta_link"];

export async function getNavbarSettings() {
  const [[row]] = await db.query("SELECT * FROM navbar_settings WHERE id = 1");
  return row || null;
}

export async function updateNavbarSettings(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => SETTINGS_FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE navbar_settings SET ? WHERE id = 1", [values]);
  return getNavbarSettings();
}

export const NavLink = createListModel("nav_links", ["label", "target", "is_active"]);
