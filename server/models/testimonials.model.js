import db from "../config/db.js";
import createListModel from "./listModel.js";

const SECTION_FIELDS = ["tagline", "heading"];

export async function getTestimonialsSection() {
  const [[row]] = await db.query("SELECT * FROM testimonials_section WHERE id = 1");
  return row || null;
}

export async function updateTestimonialsSection(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => SECTION_FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE testimonials_section SET ? WHERE id = 1", [values]);
  return getTestimonialsSection();
}

export const Testimonial = createListModel("testimonials", ["quote", "name", "role", "rating", "is_active"]);
