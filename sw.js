const CACHE_NAME = 'hospital-cache-v1';
const DB_NAME = 'HospitalDB';
const DB_VERSION = 1;
const STORE_NAME = 'appointments';

// Files to cache
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event: Cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Serve cached files and fallback to network
self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  // Skip caching for unsupported schemes
  if (requestURL.protocol === 'chrome-extension:' || requestURL.protocol === 'about:') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          if (event.request.method === 'GET' && networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
      );
    })
  );
});

// IndexedDB utility functions
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(`IndexedDB error: ${event.target.errorCode}`);
    };
  });
};

const saveToIndexedDB = async (data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(`Add error: ${event.target.errorCode}`);
  });
};

// Message event: Handle messages from the app
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SAVE_APPOINTMENT') {
    try {
      const id = await saveToIndexedDB(event.data.payload);
      event.ports[0].postMessage({ success: true, id });
    } catch (error) {
      event.ports[0].postMessage({ success: false, error });
    }
  }
});