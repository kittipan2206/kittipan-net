// kittipan OS service worker: installable + works offline after the first visit.
// Hashed Next.js assets are immutable → cache-first. Pages → network-first with offline fallback.
// Never touches private or auth routes.
const CACHE = "kos-v3";
const SHELL = ["/", "/favicon.svg", "/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (/^\/(api|cdn-cgi|unlock)(\/|$)/.test(url.pathname)) return;

  if (url.pathname.startsWith("/_next/static/") || /\.(png|jpg|svg|mp4|woff2)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) caches.open(CACHE).then((cache) => cache.put(request, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((cache) => cache.put("/", res.clone()));
          return res;
        })
        .catch(() => caches.match("/")),
    );
  }
});
