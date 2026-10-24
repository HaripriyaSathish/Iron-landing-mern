import httpError from "../utils/httpError.js";
import { toBool } from "../utils/validate.js";
import { encrypt } from "../utils/secretBox.js";
import { isEmail, missingMailFields, sendMail } from "../utils/mailer.js";
import { getMailSettings, updateMailSettings } from "../models/mailSettings.model.js";

// The password never leaves the server: the panel only learns whether one is saved
function publicView(s) {
  const { smtp_pass_enc, ...rest } = s;
  return { ...rest, enabled: !!s.enabled, has_password: !!smtp_pass_enc, missing: missingMailFields(s) };
}

export async function getSettings(req, res) {
  res.json({ success: true, data: publicView(await getMailSettings()) });
}

export async function updateSettings(req, res) {
  const body = req.body ?? {};
  const data = {};

  for (const key of ["smtp_host", "smtp_user", "from_name"]) {
    if (body[key] !== undefined) data[key] = String(body[key]).trim() || null;
  }
  for (const key of ["from_email", "alert_email"]) {
    if (body[key] === undefined) continue;
    const value = String(body[key]).trim();
    if (value && !isEmail(value)) throw httpError(400, `Enter a valid ${key === "from_email" ? "sender" : "alert"} email`);
    data[key] = value || null;
  }
  if (body.smtp_port !== undefined) {
    const port = Number(body.smtp_port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw httpError(400, "Port must be a number like 587, 465 or 2525");
    data.smtp_port = port;
  }
  // Empty password field = keep the saved one
  if (body.smtp_pass) data.smtp_pass_enc = encrypt(body.smtp_pass);
  if (toBool(body.clear_password, false)) data.smtp_pass_enc = null;
  if (body.enabled !== undefined) data.enabled = toBool(body.enabled);

  const saved = await updateMailSettings(data);
  if (saved.enabled && missingMailFields(saved).length) {
    // Don't leave alerts "on" when they can't work
    await updateMailSettings({ enabled: false });
    throw httpError(400, `Saved, but alerts stay off until you fill in: ${missingMailFields(saved).join(", ")}`);
  }
  res.json({ success: true, data: publicView(saved) });
}

// Sends a test message with the saved settings (works even while alerts are switched off)
export async function sendTest(req, res) {
  const result = await sendMail({
    force: true,
    subject: "Iron Me Ka — test email",
    text: "Your email settings work. Password-change alerts will arrive at this address.",
    html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#262221">
      <h2 style="color:#741f3f;margin:0 0 8px">Your email settings work ✓</h2>
      <p style="margin:0">Password-change alerts for the Iron Me Ka admin panel will arrive at this address.</p>
    </div>`,
  });
  if (!result.sent) throw httpError(400, result.reason);
  res.json({ success: true, message: `Test email sent to ${result.to}` });
}
