export function formatCurrency(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function getTrustLevel(count) {
  const total = Number(count) || 0;
  if (total >= 30) {
    return "Oro";
  }
  if (total >= 15) {
    return "Plata";
  }
  return "Bronce";
}
