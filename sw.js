// sw.js
const CACHE_NAME = 'pegearts-cache-v1';
const urlsToCache = [
    '/',
    '/assets/favicon.ico',
    '/assets/icon-192.png',
    '/assets/icon-512.png',
    '/assets/thanatsitt.webp',
    '/assets/thanatsitt.jpg',
    '/assets/project1.webp',
    '/assets/project1.jpg',
    '/assets/project2.webp',
    '/assets/project2.jpg',
    '/portfolio.json',
    '/manifest.json',
    '/offline.html' // Fallback page for offline access
];

// Install event: Cache essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell and content');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch(error => console.error('[Service Worker] Cache failed:', error))
    );
});

// Fetch event: Serve from cache or network
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        console.log('[Service Worker] Fetch ignored:', event.request.method, event.request.url);
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                                console.log('[Service Worker] Cached new resource:', event.request.url);
                            });
                        return networkResponse;
                    })
                    .catch(() => {
                        console.log('[Service Worker] Fetch failed, serving offline page:', event.request.url);
                        return caches.match('/offline.html');
                    });
            })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
