import db from "../config/db.js";
import createListModel from "./listModel.js";

const SECTION_FIELDS = ["tagline", "heading"];

export async function getHowSection() {
  const [[row]] = await db.query("SELECT * FROM how_section WHERE id = 1");
  return row || null;
}

export async function updateHowSection(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => SECTION_FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE how_section SET ? WHERE id = 1", [values]);
  return getHowSection();
}

export const HowStep = createListModel("how_steps", ["icon", "title", "description", "is_active"]);
