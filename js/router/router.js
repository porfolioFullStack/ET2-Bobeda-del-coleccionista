import { routes } from "./routes.js";
import { renderApp } from "../ui/render.js";
import { store } from "../store/store.js";

let activeRoute = null;

function parseHash() {
  const raw = window.location.hash || "#/";
  const hash = raw.startsWith("#") ? raw.slice(1) : raw;
  const [path, queryString] = hash.split("?");
  return { path: path || "/", queryString: queryString || "" };
}

function parseQuery(queryString) {
  const params = new URLSearchParams(queryString);
  const query = {};
  params.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

function matchRoute(path) {
  for (const route of routes) {
    const paramNames = [];
    const pattern = route.path
      .replace(/\//g, "\\/")
      .replace(/:([^/]+)/g, (_, key) => {
        paramNames.push(key);
        return "([^/]+)";
      });
    const regex = new RegExp(`^${pattern}$`);
    const match = path.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((key, index) => {
        params[key] = match[index + 1];
      });
      return { route, params };
    }
  }
  return null;
}

function renderRoute() {
  const { path, queryString } = parseHash();
  const query = parseQuery(queryString);
  const match = matchRoute(path);
  const state = store.getState();

  if (!match) {
    renderApp({
      html: "<section class=\"section\"><h2>Not found</h2><p>Route not defined.</p></section>",
    });
    return;
  }

  activeRoute = match.route;
  document.title = `${match.route.title} | Boveda del Coleccionista`;

  if (typeof match.route.sync === "function") {
    const changed = match.route.sync({ query, state });
    if (changed) {
      return;
    }
  }

  const viewModel = match.route.view({
    params: match.params,
    query,
    state,
  });

  renderApp(viewModel);
}

export function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  store.subscribe(() => {
    if (activeRoute) {
      renderRoute();
    }
  });
  renderRoute();
}
