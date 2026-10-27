import httpError from "../utils/httpError.js";
import { toBool } from "../utils/validate.js";
import { getOfferBar, updateOfferBar } from "../models/offer.model.js";

// A link inside the page (#contact), a website, or a phone/WhatsApp/email link
const LINK_RE = /^(#\S*|https?:\/\/\S+|tel:\S+|mailto:\S+)$/i;

const isOver = (endsAt) => !!endsAt && new Date(endsAt).getTime() <= Date.now();

// Public: the strip's words, or nothing when it is switched off or the offer has ended
export async function getOffer(req, res) {
  const offer = await getOfferBar();
  if (!offer?.enabled || isOver(offer.ends_at)) return res.json({ success: true, data: null });
  const { badge_text, message, link_text, link_url, ends_at, updated_at } = req.translate("offer_bar", offer);
  res.json({ success: true, data: { badge_text, message, link_text, link_url, ends_at, updated_at } });
}

export async function getOfferAdmin(req, res) {
  res.json({ success: true, data: await getOfferBar() });
}

export async function updateOffer(req, res) {
  const body = req.body ?? {};
  const data = {};

  // Empty offer text: the strip shows just the badge and button
  if (body.message !== undefined) data.message = String(body.message).trim();
  for (const key of ["badge_text", "link_text", "link_url"]) {
    if (body[key] !== undefined) data[key] = String(body[key]).trim() || null;
  }
  if (data.message === "" && !(data.badge_text ?? body.badge_text)) {
    throw httpError(400, "Add a badge or some offer text");
  }
  if (data.link_url && !LINK_RE.test(data.link_url)) {
    throw httpError(400, "Button link must be a section (#contact) or start with https://");
  }
  if (body.enabled !== undefined) data.enabled = toBool(body.enabled);
  if (body.ends_at !== undefined) {
    data.ends_at = body.ends_at ? new Date(body.ends_at) : null;
    if (data.ends_at && Number.isNaN(data.ends_at.getTime())) throw httpError(400, "End time is not a valid date");
    data.ends_at = data.ends_at?.toISOString() ?? null;
  }

  res.json({ success: true, data: await updateOfferBar(data) });
}
