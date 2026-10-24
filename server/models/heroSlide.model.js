import createListModel from "./listModel.js";

export const HeroSlide = createListModel("hero_slides", [
  "tagline",
  "heading",
  "description",
  "image_url",
  "image_public_id",
  "image_alt",
  "primary_btn_text",
  "primary_btn_link",
  "secondary_btn_text",
  "secondary_btn_link",
  "is_active",
]);
