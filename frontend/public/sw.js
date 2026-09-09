const CACHE_NAME = 'sipesand-v2.2-live';
const staticAssets = [
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(staticAssets).catch(() => {});
    })
  );
});

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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // 1. Bypass API calls
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. HTML navigation: Always Network First (never serve stale index.html)
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. JS & CSS assets: Network first, never cache HTML 404 fallback for JS/CSS
  if (url.pathname.includes('/assets/')) {
    event.respondWith(
      fetch(event.request).then((networkRes) => {
        const contentType = networkRes.headers.get('content-type') || '';
        // If server returned HTML for a JS file (SPA 404 fallback), do not cache it!
        if (url.pathname.endsWith('.js') && contentType.includes('text/html')) {
          return networkRes;
        }
        return networkRes;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // 4. Other static images/fonts: Cache first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
