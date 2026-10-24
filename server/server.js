import app from "./app.js";
import db from "./config/db.js";

const PORT = process.env.PORT || 5000;

try {
  await db.query("SELECT 1");
  console.log(`Database connected (${db.dialect})`);
} catch (err) {
  console.error("Database connection failed:", err.message);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));