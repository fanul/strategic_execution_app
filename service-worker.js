/**
 * Service Worker for Strategic Execution Monitoring Application
 * Provides offline functionality, caching, and background sync
 */

// ============================================================================
// CACHE NAMES
// ============================================================================

const CACHE_NAME = 'sem-app-v1.0.0';
const STATIC_CACHE = 'sem-static-v1.0.0';
const DYNAMIC_CACHE = 'sem-dynamic-v1.0.0';
const API_CACHE = 'sem-api-v1.0.0';

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const CACHE_CONFIG = {
    // Static assets to cache on install
    staticAssets: [
        '/',
        '/index.html',
        '/manifest.json',
        // Bootstrap CSS
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        // Bootstrap Icons
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
        // jQuery
        'https://code.jquery.com/jquery-3.7.0.min.js',
        // Bootstrap JS
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        // DataTables
        'https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css',
        'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js',
        'https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js',
        // Select2
        'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
        'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js',
        // Google Charts
        'https://www.gstatic.com/charts/loader.js'
    ],

    // API endpoints to cache
    apiEndpoints: [
        '/auth/me',
        '/dashboard/executive',
        '/dashboard/kpi',
        '/dashboard/impact-center'
    ],

    // Cache timeout in milliseconds (5 minutes for API)
    apiCacheTimeout: 5 * 60 * 1000,

    // Maximum cache size
    maxCacheSize: 50 * 1024 * 1024 // 50MB
};

// ============================================================================
// INSTALL EVENT
// ============================================================================

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(CACHE_CONFIG.staticAssets);
        }).then(() => {
            // Skip waiting to activate immediately
            return self.skipWaiting();
        })
    );
});

// ============================================================================
// ACTIVATE EVENT
// ============================================================================

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old caches
                    if (cacheName !== CACHE_NAME &&
                        cacheName !== STATIC_CACHE &&
                        cacheName !== DYNAMIC_CACHE &&
                        cacheName !== API_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control immediately
            return self.clients.claim();
        })
    );
});

// ============================================================================
// FETCH EVENT - NETWORK FIRST, FALLBACK TO CACHE
// ============================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests (except for CDNs)
    if (url.origin !== location.origin && !isCDNRequest(url)) {
        return;
    }

    // Handle different request types
    if (isAPIRequest(url)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else {
        event.respondWith(handleNavigationRequest(request));
    }
});

// ============================================================================
// REQUEST HANDLERS
// ============================================================================

/**
 * Handle API requests - Network first with cache fallback
 */
async function handleAPIRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful response
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache for API request');

        // Fallback to cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline fallback
        return createOfflineResponse();
    }
}

/**
 * Handle static assets - Cache first with network fallback
 */
async function handleStaticAsset(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            // Update cache in background
            fetch(request).then((networkResponse) => {
                if (networkResponse.ok) {
                    const cache = caches.open(STATIC_CACHE);
                    cache.put(request, networkResponse);
                }
            });

            return cachedResponse;
        }

        // Fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Failed to load static asset:', request.url);
        return createOfflineResponse();
    }
}

/**
 * Handle navigation requests - Network first with cache fallback
 */
async function handleNavigationRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache for navigation');

        // Fallback to cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page
        return caches.match('/offline.html');
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if request is for API
 */
function isAPIRequest(url) {
    return url.pathname.startsWith('/api/') ||
           url.search.includes('action=');
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
    return request.destination === 'script' ||
           request.destination === 'style' ||
           request.destination === 'image' ||
           request.destination === 'font';
}

/**
 * Check if request is for CDN
 */
function isCDNRequest(url) {
    const cdnHosts = [
        'cdn.jsdelivr.net',
        'code.jquery.com',
        'www.gstatic.com',
        'cdnjs.cloudflare.com'
    ];
    return cdnHosts.some(host => url.hostname.includes(host));
}

/**
 * Create offline response
 */
function createOfflineResponse() {
    return new Response(
        JSON.stringify({
            success: false,
            message: 'You are currently offline. Please check your internet connection.',
            offline: true
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', (event) => {
    const { action, data } = event.data;

    switch (action) {
        case 'SKIP_WAITING':
            skipWaiting();
            break;

        case 'CLEAR_CACHE':
            clearCache(data.cacheName);
            break;

        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;

        default:
            console.log('[Service Worker] Unknown action:', action);
    }
});

/**
 * Clear specific cache
 */
async function clearCache(cacheName) {
    if (cacheName) {
        await caches.delete(cacheName);
        console.log('[Service Worker] Cache cleared:', cacheName);
    } else {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[Service Worker] All caches cleared');
    }
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-offline-actions') {
        event.waitUntil(syncOfflineActions());
    }
});

/**
 * Sync offline actions
 */
async function syncOfflineActions() {
    try {
        // Get offline actions from IndexedDB
        const offlineActions = await getOfflineActions();

        for (const action of offlineActions) {
            try {
                // Retry the action
                await fetch(action.url, {
                    method: action.method,
                    headers: action.headers,
                    body: action.body
                });

                // Remove from offline actions
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('[Service Worker] Failed to sync action:', error);
            }
        }
    } catch (error) {
        console.error('[Service Worker] Background sync failed:', error);
    }
}

/**
 * Get offline actions from IndexedDB (placeholder)
 */
async function getOfflineActions() {
    // TODO: Implement IndexedDB storage for offline actions
    return [];
}

/**
 * Remove offline action from IndexedDB (placeholder)
 */
async function removeOfflineAction(id) {
    // TODO: Implement IndexedDB storage for offline actions
}

// ============================================================================
// PERIODIC SYNC (for background updates)
// ============================================================================

self.addEventListener('periodicsync', (event) => {
    console.log('[Service Worker] Periodic sync:', event.tag);

    if (event.tag === 'update-dashboard-data') {
        event.waitUntil(updateDashboardData());
    }
});

/**
 * Update dashboard data in background
 */
async function updateDashboardData() {
    try {
        // Pre-fetch dashboard data
        const endpoints = [
            '/api/dashboard/executive',
            '/api/dashboard/kpi',
            '/api/dashboard/impact-center'
        ];

        for (const endpoint of endpoints) {
            await fetch(endpoint);
        }
    } catch (error) {
        console.error('[Service Worker] Periodic sync failed:', error);
    }
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');

    let data = {
        title: 'Strategic Execution Monitoring',
        body: 'You have a new notification',
        icon: '/assets/icons/icon-192x192.png'
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (error) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'view',
                title: 'View'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
    } else {
        // Default action - open app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ============================================================================
// CACHE CLEANUP (periodic maintenance)
// ============================================================================

setInterval(() => {
    cleanupOldCaches();
}, 24 * 60 * 60 * 1000); // Run daily

/**
 * Clean up old cache entries
 */
async function cleanupOldCaches() {
    try {
        const cacheNames = await caches.keys();

        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();

            for (const request of keys) {
                const response = await cache.match(request);
                const cacheTime = response.headers.get('date');

                if (cacheTime) {
                    const age = Date.now() - new Date(cacheTime).getTime();
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

                    if (age > maxAge) {
                        await cache.delete(request);
                        console.log('[Service Worker] Deleted old cache entry:', request.url);
                    }
                }
            }
        }
    } catch (error) {
        console.error('[Service Worker] Cache cleanup failed:', error);
    }
}

console.log('[Service Worker] Service worker registered successfully');
