import db from "../config/db.js";

// Shared CRUD for ordered, toggle-able lists (nav links, slides, cards...).
// `fields` whitelists which columns may be written from request data.
export default function createListModel(table, fields) {
  const pick = (data) =>
    Object.fromEntries(Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined));

  return {
    async findAll({ activeOnly = false } = {}) {
      const where = activeOnly ? "WHERE is_active = TRUE" : "";
      const [rows] = await db.query(`SELECT * FROM ${table} ${where} ORDER BY sort_order, id`);
      return rows;
    },

    async findById(id) {
      const [[row]] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      return row || null;
    },

    async create(data) {
      const [[{ next }]] = await db.query(`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM ${table}`);
      const [result] = await db.query(`INSERT INTO ${table} SET ?`, { sort_order: next, ...pick(data) });
      return this.findById(result.insertId);
    },

    async update(id, data) {
      const values = pick(data);
      if (Object.keys(values).length) await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [values, id]);
      return this.findById(id);
    },

    async remove(id) {
      const [result] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    },

    // ids in the new display order
    async reorder(ids) {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        for (const [index, id] of ids.entries()) {
          await conn.query(`UPDATE ${table} SET sort_order = ? WHERE id = ?`, [index + 1, id]);
        }
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    },
  };
}
