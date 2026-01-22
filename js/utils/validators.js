export function isRequired(value) {
  return String(value || "").trim().length > 0;
}

export function isPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

export function isValidUrl(value) {
  if (!isRequired(value)) {
    return false;
  }
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}
