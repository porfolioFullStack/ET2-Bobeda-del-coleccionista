import { formatCurrency } from "../../utils/format.js";
import { escapeHtml } from "../../utils/dom.js";
import { getFilteredItems, getValidationByItemId } from "../../store/selectors.js";
import { bindMarketplaceEvents } from "./events.js";

export default function marketplaceView({ state }) {
  const { filters } = state.ui;
  const filteredItems = getFilteredItems(state);
  const cards = filteredItems
    .map((item) => {
      const validation = getValidationByItemId(state, item.id);
      const badge =
        validation && validation.status === "approved"
          ? "<span class=\"badge badge-ok\">Validado</span>"
          : validation && validation.status === "pending"
          ? "<span class=\"badge badge-pending\">Pendiente</span>"
          : validation && validation.status === "rejected"
          ? "<span class=\"badge badge-reject\">Rechazado</span>"
          : "";
      return `
        <article class="card">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta">
              <span>${escapeHtml(item.category)}</span>
              <span>${escapeHtml(item.location)}</span>
            </div>
          </div>
          <div class="meta">
            <strong>${formatCurrency(item.price)}</strong>
            ${badge}
          </div>
          <a href="#/item/${item.id}">Ver detalle</a>
        </article>
      `;
    })
    .join("");

  let resultsHtml = cards;

  if (state.meta.loading) {
    resultsHtml = "<p>Cargando catalogo...</p>";
  } else if (state.meta.error) {
    resultsHtml = `<p>Error al cargar datos: ${escapeHtml(state.meta.error)}</p>`;
  } else if (!cards) {
    resultsHtml = "<p>Sin resultados con los filtros seleccionados.</p>";
  }

  return {
    html: `
      <section>
        <div class="page-header">
          <div>
            <p class="tagline">Catalogo publico y discovery</p>
            <h2 class="page-title">Marketplace</h2>
          </div>
          <div class="meta">
            <span>${filteredItems.length} resultados</span>
          </div>
        </div>
        <div class="layout-split">
          <aside class="filters">
            <h3>Filtros</h3>
            <label for="search">Busqueda</label>
            <input id="search" placeholder="Buscar items" value="${escapeHtml(filters.search)}" />
            <label for="category">Categoria</label>
            <select id="category">
              <option value="all" ${filters.category === "all" ? "selected" : ""}>Todas</option>
              <option value="hardware" ${filters.category === "hardware" ? "selected" : ""}>Hardware</option>
              <option value="art" ${filters.category === "art" ? "selected" : ""}>Arte</option>
              <option value="cards" ${filters.category === "cards" ? "selected" : ""}>Cartas</option>
            </select>
            <label for="location">Ubicacion</label>
            <input id="location" placeholder="Ciudad" value="${escapeHtml(filters.location)}" />
            <label for="min">Precio minimo</label>
            <input id="min" type="number" min="0" placeholder="0" value="${escapeHtml(filters.min)}" />
            <label for="max">Precio maximo</label>
            <input id="max" type="number" min="0" placeholder="5000" value="${escapeHtml(filters.max)}" />
            <label for="sort">Orden</label>
            <select id="sort">
              <option value="recent" ${filters.sort === "recent" ? "selected" : ""}>Mas recientes</option>
              <option value="price_asc" ${filters.sort === "price_asc" ? "selected" : ""}>Precio: menor a mayor</option>
              <option value="price_desc" ${filters.sort === "price_desc" ? "selected" : ""}>Precio: mayor a menor</option>
            </select>
            <label class="checkbox">
              <input type="checkbox" id="certified" ${filters.certified ? "checked" : ""} />
              Solo validados
            </label>
          </aside>
          <div>
            <div class="grid">
              ${resultsHtml || "<p>No hay items disponibles.</p>"}
            </div>
          </div>
        </div>
      </section>
    `,
    onMount: bindMarketplaceEvents,
  };
}
