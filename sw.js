const APP_VERSION = "2026-09-02-shared-members-dating-1";
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

self.addEventListener("push", (event) => {
  let message = {};
  try {
    message = event.data?.json() || {};
  } catch {
    message = { body: event.data?.text() || "You have a new Club Society update." };
  }
  event.waitUntil(self.registration.showNotification(message.title || "Club Society", {
    body: message.body || "You have a new reply or connection.",
    icon: "/club-society-icon-192.png",
    badge: "/favicon-32.png",
    tag: message.tag || "club-society-update",
    data: { url: message.url || "/?app=1" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = event.notification.data?.url || "/?app=1";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((openClients) => {
    const existing = openClients.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) return existing.navigate(destination).then(() => existing.focus());
    return clients.openWindow(destination);
  }));
});

