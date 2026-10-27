import db from "../config/db.js";
import createListModel from "./listModel.js";

export const Language = createListModel("languages", ["code", "name", "native_name", "is_active"]);

// Fixed words in the website code (not stored in any section). Edited per language like any other text.
export const UI_TEXT = {
  phone_label: "Phone",
  whatsapp_label: "WhatsApp",
  // Shown instead of the WhatsApp detail when it is a link rather than a number
  whatsapp_chat: "Chat with us",
  music_play: "Play music",
  music_pause: "Pause music",
  address_label: "Address",
  hours_label: "Business Hours",
};

// Everything a visitor reads, grouped like the admin sidebar and in website order.
// fields: [column, label, multiline?]. `title` names list rows in the admin ("Slide 2 · …"); `label` names a single-row block.
export const GROUPS = [
  {
    id: "menu",
    title: "Navbar & Menu",
    sources: [
      { table: "navbar_settings", single: true, fields: [["cta_text", "Top button text"]] },
      { table: "nav_links", title: "label", item: "Menu link", fields: [["label", "Link text"]] },
    ],
  },
  {
    id: "slider",
    title: "Hero Slider",
    sources: [
      {
        table: "hero_slides",
        title: "heading",
        item: "Slide",
        fields: [
          ["tagline", "Small heading"],
          ["heading", "Main heading"],
          ["description", "Description", true],
          ["primary_btn_text", "Main button"],
          ["secondary_btn_text", "Second button"],
        ],
      },
    ],
  },
  {
    id: "story",
    title: "About Us",
    sources: [
      {
        table: "about_section",
        single: true,
        fields: [
          ["tagline", "Small heading"],
          ["heading", "Main heading"],
          ["content", "Your story", true],
          ["badge_value", "Badge number"],
          ["badge_label", "Badge text"],
        ],
      },
      { table: "about_highlights", title: "title", item: "Highlight", fields: [["title", "Highlight"]] },
    ],
  },
  {
    id: "services",
    title: "Services & Prices",
    sources: [
      {
        table: "services_section",
        single: true,
        fields: [
          ["tagline", "Small heading"],
          ["heading", "Main heading"],
          ["subheading", "Sub heading", true],
          ["price_label", "Price label"],
          ["btn_text", "Card button"],
        ],
      },
      {
        table: "services",
        title: "title",
        item: "Service",
        fields: [
          ["title", "Service name"],
          ["description", "Description", true],
        ],
      },
    ],
  },
  {
    id: "specialties",
    title: "Specialties & B2B",
    sources: [
      {
        table: "specialty_blocks",
        title: "title",
        item: "Block",
        fields: [
          ["tagline", "Small heading"],
          ["title", "Main heading"],
          ["intro", "Introduction", true],
          ["points", "Points (one per line)", true],
        ],
      },
    ],
  },
  {
    id: "promise",
    title: "Why Choose Us",
    sources: [
      { table: "why_section", single: true, fields: [["tagline", "Small heading"], ["heading", "Main heading"]] },
      {
        table: "why_features",
        title: "title",
        item: "Reason",
        fields: [
          ["title", "Title"],
          ["description", "Description", true],
        ],
      },
    ],
  },
  {
    id: "process",
    title: "How It Works",
    sources: [
      { table: "how_section", single: true, fields: [["tagline", "Small heading"], ["heading", "Main heading"]] },
      {
        table: "how_steps",
        title: "title",
        item: "Step",
        fields: [
          ["title", "Title"],
          ["description", "Description", true],
        ],
      },
    ],
  },
  {
    id: "reviews",
    title: "Testimonials",
    sources: [
      {
        table: "testimonials_section",
        single: true,
        fields: [["tagline", "Small heading"], ["heading", "Main heading"]],
      },
      {
        table: "testimonials",
        title: "name",
        item: "Review",
        fields: [
          ["quote", "Review", true],
          ["name", "Customer name"],
          ["role", "Customer detail"],
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact & Booking",
    sources: [
      {
        table: "contact_section",
        single: true,
        fields: [
          ["tagline", "Small heading"],
          ["heading", "Main heading"],
          ["description", "Description", true],
          ["primary_btn_text", "Call button"],
          ["secondary_btn_text", "WhatsApp button"],
          ["whatsapp_message", "WhatsApp ready message", true],
          ["address", "Address", true],
          ["business_hours", "Business hours", true],
        ],
      },
      {
        table: "ui",
        single: true,
        label: "Website labels",
        fields: [
          ["phone_label", "Label: Phone"],
          ["whatsapp_label", "Label: WhatsApp"],
          ["whatsapp_chat", "WhatsApp link text"],
          ["music_play", "Music button: play"],
          ["music_pause", "Music button: pause"],
          ["address_label", "Label: Address"],
          ["hours_label", "Label: Business Hours"],
        ],
      },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    sources: [
      {
        table: "footer_settings",
        single: true,
        fields: [
          ["about_text", "About text", true],
          ["links_title", "Links heading"],
          ["services_title", "Services heading"],
          ["contact_title", "Contact heading"],
          ["hours_short", "Short hours"],
          ["socials_title", "Social icons heading"],
          ["copyright_text", "Copyright line"],
        ],
      },
    ],
  },
  {
    id: "offer",
    title: "Flash Offer",
    sources: [
      {
        table: "offer_bar",
        single: true,
        fields: [
          ["badge_text", "Badge"],
          ["message", "Offer text", true],
          ["link_text", "Button text"],
        ],
      },
    ],
  },
  {
    id: "quick-connect",
    title: "Floating Buttons",
    sources: [
      {
        table: "quick_contacts",
        title: "label",
        item: "Button",
        fields: [
          ["label", "Button label"],
          ["message", "WhatsApp ready message", true],
        ],
      },
    ],
  },
  {
    id: "branding",
    title: "Search & Branding",
    sources: [
      {
        table: "seo_settings",
        single: true,
        fields: [
          ["site_title", "Browser tab title"],
          ["meta_description", "Google description", true],
          ["meta_keywords", "Keywords", true],
          ["og_title", "Share title"],
          ["og_description", "Share description", true],
        ],
      },
    ],
  },
];

// table → translatable columns
const FIELDS_BY_TABLE = Object.fromEntries(
  GROUPS.flatMap((g) => g.sources).map((s) => [s.table, s.fields.map(([field]) => field)])
);

export const isTranslatable = (entity, field) => FIELDS_BY_TABLE[entity]?.includes(field) ?? false;

const keyOf = (entity, id, field) => `${entity}:${id}:${field}`;
const identity = (table, data) => data;

export async function findLanguageByCode(code) {
  const [[row]] = await db.query("SELECT * FROM languages WHERE code = ?", [code]);
  return row || null;
}

// Returns translate(table, rowOrRows): copies with this language's texts swapped in.
// The default language, an unknown or hidden code, or no code at all leaves the data as it is.
export async function getTranslator(code) {
  if (!code) return identity;
  const lang = await findLanguageByCode(String(code));
  if (!lang || lang.is_default || !lang.is_active) return identity;

  const [rows] = await db.query("SELECT entity, entity_id, field, value FROM translations WHERE lang_code = ?", [
    lang.code,
  ]);
  const texts = new Map(rows.map((r) => [keyOf(r.entity, r.entity_id, r.field), r.value]));

  const translateRow = (table, row) => {
    if (!row) return row;
    const copy = { ...row };
    for (const field of FIELDS_BY_TABLE[table] ?? []) {
      const text = texts.get(keyOf(table, row.id ?? 0, field));
      if (text) copy[field] = text;
    }
    return copy;
  };

  return (table, data) => (Array.isArray(data) ? data.map((row) => translateRow(table, row)) : translateRow(table, data));
}

async function loadSource({ table, single }) {
  if (table === "ui") return [{ id: 0, ...UI_TEXT }];
  const [rows] = await db.query(`SELECT * FROM ${table} ${single ? "WHERE id = 1" : "ORDER BY sort_order, id"}`);
  return rows;
}

// Admin editor: every default-language text next to its translation, grouped by section.
// Empty default-language texts are left out (nothing to translate).
export async function getTranslationEditor(code) {
  const [saved] = await db.query("SELECT entity, entity_id, field, value FROM translations WHERE lang_code = ?", [code]);
  const texts = new Map(saved.map((r) => [keyOf(r.entity, r.entity_id, r.field), r.value]));

  return Promise.all(
    GROUPS.map(async (group) => {
      const blocks = [];
      for (const source of group.sources) {
        const rows = await loadSource(source);
        rows.forEach((row, index) => {
          const items = source.fields
            .filter(([field]) => String(row[field] ?? "").trim())
            .map(([field, label, multiline]) => ({
              entity: source.table,
              entity_id: row.id ?? 0,
              field,
              label,
              multiline: !!multiline,
              source: String(row[field]),
              value: texts.get(keyOf(source.table, row.id ?? 0, field)) ?? "",
            }));
          if (!items.length) return;
          blocks.push({
            key: `${source.table}:${row.id ?? 0}`,
            title: source.single ? source.label ?? null : `${source.item} ${index + 1}${row[source.title] ? ` · ${row[source.title]}` : ""}`,
            hidden: source.single ? false : !row.is_active,
            items,
          });
        });
      }
      return { id: group.id, title: group.title, blocks };
    })
  );
}

// Upserts translations; an empty value removes the translation (the default text shows again)
export async function saveTranslations(code, items) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const { entity, entity_id, field, value } of items) {
      const where = [code, entity, entity_id, field];
      await conn.query(
        "DELETE FROM translations WHERE lang_code = ? AND entity = ? AND entity_id = ? AND field = ?",
        where
      );
      const text = String(value ?? "").trim();
      if (text) await conn.query("INSERT INTO translations SET ?", { lang_code: code, entity, entity_id, field, value: text });
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Translated-text count per language code
export async function countTranslations() {
  const [rows] = await db.query("SELECT lang_code, COUNT(*) AS count FROM translations GROUP BY lang_code");
  return Object.fromEntries(rows.map((r) => [r.lang_code, Number(r.count)]));
}

export async function renameLanguageCode(from, to) {
  await db.query("UPDATE translations SET lang_code = ? WHERE lang_code = ?", [to, from]);
}

export async function deleteTranslations(code) {
  await db.query("DELETE FROM translations WHERE lang_code = ?", [code]);
}
