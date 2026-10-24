import db from "../config/db.js";

const FIELDS = ["enabled", "smtp_host", "smtp_port", "smtp_user", "smtp_pass_enc", "from_email", "from_name", "alert_email"];

export async function getMailSettings() {
  const [[row]] = await db.query("SELECT * FROM mail_settings WHERE id = 1");
  return row || null;
}

export async function updateMailSettings(data) {
  const values = Object.fromEntries(Object.entries(data).filter(([key, value]) => FIELDS.includes(key) && value !== undefined));
  if (Object.keys(values).length) await db.query("UPDATE mail_settings SET ? WHERE id = 1", [values]);
  return getMailSettings();
}
