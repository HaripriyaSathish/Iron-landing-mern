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
import { notFound, errorHandler } from "./middleware/error.js";
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

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

app.use(notFound);
app.use(errorHandler);

export default app;
