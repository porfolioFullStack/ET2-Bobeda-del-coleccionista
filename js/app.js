import { initRouter } from "./router/router.js";
import { bootstrapApp, setRole } from "./store/actions.js";
import { store } from "./store/store.js";

const roleSelect = document.getElementById("role-select");

function syncRoleUI() {
  const role = store.getState().session.role;
  if (roleSelect && roleSelect.value !== role) {
    roleSelect.value = role;
  }
}

if (roleSelect) {
  roleSelect.addEventListener("change", (event) => {
    setRole(event.target.value);
  });
}

store.subscribe(syncRoleUI);

bootstrapApp().then(() => {
  syncRoleUI();
  initRouter();
});
