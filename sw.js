const CACHE = 'hypecubs-v1';
const FILES = ['./', 'index.html', 'app.html', 'styles.css', 'data.js', 'app.js', 'consent.js', 'icon.svg', 'manifest.webmanifest',
  'terms.html', 'privacy.html', 'cookies.html', 'img/cub.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Network first (fresh updates), cache fallback when offline. Same-origin only.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('app.html')))
  );
});
