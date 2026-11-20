// Service Worker for Studio Cake Image PWA (Desktop & Mobile) - v27 (Ultra-Fast Image & Asset Caching)
const CACHE_NAME = 'studio-cake-v27';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always network first for navigation and HTML documents so code updates are instant
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Fast cache-first strategy for images, icons, and fonts
  const isImage = event.request.destination === 'image' || event.request.url.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)(\?.*)?$/i);
  const isFont = event.request.destination === 'font' || event.request.url.match(/\.(woff|woff2|ttf|otf)(\?.*)?$/i);

  if (isImage || isFont) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => caches.match(event.request));
      })
    );
    return;
  }

  // Default network-first fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
