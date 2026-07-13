const APP_VERSION = "local-dev";
const CACHE_NAME = `club-society-${APP_VERSION}`;
const versioned = (path) => `${path}?v=${encodeURIComponent(APP_VERSION)}`;
const ASSETS = [
  "./",
  "./index.html",
  versioned("./styles.css"),
  versioned("./app.js"),
  versioned("./manifest.webmanifest"),
  versioned("./club-society-mark.svg"),
  versioned("./favicon-32.png"),
  versioned("./apple-touch-icon.png"),
  versioned("./club-society-icon-192.png"),
  versioned("./club-society-icon-512.png"),
  "./sample-rsvp-import.csv",
  "./supabase-schema.sql",
  "./PHASE-4-LAUNCH.md",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const appFile = event.request.mode === "navigate"
    || ["document", "script", "style", "manifest"].includes(event.request.destination)
    || ["/", "/index.html", "/app.js", "/styles.css", "/manifest.webmanifest"].includes(url.pathname);

  if (appFile) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
    )
  );
});
