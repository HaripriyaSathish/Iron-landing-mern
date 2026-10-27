// Usage: put TARGET_DATABASE_URL=postgres://... (your Neon string) in server/.env, then: npm run db:copy
// Copies every table from the local MySQL database to the target, replacing what is there.
// Images are not copied: they live on Cloudinary and the rows only hold their links.
import { createDb } from "../config/db.js";
import schema, { schemaFor, migrationsFor } from "../db/schema.js";

const targetUrl = process.env.TARGET_DATABASE_URL;
if (!targetUrl) {
  console.error("Set TARGET_DATABASE_URL in server/.env to your Neon connection string first.");
  process.exit(1);
}

// Local MySQL (DB_* settings) → target (Neon)
const source = createDb(null);
const target = createDb(targetUrl);
// Parents before children isn't needed (no foreign keys), schema order is fine
const tables = schema.map((sql) => sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1]);

try {
  for (const statement of schemaFor(target.dialect)) await target.query(statement);
  // Columns added since the target's tables were first created
  for (const statement of migrationsFor(target.dialect)) {
    try {
      await target.query(statement);
    } catch (err) {
      if (err.code !== "ER_DUP_FIELDNAME") throw err;
    }
  }

  for (const table of tables) {
    const [rows] = await source.query(`SELECT * FROM ${table} ORDER BY id`);
    await target.query(`DELETE FROM ${table}`);
    for (const row of rows) await target.query(`INSERT INTO ${table} SET ?`, row);
    if (target.dialect === "postgres") {
      // Next new row continues after the copied ids (single-row tables have no sequence; this is a no-op there)
      await target.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), (SELECT COALESCE(MAX(id), 1) FROM ${table}))`);
    }
    console.log(`✓ ${table}: ${rows.length} rows`);
  }
  console.log("Done. Your cloud database now matches your local one.");
} catch (err) {
  console.error("Copy failed:", err.message);
  process.exitCode = 1;
} finally {
  await source.end();
  await target.end();
}
