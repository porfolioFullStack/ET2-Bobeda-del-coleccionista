import { resolveValidationRequest } from "../../store/actions.js";

function parseEstimate(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function bindValidatorEvents(root) {
  root.addEventListener("submit", (event) => {
    const form = event.target.closest(".validation-form");
    if (!form) {
      return;
    }
    event.preventDefault();

    const payload = {
      id: form.dataset.id,
      specialistId: form.specialist.value,
      status: form.status.value,
      estimateMin: parseEstimate(form.estimateMin.value),
      estimateMax: parseEstimate(form.estimateMax.value),
      note: form.note.value.trim(),
    };

    resolveValidationRequest(payload);
  });
}
