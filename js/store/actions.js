import { store, initialState, defaultFilters } from "./store.js";
import { getItems, getSpecialists, getValidations } from "../services/api.js";
import { getJson, setJson } from "../services/storage.js";
import { setHashQueryString } from "../utils/url.js";

const SESSION_KEY = "boveda_session_v1";
const DATA_KEY = "boveda_data_v1";

function mergeState(partial) {
  store.setState((state) => ({
    ...state,
    ...partial,
  }));
}

export function setRole(role) {
  mergeState({
    session: { ...store.getState().session, role },
  });
  setJson(SESSION_KEY, store.getState().session);
}

function filtersEqual(a, b) {
  return Object.keys(defaultFilters).every((key) => a[key] === b[key]);
}

export function setFilters(nextFilters, options = {}) {
  const { syncUrl = true, replace = false } = options;
  const current = store.getState().ui.filters;
  const updated = replace ? { ...nextFilters } : { ...current, ...nextFilters };

  if (filtersEqual(current, updated)) {
    return false;
  }

  store.setState((state) => ({
    ...state,
    ui: {
      ...state.ui,
      filters: updated,
    },
  }));

  if (syncUrl) {
    const queryString = buildFiltersQuery(updated);
    setHashQueryString(queryString);
  }

  return true;
}

export function buildFiltersQuery(filters) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("q", filters.search);
  }
  if (filters.category && filters.category !== defaultFilters.category) {
    params.set("cat", filters.category);
  }
  if (filters.location) {
    params.set("loc", filters.location);
  }
  if (filters.min) {
    params.set("min", filters.min);
  }
  if (filters.max) {
    params.set("max", filters.max);
  }
  if (filters.certified) {
    params.set("cert", "1");
  }
  if (filters.sort && filters.sort !== defaultFilters.sort) {
    params.set("sort", filters.sort);
  }

  return params.toString();
}

function applyPersistedState() {
  const persistedSession = getJson(SESSION_KEY) || {};
  const persistedData = getJson(DATA_KEY) || {};

  mergeState({
    session: { ...initialState.session, ...persistedSession },
    items: persistedData.items || initialState.items,
    validations: persistedData.validations || initialState.validations,
    specialists: persistedData.specialists || initialState.specialists,
  });
}

async function loadRemoteData() {
  mergeState({ meta: { ...store.getState().meta, loading: true, error: null } });
  try {
    const [items, specialists, validations] = await Promise.all([
      getItems(),
      getSpecialists(),
      getValidations(),
    ]);
    mergeState({ items, specialists, validations });
  } catch (error) {
    mergeState({ meta: { ...store.getState().meta, error: error.message } });
  } finally {
    mergeState({ meta: { ...store.getState().meta, loading: false } });
  }
}

export async function bootstrapApp() {
  applyPersistedState();
  if (store.getState().items.length === 0) {
    await loadRemoteData();
  }
}

export function persistCatalog() {
  const { items, validations, specialists } = store.getState();
  setJson(DATA_KEY, { items, validations, specialists });
}

function nextItemId(items) {
  const maxId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  return maxId + 1;
}

function nextValidationId(validations) {
  const maxId = validations.reduce(
    (max, validation) => Math.max(max, Number(validation.id) || 0),
    0
  );
  return maxId + 1;
}

export function upsertItem(payload) {
  const state = store.getState();
  const items = [...state.items];
  const existingIndex = items.findIndex((item) => String(item.id) === String(payload.id));
  const ownerId = payload.ownerId || state.session.userId || "seller-1";

  if (existingIndex >= 0) {
    const current = items[existingIndex];
    items[existingIndex] = { ...current, ...payload, ownerId: current.ownerId || ownerId };
  } else {
    items.unshift({
      ...payload,
      id: payload.id ? Number(payload.id) : nextItemId(items),
      ownerId,
    });
  }

  mergeState({ items });
  persistCatalog();
}

export function deleteItem(itemId) {
  const state = store.getState();
  const items = state.items.filter((item) => String(item.id) !== String(itemId));
  mergeState({ items });
  persistCatalog();
}

export function createValidationRequest(itemId) {
  const state = store.getState();
  const validations = [...state.validations];
  const existing = validations.find(
    (validation) => String(validation.itemId) === String(itemId)
  );

  if (existing && existing.status === "pending") {
    return;
  }

  const request = {
    id: nextValidationId(validations),
    itemId: Number(itemId),
    specialistId: null,
    status: "pending",
    note: "",
    estimateMin: null,
    estimateMax: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };

  validations.unshift(request);
  mergeState({ validations });
  persistCatalog();
}

export function resolveValidationRequest(payload) {
  const state = store.getState();
  const validations = [...state.validations];
  const specialists = [...state.specialists];
  const index = validations.findIndex(
    (validation) => String(validation.id) === String(payload.id)
  );

  if (index < 0) {
    return;
  }

  const current = validations[index];
  validations[index] = {
    ...current,
    status: payload.status,
    note: payload.note || "",
    estimateMin: payload.estimateMin ?? null,
    estimateMax: payload.estimateMax ?? null,
    specialistId: payload.specialistId || current.specialistId,
    resolvedAt: new Date().toISOString(),
  };

  const specialistIndex = specialists.findIndex(
    (specialist) => specialist.id === validations[index].specialistId
  );

  if (specialistIndex >= 0) {
    const specialist = specialists[specialistIndex];
    specialists[specialistIndex] = {
      ...specialist,
      validationsCount: (specialist.validationsCount || 0) + 1,
    };
  }

  mergeState({ validations, specialists });
  persistCatalog();
}
