import createListModel from "./listModel.js";

export const SpecialtyBlock = createListModel("specialty_blocks", [
  "tagline",
  "title",
  "intro",
  "points",
  "image_url",
  "image_public_id",
  "image_alt",
  "is_active",
]);
