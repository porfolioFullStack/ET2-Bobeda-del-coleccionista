export function getHashLocation() {
  const raw = window.location.hash || "#/";
  const hash = raw.startsWith("#") ? raw.slice(1) : raw;
  const [path, queryString] = hash.split("?");
  return { path: path || "/", queryString: queryString || "" };
}

export function setHashQueryString(queryString) {
  const { path } = getHashLocation();
  const next = `#${path}${queryString ? `?${queryString}` : ""}`;
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}
