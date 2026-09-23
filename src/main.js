import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Import Bootstrap and BootstrapVue CSS files
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

// Import BootstrapVue
import BootstrapVue3 from "bootstrap-vue-3";

const app = createApp(App);

// Use BootstrapVue
app.use(BootstrapVue3);

// Use router
app.use(router);

// Enregistrer le service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerPath = "/service-worker.js";
    const cacheEnabled = process.env.VUE_APP_CACHE_SW === "true";
    if (cacheEnabled) {
      navigator.serviceWorker
        .register(serviceWorkerPath)
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    } else {
      console.log("Service Worker not registered as cache is disabled.");
    }
  });
}

app.mount("#app");
