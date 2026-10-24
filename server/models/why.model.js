import db from "../config/db.js";
import createListModel from "./listModel.js";

const SECTION_FIELDS = ["tagline", "heading"];

export async function getWhySection() {
  const [[row]] = await db.query("SELECT * FROM why_section WHERE id = 1");
  return row || null;
}

export async function updateWhySection(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => SECTION_FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE why_section SET ? WHERE id = 1", [values]);
  return getWhySection();
}

export const WhyFeature = createListModel("why_features", ["icon", "title", "description", "is_active"]);
