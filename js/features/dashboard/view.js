import { escapeHtml } from "../../utils/dom.js";
import { formatCurrency } from "../../utils/format.js";
import { getItemsByOwner, getValidationByItemId } from "../../store/selectors.js";
import { bindDashboardEvents } from "./events.js";

export default function dashboardView({ state }) {
  const isCollector = state.session.role === "seller";
  const ownerId = state.session.userId;
  const items = getItemsByOwner(state, ownerId);
  const list = items
    .map(
      (item) => {
        const validation = getValidationByItemId(state, item.id);
        const status = validation?.status;
        const badge =
          status === "approved"
            ? "<span class=\"badge badge-ok\">Validado</span>"
            : status === "rejected"
            ? "<span class=\"badge badge-reject\">Rechazado</span>"
            : status === "pending"
            ? "<span class=\"badge badge-pending\">Pendiente</span>"
            : "";
        const canRequest = !status || status === "rejected";

        return `
          <article class="card">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta">
              <span>${escapeHtml(item.category)}</span>
              <span>${formatCurrency(item.price)}</span>
              ${badge}
            </div>
            <p>${escapeHtml(item.location)}</p>
            <div class="actions">
              <button class="btn ghost" data-action="edit" data-id="${item.id}">Editar</button>
              <button class="btn danger" data-action="delete" data-id="${item.id}">Eliminar</button>
              ${
                canRequest
                  ? `<button class="btn primary" data-action="request" data-id="${item.id}">Solicitar validacion</button>`
                  : ""
              }
            </div>
          </article>
        `;
      }
    )
    .join("");

  if (!isCollector) {
    return {
      html: `
        <section class="section">
          <h2>Dashboard del Coleccionista</h2>
          <p>Para gestionar inventario, cambiá el rol a Coleccionista.</p>
        </section>
      `,
    };
  }

  return {
    html: `
      <section>
        <div class="page-header">
          <div>
            <p class="tagline">Inventario del coleccionista</p>
            <h2 class="page-title">Dashboard</h2>
          </div>
        </div>
        <div class="dashboard-layout">
          <form class="card form-card" id="item-form" data-editing-id="">
            <h3>Nuevo item</h3>
            <div class="form-grid">
              <label>
                Titulo
                <input name="title" placeholder="Nombre del item" required />
              </label>
              <label>
                Categoria
                <select name="category" required>
                  <option value="hardware">Hardware</option>
                  <option value="art">Arte</option>
                  <option value="cards">Cartas</option>
                </select>
              </label>
              <label>
                Precio
                <input name="price" type="number" min="1" placeholder="0" required />
              </label>
              <label>
                Ubicacion
                <input name="location" placeholder="Ciudad" required />
              </label>
              <label>
                Imagen (URL)
                <input name="image" placeholder="https://..." required />
              </label>
              <label>
                Descripcion
                <textarea name="description" rows="3" placeholder="Detalles del item" required></textarea>
              </label>
            </div>
            <div class="form-errors" id="form-errors" aria-live="polite"></div>
            <div class="actions">
              <button class="btn primary" type="submit">Guardar</button>
              <button class="btn ghost" type="button" data-action="cancel-edit">Cancelar</button>
            </div>
          </form>
          <div>
            <div class="page-header compact">
              <h3>Mis items</h3>
              <span class="meta">${items.length} items</span>
            </div>
            <div class="grid">
              ${
                list ||
                `
                <div class="card empty-state">
                  <h3>No tenes items todavia</h3>
                  <p>Completa el formulario para crear tu primer item.</p>
                  <button class="btn primary" data-action="focus-form">Crear item</button>
                </div>
              `
              }
            </div>
          </div>
        </div>
      </section>
    `,
    onMount: bindDashboardEvents,
  };
}
