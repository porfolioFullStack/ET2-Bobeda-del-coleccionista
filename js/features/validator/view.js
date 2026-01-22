import { escapeHtml } from "../../utils/dom.js";
import { getItemById, getPendingValidations, getSpecialistById } from "../../store/selectors.js";
import { bindValidatorEvents } from "./events.js";
import { getTrustLevel } from "../../utils/format.js";

export default function validatorView({ state }) {
  if (state.session.role !== "validator") {
    return {
      html: `
        <section class="section">
          <h2>Bandeja del Especialista</h2>
          <p>Para validar solicitudes, cambia el rol a Especialista.</p>
        </section>
      `,
    };
  }

  const pending = getPendingValidations(state);
  const specialists = state.specialists || [];
  const buildSpecialistOptions = (selectedId) =>
    specialists
      .map((specialist, index) => {
        const isSelected =
          selectedId === specialist.id || (!selectedId && index === 0);
        return `<option value="${specialist.id}" ${
          isSelected ? "selected" : ""
        }>${escapeHtml(specialist.name)}</option>`;
      })
      .join("");

  const cards = pending
    .map((validation) => {
      const item = getItemById(state, validation.itemId);
      const assigned = validation.specialistId
        ? getSpecialistById(state, validation.specialistId)
        : null;
      const options = buildSpecialistOptions(validation.specialistId);
      return `
        <article class="card">
          <h3>${escapeHtml(item ? item.title : "Item desconocido")}</h3>
          <p>Solicitud #${validation.id}</p>
          <div class="meta">
            <span class="badge badge-pending">Pendiente</span>
            <span>${escapeHtml(item ? item.category : "")}</span>
            <span>${escapeHtml(item ? item.location : "")}</span>
          </div>
          <form class="validation-form" data-id="${validation.id}">
            <label>
              Especialista
              <select name="specialist" required>
                ${options}
              </select>
            </label>
            <label>
              Veredicto
              <select name="status" required>
                <option value="approved">Aprobar</option>
                <option value="rejected">Rechazar</option>
              </select>
            </label>
            <div class="form-grid inline">
              <label>
                Min
                <input name="estimateMin" type="number" min="0" />
              </label>
              <label>
                Max
                <input name="estimateMax" type="number" min="0" />
              </label>
            </div>
            <label>
              Nota tecnica
              <textarea name="note" rows="3"></textarea>
            </label>
            <button class="btn primary" type="submit">Emitir veredicto</button>
          </form>
          ${
            assigned
              ? `<p class="meta">Asignado: ${escapeHtml(assigned.name)}</p>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  const specialistCards = specialists
    .map((specialist) => {
      const level = getTrustLevel(specialist.validationsCount);
      return `
        <article class="card">
          <h3>${escapeHtml(specialist.name)}</h3>
          <p class="meta">${escapeHtml(specialist.areas.join(", "))}</p>
          <div class="meta">
            <span>Nivel: ${level}</span>
            <span>${specialist.validationsCount || 0} validaciones</span>
          </div>
        </article>
      `;
    })
    .join("");

  return {
    html: `
      <section>
        <div class="page-header">
          <div>
            <p class="tagline">Bandeja del especialista</p>
            <h2 class="page-title">Validaciones</h2>
          </div>
        </div>
        <div class="dashboard-layout">
          <div>
            <h3>Pendientes</h3>
            <div class="grid">
              ${cards || "<p>No hay solicitudes pendientes.</p>"}
            </div>
          </div>
          <div>
            <h3>Especialistas</h3>
            <div class="grid">
              ${specialistCards || "<p>No hay especialistas cargados.</p>"}
            </div>
          </div>
        </div>
      </section>
    `,
    onMount: bindValidatorEvents,
  };
}
