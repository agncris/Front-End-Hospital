const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/styles/main.css',
  '/src/main.jsx',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

// Recursos estáticos que siempre queremos en caché
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/styles/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

// Patrones de URL para recursos de API
const API_PATTERNS = [
  '/api/doctors',
  '/api/patients',
  '/api/appointments'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (![CACHE_NAMES.static, CACHE_NAMES.dynamic, CACHE_NAMES.api].includes(key)) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // HTML navigation - Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAMES.static).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // API requests - Stale While Revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            const cache = caches.open(CACHE_NAMES.api);
            cache.then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Static assets - Cache First
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetchAndCache(event.request, CACHE_NAMES.static))
    );
    return;
  }

  // Dynamic content - Network First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clonedResponse = response.clone();
        caches.open(CACHE_NAMES.dynamic).then(cache => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Función auxiliar para fetch y cache
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (!response || response.status !== 200) {
      throw new Error('Network error');
    }
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error('Error fetching and caching:', error);
    return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Limpieza periódica de caché
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'clean-caches') {
    event.waitUntil(
      caches.open(CACHE_NAMES.dynamic).then(cache => {
        // Eliminar entradas más antiguas que 7 días
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        cache.keys().then(requests => {
          requests.forEach(request => {
            cache.match(request).then(response => {
              if (response && response.headers.get('date')) {
                const dateHeader = new Date(response.headers.get('date')).getTime();
                if (dateHeader < oneWeekAgo) {
                  cache.delete(request);
                }
              }
            });
          });
        });
      })
    );
  }
});
