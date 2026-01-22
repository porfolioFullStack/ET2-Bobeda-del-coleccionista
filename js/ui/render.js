export function renderApp({ html, onMount }) {
  const root = document.getElementById("app");
  if (!root) {
    return;
  }
  root.innerHTML = html;
  if (typeof onMount === "function") {
    onMount(root);
  }
}
