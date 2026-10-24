import mysql from "mysql2/promise";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

// One database interface for both setups:
//   - local development: MySQL (DB_HOST / DB_USER / ... in .env)
//   - Render: Neon PostgreSQL (DATABASE_URL=postgres://...)
// Models keep writing MySQL-style queries (`?` placeholders, `INSERT ... SET ?`, `UPDATE ... SET ?`)
// and get MySQL-style results ([rows] for SELECT, { insertId, affectedRows } for writes).
// For Postgres this file translates the query and the result.

const isPostgresUrl = (url) => /^postgres(ql)?:\/\//i.test(url || "");

// Postgres returns COUNT(*) and other 64-bit integers as strings; numbers keep the MySQL behaviour
pg.types.setTypeParser(20, (v) => parseInt(v, 10));

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);

// MySQL-style SQL + params → Postgres SQL ($1, $2 ...) + flat params
export function toPostgres(sql, params = []) {
  // mysql2 also accepts a single value/object instead of an array
  if (!Array.isArray(params)) params = [params];
  const values = [];
  const next = (v) => {
    values.push(v);
    return `$${values.length}`;
  };
  let i = 0;
  let text = sql;

  // INSERT INTO table SET ?  →  INSERT INTO table (a, b) VALUES ($1, $2) RETURNING id
  const insert = text.match(/^\s*INSERT INTO\s+(\w+)\s+SET\s+\?\s*$/i);
  if (insert && isPlainObject(params[0])) {
    const entries = Object.entries(params[0]);
    const cols = entries.map(([k]) => k).join(", ");
    const placeholders = entries.map(([, v]) => next(v)).join(", ");
    return { text: `INSERT INTO ${insert[1]} (${cols}) VALUES (${placeholders}) RETURNING id`, values };
  }

  // UPDATE table SET ? WHERE ...  →  UPDATE table SET a = $1, ..., updated_at = NOW() WHERE ...
  // (MySQL's ON UPDATE CURRENT_TIMESTAMP has no Postgres equivalent, so it is set here)
  const update = text.match(/^\s*UPDATE\s+(\w+)\s+SET\s+\?/i);
  if (update && isPlainObject(params[0])) {
    const sets = Object.entries(params[0]).map(([k, v]) => `${k} = ${next(v)}`);
    if (!("updated_at" in params[0])) sets.push("updated_at = NOW()");
    text = text.replace(/SET\s+\?/i, `SET ${sets.join(", ")}`);
    i = 1;
  }

  text = text.replace(/\?/g, () => next(params[i++]));
  return { text, values };
}

function pgResult(text, res) {
  if (/^\s*(SELECT|WITH|SHOW)/i.test(text)) return [res.rows, res.fields];
  return [{ insertId: res.rows?.[0]?.id, affectedRows: res.rowCount }, undefined];
}

function createPostgres(url) {
  // Neon strings carry sslmode/channel_binding; SSL is configured here instead (avoids pg's sslmode warning)
  const connection = new URL(url);
  connection.searchParams.delete("sslmode");
  connection.searchParams.delete("channel_binding");

  const pool = new pg.Pool({
    connectionString: connection.toString(),
    ssl: { rejectUnauthorized: true },
    enableChannelBinding: true,
    max: 10,
  });

  const run = async (client, sql, params) => {
    const { text, values } = toPostgres(sql, params);
    return pgResult(text, await client.query(text, values));
  };

  return {
    dialect: "postgres",
    query: (sql, params) => run(pool, sql, params),
    async getConnection() {
      const client = await pool.connect();
      return {
        query: (sql, params) => run(client, sql, params),
        beginTransaction: () => client.query("BEGIN"),
        commit: () => client.query("COMMIT"),
        rollback: () => client.query("ROLLBACK"),
        release: () => client.release(),
      };
    },
    end: () => pool.end(),
  };
}

function createMysql(config) {
  const pool = mysql.createPool({ waitForConnections: true, connectionLimit: 10, ...config });
  pool.dialect = "mysql";
  return pool;
}

// url: a postgres:// or mysql:// connection string; without one, the local DB_* settings are used
export function createDb(url = process.env.DATABASE_URL) {
  if (isPostgresUrl(url)) return createPostgres(url);
  if (url) return createMysql({ uri: url });
  return createMysql({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

const db = createDb();

export default db;
