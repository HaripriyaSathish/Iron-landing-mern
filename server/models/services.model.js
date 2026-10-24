import db from "../config/db.js";
import createListModel from "./listModel.js";

const SECTION_FIELDS = ["tagline", "heading", "subheading", "price_label", "btn_text", "btn_link"];

export async function getServicesSection() {
  const [[row]] = await db.query("SELECT * FROM services_section WHERE id = 1");
  return row || null;
}

export async function updateServicesSection(data) {
  const values = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => SECTION_FIELDS.includes(key) && value !== undefined)
  );
  if (Object.keys(values).length) await db.query("UPDATE services_section SET ? WHERE id = 1", [values]);
  return getServicesSection();
}

export const Service = createListModel("services", [
  "title",
  "description",
  "price",
  "image_url",
  "image_public_id",
  "image_alt",
  "is_active",
]);
