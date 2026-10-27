// Usage: npm run db:init
// Creates all tables and seeds any table that is still empty.
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { schemaFor, migrationsFor } from "../db/schema.js";
import * as seed from "../db/seed.js";

async function isEmpty(table) {
  const [[row]] = await db.query(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(row.count) === 0;
}

async function seedList(table, rows) {
  if (!(await isEmpty(table))) return console.log(`- ${table}: already has data, skipped`);
  for (const [index, row] of rows.entries()) {
    await db.query(`INSERT INTO ${table} SET ?`, { ...row, sort_order: index + 1 });
  }
  console.log(`✓ ${table}: seeded ${rows.length} rows`);
}

async function seedSingle(table, row) {
  if (!(await isEmpty(table))) return console.log(`- ${table}: already has data, skipped`);
  await db.query(`INSERT INTO ${table} SET ?`, { id: 1, ...row });
  console.log(`✓ ${table}: seeded`);
}

async function seedAdmin() {
  if (!(await isEmpty("admins"))) return console.log("- admins: already has an admin, skipped");

  const { ADMIN_NAME = "Admin", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return console.warn("! admins: set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then re-run to create the first admin");
  }
  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db.query("INSERT INTO admins SET ?", { name: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), password_hash });
  console.log(`✓ admins: created ${ADMIN_EMAIL}`);
}

try {
  for (const statement of schemaFor(db.dialect)) await db.query(statement);
  for (const statement of migrationsFor(db.dialect)) {
    try {
      await db.query(statement);
    } catch (err) {
      // Column already added on an earlier run
      if (err.code !== "ER_DUP_FIELDNAME") throw err;
    }
  }
  console.log("✓ tables ready");

  await seedAdmin();

  await seedSingle("seo_settings", seed.seoSettings);
  await seedSingle("navbar_settings", seed.navbarSettings);

  await seedList("nav_links", seed.navLinks);
  await seedList("quick_contacts", seed.quickContacts);
  await seedList("hero_slides", seed.heroSlides);
  await seedSingle("about_section", seed.aboutSection);
  await seedList("about_highlights", seed.aboutHighlights);
  await seedSingle("services_section", seed.servicesSection);
  await seedList("services", seed.services);
  await seedSingle("why_section", seed.whySection);
  await seedList("why_features", seed.whyFeatures);
  await seedSingle("how_section", seed.howSection);
  await seedList("how_steps", seed.howSteps);
  await seedSingle("testimonials_section", seed.testimonialsSection);
  await seedList("testimonials", seed.testimonials);
  await seedSingle("contact_section", seed.contactSection);
  await seedSingle("footer_settings", seed.footerSettings);
  await seedList("social_links", seed.socialLinks);
  await seedSingle("offer_bar", seed.offerBar);
  await seedList("ticker_items", seed.tickerItems);
  await seedSingle("mail_settings", seed.mailSettings);
  await seedSingle("music_settings", seed.musicSettings);
  await seedList("languages", seed.languages);
} catch (err) {
  console.error("Database init failed:", err.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
