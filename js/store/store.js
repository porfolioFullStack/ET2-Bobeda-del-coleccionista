export const defaultFilters = {
  search: "",
  category: "all",
  location: "",
  min: "",
  max: "",
  certified: "",
  sort: "recent",
};

export const initialState = {
  session: {
    role: "buyer",
    userId: "seller-1",
  },
  items: [],
  validations: [],
  specialists: [],
  ui: {
    filters: { ...defaultFilters },
  },
  meta: {
    loading: false,
    error: null,
  },
};

function createStore(state) {
  let currentState = state;
  const listeners = new Set();

  function getState() {
    return currentState;
  }

  function setState(update) {
    currentState =
      typeof update === "function"
        ? update(currentState)
        : { ...currentState, ...update };
    listeners.forEach((listener) => listener(currentState));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    getState,
    setState,
    subscribe,
  };
}

export const store = createStore(initialState);
