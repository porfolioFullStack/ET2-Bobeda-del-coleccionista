import { formatCurrency, formatDate, getTrustLevel } from "../../utils/format.js";
import { escapeHtml } from "../../utils/dom.js";
import { getItemById, getValidationByItemId, getSpecialistById } from "../../store/selectors.js";

export default function itemDetailView({ state, params }) {
  const item = getItemById(state, params.id);
  if (!item) {
    return {
      html: "<section class=\"section\"><h2>Item no encontrado</h2></section>",
    };
  }

  const validation = getValidationByItemId(state, item.id);
  const specialist = validation?.specialistId
    ? getSpecialistById(state, validation.specialistId)
    : null;
  const badge =
    validation && validation.status === "approved"
      ? "<span class=\"badge badge-ok\">Validado</span>"
      : validation && validation.status === "rejected"
      ? "<span class=\"badge badge-reject\">Rechazado</span>"
      : validation && validation.status === "pending"
      ? "<span class=\"badge badge-pending\">Pendiente</span>"
      : "<span class=\"badge badge-pending\">Sin validar</span>";

  let validationBlock = "";
  if (validation) {
    const statusLabel =
      validation.status === "approved"
        ? "Aprobado"
        : validation.status === "rejected"
        ? "Rechazado"
        : "Pendiente";
    const estimate =
      validation.estimateMin || validation.estimateMax
        ? `${formatCurrency(validation.estimateMin || 0)} - ${formatCurrency(
            validation.estimateMax || 0
          )}`
        : "Sin estimacion";
    const dateLabel = validation.resolvedAt
      ? formatDate(validation.resolvedAt)
      : formatDate(validation.createdAt);
    validationBlock = `
      <div class="section">
        <h3>Certificado</h3>
        <p>Estado: ${escapeHtml(statusLabel)}</p>
        <p>Fecha: ${escapeHtml(dateLabel || "-")}</p>
        <p>Estimacion: ${escapeHtml(estimate)}</p>
        <p>Nota tecnica: ${escapeHtml(validation.note || "Sin nota")}</p>
        ${
          specialist
            ? `<p>Especialista: ${escapeHtml(specialist.name)} (${getTrustLevel(
                specialist.validationsCount
              )})</p>`
            : ""
        }
      </div>
    `;
  }

  return {
    html: `
      <section class="section">
        <div class="page-header">
          <div>
            <p class="tagline">Detalle del item</p>
            <h2 class="page-title">${escapeHtml(item.title)}</h2>
          </div>
          ${badge}
        </div>
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
        <div class="meta">
          <span>${escapeHtml(item.category)}</span>
          <span>${escapeHtml(item.location)}</span>
          <span>${formatCurrency(item.price)}</span>
        </div>
        <p>${escapeHtml(item.description)}</p>
        ${validationBlock}
      </section>
    `,
  };
}
