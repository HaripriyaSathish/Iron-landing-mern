import db from "../config/db.js";

export async function findAdminByEmail(email) {
  const [[row]] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
  return row || null;
}

export async function findAdminById(id) {
  const [[row]] = await db.query("SELECT id, name, email, created_at FROM admins WHERE id = ?", [id]);
  return row || null;
}

export async function findAdminWithPassword(id) {
  const [[row]] = await db.query("SELECT * FROM admins WHERE id = ?", [id]);
  return row || null;
}

export async function updateAdminPassword(id, passwordHash) {
  await db.query("UPDATE admins SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}
