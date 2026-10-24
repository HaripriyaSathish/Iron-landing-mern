import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import httpError from "../utils/httpError.js";
import { requireFields } from "../utils/validate.js";
import { sendMail } from "../utils/mailer.js";
import passwordChangedEmail from "../utils/emails/passwordChanged.js";
import {
  findAdminByEmail,
  findAdminWithPassword,
  updateAdminPassword,
} from "../models/admin.model.js";

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export async function login(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["email", "password"]);

  const admin = await findAdminByEmail(String(body.email).trim().toLowerCase());
  const valid = admin && (await bcrypt.compare(String(body.password), admin.password_hash));
  if (!valid) throw httpError(401, "Incorrect email or password");

  res.json({
    success: true,
    data: { token: signToken(admin.id), admin: { id: admin.id, name: admin.name, email: admin.email } },
  });
}

export async function me(req, res) {
  res.json({ success: true, data: req.admin });
}

export async function changePassword(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["currentPassword", "newPassword"]);
  if (String(body.newPassword).length < 8) throw httpError(400, "New password must be at least 8 characters");

  const admin = await findAdminWithPassword(req.admin.id);
  if (!(await bcrypt.compare(String(body.currentPassword), admin.password_hash))) {
    throw httpError(400, "Current password is incorrect");
  }
  await updateAdminPassword(admin.id, await bcrypt.hash(String(body.newPassword), 12));

  // Security alert email; the password change stands even if the email can't be sent
  const adminUrl = `${process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`}/admin`;
  const email = passwordChangedEmail({
    adminName: admin.name,
    username: admin.email,
    when: new Date(),
    ip: req.ip,
    userAgent: req.get("user-agent"),
    adminUrl,
  });
  const mail = await sendMail(email);
  if (!mail.sent && mail.reason !== "Email alerts are switched off") console.warn("Password alert email:", mail.reason);

  res.json({
    success: true,
    message: "Password updated",
    data: { emailSent: mail.sent, emailTo: mail.to ?? null, emailNote: mail.sent ? null : mail.reason },
  });
}
