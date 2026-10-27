import httpError from "../utils/httpError.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import { TickerItem } from "../models/ticker.model.js";

// Public: visible lines only
export async function getTicker(req, res) {
  const items = await TickerItem.findAll({ activeOnly: true });
  res.json({ success: true, data: req.translate("ticker_items", items).map(({ id, icon, text }) => ({ id, icon, text })) });
}

// Admin: includes hidden lines
export async function getTickerAdmin(req, res) {
  res.json({ success: true, data: await TickerItem.findAll() });
}

export async function createItem(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["icon", "text"]);
  const item = await TickerItem.create({ ...body, text: String(body.text).trim(), is_active: toBool(body.is_active) });
  res.status(201).json({ success: true, data: item });
}

export async function updateItem(req, res) {
  const body = req.body ?? {};
  if (!(await TickerItem.findById(req.params.id))) throw httpError(404, "Line not found");
  for (const key of ["icon", "text"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  const data = { ...body };
  if (body.text !== undefined) data.text = String(body.text).trim();
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  res.json({ success: true, data: await TickerItem.update(req.params.id, data) });
}

export async function deleteItem(req, res) {
  if (!(await TickerItem.remove(req.params.id))) throw httpError(404, "Line not found");
  res.json({ success: true, message: "Line deleted" });
}

export async function reorderItems(req, res) {
  await TickerItem.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await TickerItem.findAll() });
}
