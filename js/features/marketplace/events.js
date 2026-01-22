import { defaultFilters } from "../../store/store.js";
import { setFilters } from "../../store/actions.js";

function parseBoolean(value) {
  return value === "1" || value === "true" || value === "yes";
}

export function parseFiltersFromQuery(query) {
  return {
    search: query.q ? String(query.q) : "",
    category: query.cat ? String(query.cat) : defaultFilters.category,
    location: query.loc ? String(query.loc) : "",
    min: query.min ? String(query.min) : "",
    max: query.max ? String(query.max) : "",
    certified: parseBoolean(query.cert) ? "1" : "",
    sort: query.sort ? String(query.sort) : defaultFilters.sort,
  };
}

export function syncMarketplaceFilters(query, currentFilters) {
  const next = { ...defaultFilters, ...parseFiltersFromQuery(query) };
  return setFilters(next, { replace: true, syncUrl: false });
}

function readFiltersFromUI(root) {
  const get = (selector) => root.querySelector(selector);
  const certified = get("#certified");
  return {
    search: get("#search")?.value.trim() || "",
    category: get("#category")?.value || "all",
    location: get("#location")?.value.trim() || "",
    min: get("#min")?.value.trim() || "",
    max: get("#max")?.value.trim() || "",
    certified: certified && certified.checked ? "1" : "",
    sort: get("#sort")?.value || defaultFilters.sort,
  };
}

export function bindMarketplaceEvents(root) {
  const apply = () => {
    setFilters(readFiltersFromUI(root));
  };

  const inputs = ["#search", "#location", "#min", "#max"];
  inputs.forEach((selector) => {
    const el = root.querySelector(selector);
    if (el) {
      el.addEventListener("input", apply);
    }
  });

  const changes = ["#category", "#certified", "#sort"];
  changes.forEach((selector) => {
    const el = root.querySelector(selector);
    if (el) {
      el.addEventListener("change", apply);
    }
  });
}
