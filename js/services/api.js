const BASE_URL = "./data";

async function fetchJson(path) {
  const response = await fetch(`${BASE_URL}/${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export function getItems() {
  return fetchJson("items.json");
}

export function getSpecialists() {
  return fetchJson("specialists.json");
}

export function getValidations() {
  return fetchJson("validations.json");
}
