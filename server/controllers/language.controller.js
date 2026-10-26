import httpError from "../utils/httpError.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import {
  Language,
  UI_TEXT,
  isTranslatable,
  findLanguageByCode,
  getTranslationEditor,
  saveTranslations,
  renameLanguageCode,
  deleteTranslations,
} from "../models/translation.model.js";

// e.g. ta, fr, en, pt-BR
const CODE_RE = /^[a-z]{2,3}(-[a-z0-9]{2,4})?$/i;

const publicFields = ({ id, code, name, native_name, is_default }) => ({ id, code, name, native_name, is_default: !!is_default });

async function validateCode(code, currentId) {
  if (!CODE_RE.test(code)) throw httpError(400, "Language code must look like ta, fr or en");
  const existing = await findLanguageByCode(code);
  if (existing && existing.id !== Number(currentId)) throw httpError(400, `The code "${code}" is already used`);
}

const progress = (groups) => {
  const items = groups.flatMap((g) => g.blocks.flatMap((b) => b.items));
  return { total: items.length, done: items.filter((i) => i.value).length };
};

// Public: language switcher on the website
export async function getLanguages(req, res) {
  const languages = await Language.findAll({ activeOnly: true });
  res.json({ success: true, data: languages.map(publicFields) });
}

// Public: fixed website words (e.g. "Phone") in the visitor's language
export async function getUiText(req, res) {
  res.json({ success: true, data: req.translate("ui", UI_TEXT) });
}

// Admin: all languages with how much of the website each one covers
export async function getLanguagesAdmin(req, res) {
  const languages = await Language.findAll();
  const data = await Promise.all(
    languages.map(async (lang) => ({
      ...lang,
      progress: lang.is_default ? null : progress(await getTranslationEditor(lang.code)),
    }))
  );
  res.json({ success: true, data });
}

export async function createLanguage(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["code", "name", "native_name"]);
  const code = String(body.code).trim().toLowerCase();
  await validateCode(code);
  const language = await Language.create({
    code,
    name: String(body.name).trim(),
    native_name: String(body.native_name).trim(),
    is_active: toBool(body.is_active),
  });
  res.status(201).json({ success: true, data: language });
}

export async function updateLanguage(req, res) {
  const body = req.body ?? {};
  const current = await Language.findById(req.params.id);
  if (!current) throw httpError(404, "Language not found");

  const data = {};
  for (const key of ["name", "native_name"]) {
    if (body[key] === undefined) continue;
    if (!String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
    data[key] = String(body[key]).trim();
  }
  if (body.is_active !== undefined) {
    if (current.is_default && !toBool(body.is_active)) throw httpError(400, "The main language cannot be hidden");
    data.is_active = toBool(body.is_active);
  }
  if (body.code !== undefined) {
    const code = String(body.code).trim().toLowerCase();
    if (code !== current.code) {
      await validateCode(code, current.id);
      data.code = code;
    }
  }

  const language = await Language.update(req.params.id, data);
  // Translations are stored by code, so they follow the new one
  if (data.code) await renameLanguageCode(current.code, data.code);
  res.json({ success: true, data: language });
}

export async function deleteLanguage(req, res) {
  const current = await Language.findById(req.params.id);
  if (!current) throw httpError(404, "Language not found");
  if (current.is_default) throw httpError(400, "The main language cannot be deleted");
  await Language.remove(req.params.id);
  await deleteTranslations(current.code);
  res.json({ success: true, message: "Language deleted" });
}

export async function reorderLanguages(req, res) {
  await Language.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await Language.findAll() });
}

async function findTranslatable(code) {
  const lang = await findLanguageByCode(code);
  if (!lang) throw httpError(404, "Language not found");
  if (lang.is_default) throw httpError(400, `${lang.name} is the main language: edit it on the normal section pages`);
  return lang;
}

// Admin: every website text in the main language next to this language's version
export async function getTranslations(req, res) {
  const lang = await findTranslatable(req.params.code);
  const groups = await getTranslationEditor(lang.code);
  res.json({ success: true, data: { language: lang, groups, progress: progress(groups) } });
}

// body: { items: [{ entity, entity_id, field, value }] }; empty value = use the main-language text
export async function updateTranslations(req, res) {
  const lang = await findTranslatable(req.params.code);
  const items = req.body?.items;
  if (!Array.isArray(items)) throw httpError(400, "items must be a list");
  for (const item of items) {
    if (!isTranslatable(item.entity, item.field) || !Number.isInteger(Number(item.entity_id))) {
      throw httpError(400, "Unknown text in the list");
    }
    if (String(item.value ?? "").length > 5000) throw httpError(400, "A translation is too long");
  }
  await saveTranslations(
    lang.code,
    items.map((i) => ({ ...i, entity_id: Number(i.entity_id) }))
  );
  const groups = await getTranslationEditor(lang.code);
  res.json({ success: true, data: { language: lang, groups, progress: progress(groups) } });
}
