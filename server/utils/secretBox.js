import crypto from "crypto";

// AES-256-GCM for secrets saved from the admin panel (the SMTP password).
// The key comes from SECRETS_KEY, or JWT_SECRET when that isn't set. If the key changes,
// old values can't be decrypted and simply need to be typed in again.
const key = () => crypto.createHash("sha256").update(process.env.SECRETS_KEY || process.env.JWT_SECRET || "").digest();

export function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

// null when missing or unreadable (e.g. the key changed)
export function decrypt(boxed) {
  if (!boxed) return null;
  try {
    const [iv, tag, data] = boxed.split(".").map((p) => Buffer.from(p, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
