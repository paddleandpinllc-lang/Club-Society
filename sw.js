const CACHE_NAME = "club-society-v15";
const ASSETS = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./club-society-mark.svg", "./favicon-32.png", "./apple-touch-icon.png", "./club-society-icon-192.png", "./club-society-icon-512.png", "./sample-rsvp-import.csv", "./supabase-schema.sql", "./PHASE-4-LAUNCH.md"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
