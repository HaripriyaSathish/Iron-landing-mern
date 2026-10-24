import httpError from "../utils/httpError.js";
import { requireFields, toBool, parseIds } from "../utils/validate.js";
import {
  getTestimonialsSection,
  updateTestimonialsSection,
  Testimonial,
} from "../models/testimonials.model.js";

function parseRating(value) {
  if (value === undefined) return undefined;
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw httpError(400, "Rating must be 1 to 5 stars");
  return rating;
}

// Public: section heading + visible testimonials
export async function getTestimonials(req, res) {
  const [section, testimonials] = await Promise.all([
    getTestimonialsSection(),
    Testimonial.findAll({ activeOnly: true }),
  ]);
  res.json({ success: true, data: { section, testimonials } });
}

// Admin: includes hidden testimonials
export async function getTestimonialsAdmin(req, res) {
  const [section, testimonials] = await Promise.all([getTestimonialsSection(), Testimonial.findAll()]);
  res.json({ success: true, data: { section, testimonials } });
}

export async function updateSection(req, res) {
  const body = req.body ?? {};
  for (const key of ["tagline", "heading"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  res.json({ success: true, data: await updateTestimonialsSection(body) });
}

export async function createTestimonial(req, res) {
  const body = req.body ?? {};
  requireFields(body, ["quote", "name"]);
  const testimonial = await Testimonial.create({
    ...body,
    rating: parseRating(body.rating) ?? 5,
    is_active: toBool(body.is_active),
  });
  res.status(201).json({ success: true, data: testimonial });
}

export async function updateTestimonial(req, res) {
  const body = req.body ?? {};
  if (!(await Testimonial.findById(req.params.id))) throw httpError(404, "Testimonial not found");
  for (const key of ["quote", "name"]) {
    if (body[key] !== undefined && !String(body[key]).trim()) throw httpError(400, `${key} cannot be empty`);
  }
  const data = { ...body, rating: parseRating(body.rating) };
  if (body.is_active !== undefined) data.is_active = toBool(body.is_active);
  res.json({ success: true, data: await Testimonial.update(req.params.id, data) });
}

export async function deleteTestimonial(req, res) {
  if (!(await Testimonial.remove(req.params.id))) throw httpError(404, "Testimonial not found");
  res.json({ success: true, message: "Testimonial deleted" });
}

export async function reorderTestimonials(req, res) {
  await Testimonial.reorder(parseIds(req.body?.ids));
  res.json({ success: true, data: await Testimonial.findAll() });
}
