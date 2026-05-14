// Q2 Machines — Service Worker
// Caches app shell for offline use

const CACHE_NAME = 'q2-machines-v3';
const STATIC_SHELL = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/QQL_2024.jpg'
];

// Install — cache static assets only (not HTML)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
//   HTML documents  → network-first (always get latest app shell)
//   API / Supabase  → network-only
//   Static assets   → cache-first, fallback to network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isHTML = event.request.headers.get('accept')?.includes('text/html');

  // Network-only: API calls and external services
  if (url.hostname !== self.location.hostname) {
    event.respondWith(fetch(event.request).catch(() =>
      isHTML
        ? caches.match('/index.html')
        : new Response('', { status: 503 })
    ));
    return;
  }

  // Network-first for HTML — ensures users always get the latest version
  if (isHTML || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/jobs') || url.pathname.endsWith('/jobs/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first for static assets (images, manifest, fonts)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
