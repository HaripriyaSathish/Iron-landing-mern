import httpError from "./httpError.js";

export function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || String(body[f]).trim() === "");
  if (missing.length) throw httpError(400, `Missing required field(s): ${missing.join(", ")}`);
}

// multipart/form-data sends everything as strings
export function toBool(value, fallback = true) {
  if (value === undefined) return fallback;
  return value === true || value === "true" || value === "1" || value === 1;
}

export function parseIds(ids) {
  if (!Array.isArray(ids) || !ids.length || ids.some((id) => !Number.isInteger(Number(id)))) {
    throw httpError(400, "ids must be a non-empty array of numbers");
  }
  return ids.map(Number);
}
