const cacheName = "PWAGinkoBus";
const contentToCache = [
  "icons/icon-32.png",
  "icons/icon-64.png",
  "icons/icon-96.png",
  "icons/icon-128.png",
  "icons/icon-168.png",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-256.png",
  "icons/icon-512.png",
  "icons/maskable_icon.png",
  "index.html",
  "style.css",
  "app.js"
];


self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(contentToCache);
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  const structuralRequest = e.request.url.startsWith('https://thomasng2');
  e.respondWith(
    (async () => {
      if (structuralRequest) { // Cache-only for non changing data
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        const r = await caches.match(e.request);
        return r;
      }
      fetch(e.request) // Always poll network otherwise
      .then(async (networkResponse) => { // Network responded : cache answer and return it
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        const cache = await caches.open(cacheName);
        cache.put(e.request, networkResponse.clone);
        return networkResponse;
      })
      .catch(() => { // Network request failed : resort to cache
        console.log(`[Service worker] Attempt to take from cache : ${e.request.url}`);
        return caches.match(e.request); 
      }) 
    })(),
  );
});