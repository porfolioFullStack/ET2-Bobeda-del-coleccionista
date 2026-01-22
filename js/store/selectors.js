export function getItemById(state, id) {
  return state.items.find((item) => String(item.id) === String(id));
}

export function getValidationByItemId(state, itemId) {
  return state.validations.find(
    (validation) => String(validation.itemId) === String(itemId)
  );
}

export function getSpecialistById(state, specialistId) {
  return state.specialists.find((specialist) => specialist.id === specialistId);
}

export function getPendingValidations(state) {
  return state.validations.filter((validation) => validation.status === "pending");
}

export function getItemsByOwner(state, ownerId) {
  return state.items.filter((item) => String(item.ownerId) === String(ownerId));
}

export function getFilteredItems(state) {
  const { items, ui } = state;
  const filters = ui.filters;
  const search = filters.search.toLowerCase();
  const min = Number(filters.min);
  const max = Number(filters.max);
  const certifiedOnly = Boolean(filters.certified);

  const result = items.filter((item) => {
    if (filters.category !== "all" && item.category !== filters.category) {
      return false;
    }

    if (filters.location) {
      const location = item.location.toLowerCase();
      if (!location.includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    if (search) {
      const haystack = `${item.title} ${item.description}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (Number.isFinite(min) && min > 0 && Number(item.price) < min) {
      return false;
    }
    if (Number.isFinite(max) && max > 0 && Number(item.price) > max) {
      return false;
    }

    if (certifiedOnly) {
      const validation = getValidationByItemId(state, item.id);
      if (!validation || validation.status !== "approved") {
        return false;
      }
    }

    return true;
  });

  if (filters.sort === "price_asc") {
    return [...result].sort((a, b) => Number(a.price) - Number(b.price));
  }
  if (filters.sort === "price_desc") {
    return [...result].sort((a, b) => Number(b.price) - Number(a.price));
  }

  return [...result].sort((a, b) => Number(b.id) - Number(a.id));
}
