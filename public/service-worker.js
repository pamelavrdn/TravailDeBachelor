const CACHE_NAME = "cache-product-v9";
const urlsToCache = [
  "dist/css/app.604f0654.css",
  "dist/css/chunk-vendors.c29ab024.css",
  "img/cart-icon.6970e1db.png",
  "img/img1.d76ecb33.jpg",
  "img/img2.bf6c276c.jpg",
  "img/img3.70fd011d.jpg",
  "img/img4.dc3cb248.jpg",
  "img/img5.ad9bfef5.jpg",
  "img/img6.5fbb85fc.jpg",
  "img/img7.f02c7437.jpg",
  "img/img8.4a855b64.jpg",
  "img/img9.7b9bb49e.jpg",
  "img/img10.7063bc1e.jpg",
  "img/img11.822418e8.jpg",
  "img/img12.e294ffbf.jpg",
  "js/app.9f6a509e.js",
  "js/app.9f6a509e.js.map",
  "js/chunk-vendors.7577cc4f.js",
  "js/chunk-vendors.7577cc4f.js.map",
  "/favicon.ico",
  "/index.html",
];

// 1. Installation du Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Activation du Service Worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Interception des requêtes pour le cache
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes avec des schémas non supportés
  const url = new URL(event.request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    console.log(`Requête ignorée : ${event.request.url}`);
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
      );
    })
  );
});
