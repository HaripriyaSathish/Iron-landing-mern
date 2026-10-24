import createListModel from "./listModel.js";

export const CONTACT_TYPES = ["call", "whatsapp", "email"];

export const QuickContact = createListModel("quick_contacts", ["type", "label", "value", "message", "is_active"]);
