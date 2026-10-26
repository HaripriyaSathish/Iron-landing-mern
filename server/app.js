import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import navbarRoutes from "./routes/navbar.routes.js";
import quickContactRoutes from "./routes/quickContact.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import seoRoutes from "./routes/seo.routes.js";
import aboutRoutes from "./routes/about.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import whyRoutes from "./routes/why.routes.js";
import howRoutes from "./routes/how.routes.js";
import testimonialsRoutes from "./routes/testimonials.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import footerRoutes from "./routes/footer.routes.js";
import mailSettingsRoutes from "./routes/mailSettings.routes.js";
import languageRoutes from "./routes/language.routes.js";
import { localize } from "./middleware/localize.js";
import { notFound, errorHandler } from "./middleware/error.js";
dotenv.config();

const app = express();
// Behind Render's proxy: lets req.ip show the visitor's address (used in security alert emails)
app.set("trust proxy", 1);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Public GETs read ?lang=ta and answer in that language
app.use("/api", localize);

app.use("/api/auth", authRoutes);
app.use("/api/navbar", navbarRoutes);
app.use("/api/quick-contacts", quickContactRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/why-us", whyRoutes);
app.use("/api/how-it-works", howRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/mail-settings", mailSettingsRoutes);
app.use("/api/languages", languageRoutes);

// One website: when the React app has been built (on Render), serve it from here too.
// Any non-API page (/, /admin, /admin/menu ...) gets index.html and React Router takes over.
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { index: false, maxAge: "7d" }));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
