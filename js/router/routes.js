import marketplaceView from "../features/marketplace/view.js";
import { syncMarketplaceFilters } from "../features/marketplace/events.js";
import itemDetailView from "../features/itemDetail/view.js";
import dashboardView from "../features/dashboard/view.js";
import validatorView from "../features/validator/view.js";
import aboutView from "../features/about/view.js";

export const routes = [
  {
    path: "/",
    title: "Marketplace",
    view: marketplaceView,
    sync: ({ query, state }) => syncMarketplaceFilters(query, state.ui.filters),
  },
  { path: "/item/:id", title: "Item Detail", view: itemDetailView },
  { path: "/dashboard", title: "Dashboard", view: dashboardView },
  { path: "/validator", title: "Validator", view: validatorView },
  { path: "/about", title: "About", view: aboutView },
];
