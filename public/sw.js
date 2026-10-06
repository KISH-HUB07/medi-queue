// MediQueue Service Worker - PWA Offline Support
const CACHE_NAME = 'mediqueue-v1.0.0';
const STATIC_CACHE = 'mediqueue-static-v1';
const API_CACHE = 'mediqueue-api-v1';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon-192.jpg',
  '/icon-512.jpg',
  '/manifest.json',
];

// Install event - pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell...');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      console.log('[ServiceWorker] Installed & pre-cached!');
      return self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activated & controlling all clients!');
      return self.clients.claim();
    })
  );
});

// Fetch event - network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // API calls: Network first, fall back to cache
  if (url.pathname.startsWith('/api/') || url.port === '5000') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Google Fonts & external CDN: cache-first with network fallback
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, networkResponse.clone()));
          return networkResponse;
        });
      })
    );
    return;
  }

  // App shell & static assets: Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        // Cache successful responses for static assets
        if (networkResponse.ok && (
          request.url.includes('/assets/') ||
          request.url.endsWith('.js') ||
          request.url.endsWith('.css') ||
          request.url.endsWith('.jpg') ||
          request.url.endsWith('.png') ||
          request.url.endsWith('.svg')
        )) {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => {
        // Return cached index.html for navigation requests (SPA fallback)
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Background sync for offline token booking (when connectivity returns)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-token-booking') {
    event.waitUntil(syncPendingBookings());
  }
});

async function syncPendingBookings() {
  try {
    const db = await openIndexedDB();
    const pending = await db.getAll('pendingBookings');
    for (const booking of pending) {
      try {
        const res = await fetch('/api/tokens/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        });
        if (res.ok) {
          await db.delete('pendingBookings', booking.id);
          // Notify the user
          self.registration.showNotification('MediQueue', {
            body: `Your token has been booked! Check the app to see your queue position.`,
            icon: '/icon-192.jpg',
            badge: '/icon-192.jpg',
          });
        }
      } catch (e) {
        console.error('[SW] Sync failed for booking:', booking.id, e);
      }
    }
  } catch (e) {
    console.error('[SW] Sync error:', e);
  }
}

// Push notifications (optional, for queue updates)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'MediQueue';
  const options = {
    body: data.body || 'Your queue status has been updated.',
    icon: '/icon-192.jpg',
    badge: '/icon-192.jpg',
    tag: 'mediqueue-queue-update',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
