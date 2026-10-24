// Sends email over SMTP (nodemailer) using the settings saved in the admin panel (Email Alerts page).
// Port 465 uses SSL; other ports use STARTTLS. Nothing is sent while alerts are switched off
// or incomplete; callers always carry on either way.
import nodemailer from "nodemailer";
import { getMailSettings } from "../models/mailSettings.model.js";
import { decrypt } from "./secretBox.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value) => EMAIL_RE.test(String(value ?? ""));

// What still needs filling in before email can go out (empty = ready)
export function missingMailFields(settings) {
  const missing = [];
  if (!settings?.smtp_host) missing.push("SMTP server");
  if (!settings?.smtp_user) missing.push("username");
  if (!decrypt(settings?.smtp_pass_enc)) missing.push("password");
  if (!isEmail(settings?.from_email)) missing.push("sender email");
  if (!isEmail(settings?.alert_email)) missing.push("alert email");
  return missing;
}

export async function sendMail({ subject, html, text, to, settings, force = false }) {
  const s = settings ?? (await getMailSettings());
  if (!force && !s?.enabled) return { sent: false, reason: "Email alerts are switched off" };
  const missing = missingMailFields(s);
  if (missing.length) return { sent: false, reason: `Email setup is missing: ${missing.join(", ")}` };

  const port = Number(s.smtp_port) || 587;
  const transporter = nodemailer.createTransport({
    host: s.smtp_host,
    port,
    secure: port === 465,
    auth: { user: s.smtp_user, pass: decrypt(s.smtp_pass_enc) },
    // Fail fast instead of hanging when a host blocks the port
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    await transporter.sendMail({
      from: { name: s.from_name || "Iron Me Ka", address: s.from_email },
      to: to || s.alert_email,
      subject,
      html,
      text,
    });
    return { sent: true, to: to || s.alert_email };
  } catch (err) {
    return { sent: false, reason: `Email could not be sent: ${err.message}` };
  }
}
