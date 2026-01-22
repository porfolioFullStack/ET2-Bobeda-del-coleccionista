import { upsertItem, deleteItem, createValidationRequest } from "../../store/actions.js";
import { store } from "../../store/store.js";
import { getItemById } from "../../store/selectors.js";
import { isRequired, isPositiveNumber, isValidUrl } from "../../utils/validators.js";

function setFormState(form, item) {
  form.dataset.editingId = item ? String(item.id) : "";
  form.querySelector("h3").textContent = item ? "Editar item" : "Nuevo item";
  form.title.value = item?.title || "";
  form.category.value = item?.category || "hardware";
  form.price.value = item?.price || "";
  form.location.value = item?.location || "";
  form.image.value = item?.image || "";
  form.description.value = item?.description || "";
}

function getFormData(form) {
  return {
    title: form.title.value.trim(),
    category: form.category.value,
    price: Number(form.price.value),
    location: form.location.value.trim(),
    image: form.image.value.trim(),
    description: form.description.value.trim(),
  };
}

function validateItem(data) {
  const errors = [];
  if (!isRequired(data.title)) {
    errors.push("El titulo es obligatorio.");
  }
  if (!isRequired(data.category)) {
    errors.push("La categoria es obligatoria.");
  }
  if (!isPositiveNumber(data.price)) {
    errors.push("El precio debe ser un numero positivo.");
  }
  if (!isRequired(data.location)) {
    errors.push("La ubicacion es obligatoria.");
  }
  if (!isValidUrl(data.image)) {
    errors.push("La imagen debe ser una URL valida.");
  }
  if (!isRequired(data.description)) {
    errors.push("La descripcion es obligatoria.");
  }
  return errors;
}

function renderErrors(root, errors) {
  const container = root.querySelector("#form-errors");
  if (!container) {
    return;
  }
  container.innerHTML = errors.length
    ? `<ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>`
    : "";
}

export function bindDashboardEvents(root) {
  const form = root.querySelector("#item-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = getFormData(form);
    const errors = validateItem(data);
    if (errors.length > 0) {
      renderErrors(root, errors);
      return;
    }

    const editingId = form.dataset.editingId;
    upsertItem({
      ...data,
      id: editingId || undefined,
      ownerId: store.getState().session.userId,
    });

    renderErrors(root, []);
    setFormState(form, null);
  });

  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }

    const action = target.dataset.action;
    if (action === "edit") {
      const item = getItemById(store.getState(), target.dataset.id);
      if (item) {
        setFormState(form, item);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (action === "delete") {
      const itemId = target.dataset.id;
      if (window.confirm("Eliminar este item?")) {
        deleteItem(itemId);
      }
    }

    if (action === "request") {
      const itemId = target.dataset.id;
      createValidationRequest(itemId);
    }

    if (action === "cancel-edit") {
      setFormState(form, null);
      renderErrors(root, []);
    }

    if (action === "focus-form") {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
