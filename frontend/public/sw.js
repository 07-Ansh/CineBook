const CACHE_NAME = 'cinebook-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/Assets/Logo/LOGO-TP.png',
  '/Assets/Logo/Icon.png',
  '/src/main.tsx',
  '/src/index.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API requests — always go to the network.
  // Caching API responses caused stale ticket data to be served even when
  // the backend or database was down (Supabase paused, Render sleeping, etc.).
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    return; // Let the browser handle it normally
  }

  // Only cache GET requests for same-origin static assets
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate: serve cache instantly, refresh in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => { /* Ignore background fetch failures */ });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Only cache static assets (not API or dynamic content)
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is for page navigation, fallback to index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
