import db from "../config/db.js";

const FIELDS = ["enabled", "badge_text", "message", "link_text", "link_url", "ends_at"];

export async function getOfferBar() {
  const [[row]] = await db.query("SELECT * FROM offer_bar WHERE id = 1");
  return row || null;
}

export async function updateOfferBar(data) {
  const values = Object.fromEntries(Object.entries(data).filter(([key, value]) => FIELDS.includes(key) && value !== undefined));
  if (Object.keys(values).length) await db.query("UPDATE offer_bar SET ? WHERE id = 1", [values]);
  return getOfferBar();
}
