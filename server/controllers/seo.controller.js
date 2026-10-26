import httpError from "../utils/httpError.js";
import { destroyImage } from "../utils/cloudinaryCleanup.js";
import { toBool } from "../utils/validate.js";
import { getSeoSettings, updateSeoSettings } from "../models/seo.model.js";

const TEXT_FIELDS = ["site_title", "meta_description", "meta_keywords", "og_title", "og_description", "canonical_url"];
// form field name -> column prefix
const IMAGES = { favicon: "favicon", og_image: "og_image" };

export async function getSeo(req, res) {
  res.json({ success: true, data: req.translate("seo_settings", await getSeoSettings()) });
}

// multipart/form-data: favicon, og_image (files, optional), remove_favicon, remove_og_image + text fields
export async function updateSeo(req, res) {
  const body = req.body ?? {};
  const current = await getSeoSettings();

  for (const key of ["site_title", "meta_description"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }

  const data = Object.fromEntries(TEXT_FIELDS.map((key) => [key, body[key]]));
  const replaced = [];

  for (const [field, prefix] of Object.entries(IMAGES)) {
    const file = req.files?.[field]?.[0];
    if (file) {
      data[`${prefix}_url`] = file.path;
      data[`${prefix}_public_id`] = file.filename;
    } else if (toBool(body[`remove_${field}`], false)) {
      data[`${prefix}_url`] = null;
      data[`${prefix}_public_id`] = null;
    } else continue;
    replaced.push(current?.[`${prefix}_public_id`]);
  }

  const seo = await updateSeoSettings(data);
  await Promise.all(replaced.map(destroyImage));

  res.json({ success: true, data: seo });
}
