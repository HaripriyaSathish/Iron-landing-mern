import createListModel from "./listModel.js";

export const TickerItem = createListModel("ticker_items", ["icon", "text", "is_active"]);
