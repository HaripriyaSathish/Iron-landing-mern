import db from "../config/db.js";

const FIELDS = ["enabled", "title", "music_url", "music_public_id", "volume", "autostart"];

export async function getMusicSettings() {
  const [[row]] = await db.query("SELECT * FROM music_settings WHERE id = 1");
  return row || null;
}

export async function updateMusicSettings(data) {
  const values = Object.fromEntries(Object.entries(data).filter(([key, value]) => FIELDS.includes(key) && value !== undefined));
  if (Object.keys(values).length) await db.query("UPDATE music_settings SET ? WHERE id = 1", [values]);
  return getMusicSettings();
}
