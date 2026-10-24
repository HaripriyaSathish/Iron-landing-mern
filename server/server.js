import app from "./app.js";
import db from "./config/db.js";

const PORT = process.env.PORT || 5000;

try {
  await db.query("SELECT 1");
  console.log("MySQL connected");
} catch (err) {
  console.error("MySQL connection failed:", err.message);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));