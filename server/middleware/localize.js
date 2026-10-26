import { getTranslator } from "../models/translation.model.js";

// ?lang=ta on a public request → req.translate(table, rows) swaps in that language's texts.
// Without ?lang (admin pages, default language) it hands the data back unchanged.
export async function localize(req, res, next) {
  req.translate = await getTranslator(req.query.lang);
  next();
}
