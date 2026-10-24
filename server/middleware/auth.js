import jwt from "jsonwebtoken";
import httpError from "../utils/httpError.js";
import { findAdminById } from "../models/admin.model.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw httpError(401, "Please log in to continue");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, "Session expired, please log in again");
  }

  const admin = await findAdminById(payload.id);
  if (!admin) throw httpError(401, "Account no longer exists");

  req.admin = admin;
  next();
}
