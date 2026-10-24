import db from "../config/db.js";
import createListModel from "./listModel.js";

const SECTION_FIELDS = [
  "tagline",
  "heading",
  "content",
  "image_url",
  "image_public_id",
  "image_alt",
  "badge_value",
  "badge_label",
];

export async function getAboutSection() {
  const [[row]] = await db.query("SELECT * FROM about_section WHERE id = 1");
  return row || null;
}

export async function updateAboutSection(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => SECTION_FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE about_section SET ? WHERE id = 1", [values]);
  return getAboutSection();
}

export const AboutHighlight = createListModel("about_highlights", ["icon", "title", "is_active"]);
