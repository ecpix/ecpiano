// Service worker: lets the app work offline and keeps it up to date.
//
// Strategy: "network first". Online, pages, scripts and styles are fetched fresh every time, bypassing the
// browser's own 10-minute cache (GitHub Pages tells browsers to keep files for 10 minutes), so a new version
// shows up the next time someone opens the app. Offline, the last copy we saw is served from this cache.
// (Images and fonts just revalidate, which is cheap.) Bump VERSION when you add or rename files, so old copies are dropped.
const VERSION = "ecpiano-v1";
const CORE = [
  "./", "index.html", "manifest.webmanifest",
  "hub/hub.css", "hub/hub.js",
  "chords/index.html", "chords/chords.css", "chords/chords.js",
  "favorites/index.html", "favorites/favorites.css", "favorites/favorites.js",
  "shared/theme.css", "shared/piano.css", "shared/theme-init.js", "shared/store.js", "shared/user.js",
  "shared/theory.js", "shared/piano.js", "shared/wheel.js", "shared/audio.js", "shared/shell.js",
  "fonts/Fredoka-wght.woff2",
  "icons/logo-128.png", "icons/favicon-32.png", "icons/favicon-48.png", "icons/apple-touch-icon.png",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // never touch other sites (Skool, etc.)
  event.respondWith(
    fetch(req.url, { cache: ["document", "script", "style", "manifest", ""].includes(req.destination) ? "reload" : "no-cache" })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req.url, copy)); }
        return res;
      })
      .catch(async () => {
        const cache = await caches.open(VERSION);
        return (await cache.match(req.url)) || (await cache.match(req.url, { ignoreSearch: true })) ||
               (req.mode === "navigate" ? await cache.match("index.html") : undefined) || Response.error();
      })
  );
});
