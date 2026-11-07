// Service Worker for Studio Cake Image PWA (Desktop & Mobile)
const CACHE_NAME = 'studio-cake-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch with cache fallback if offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
