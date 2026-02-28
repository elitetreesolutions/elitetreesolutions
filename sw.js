// ═══════════════════════════════════════════════════════
// ELITE TREE SOLUTIONS — SERVICE WORKER
// Phase 1: Registration & Install
// Phase 3: Offline Caching Strategy
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'ets-v1.2';
const BASE = '/elitetreesolutions';

// ── ALL PAGES TO CACHE (App Shell) ──
const PAGES = [
  `${BASE}/index.html`,
  `${BASE}/shop.html`,
  `${BASE}/booking.html`,
  `${BASE}/adverse.html`,
  `${BASE}/findus.html`,
  `${BASE}/gallery.html`,
  `${BASE}/about.html`,
  `${BASE}/blog.html`,
  `${BASE}/faq.html`,
  `${BASE}/portfolio.html`,
  `${BASE}/testimonials.html`,
  `${BASE}/tips.html`,
  `${BASE}/terms.html`,
  `${BASE}/team.html`,
  `${BASE}/manifest.json`,
  `${BASE}/sw.js`,
];

// ── EXTERNAL ASSETS TO CACHE ──
const EXTERNAL = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@300;400;500&display=swap',
];

// ── OFFLINE FALLBACK PAGE ──
const OFFLINE_PAGE = `${BASE}/offline.html`;

// ═══════════════════════════════════════════════════════
// INSTALL — Pre-cache everything
// ═══════════════════════════════════════════════════════
self.addEventListener('install', event => {
  console.log('[SW] Installing Elite Tree Solutions PWA v1.2...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching app shell...');
      // Cache pages (fail gracefully if one is missing)
      const pagePromises = PAGES.map(url =>
        cache.add(url).catch(err => console.warn(`[SW] Failed to cache: ${url}`, err))
      );
      // Cache external fonts
      const externalPromises = EXTERNAL.map(url =>
        cache.add(new Request(url, { mode: 'cors' }))
          .catch(err => console.warn(`[SW] Failed to cache external: ${url}`, err))
      );
      return Promise.all([...pagePromises, ...externalPromises]);
    }).then(() => {
      console.log('[SW] ✅ App shell cached. Ready to work offline.');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// ═══════════════════════════════════════════════════════
// ACTIVATE — Clean up old caches
// ═══════════════════════════════════════════════════════
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
      );
    }).then(() => {
      console.log('[SW] ✅ Activated. Claiming clients...');
      return self.clients.claim();
    })
  );
});

// ═══════════════════════════════════════════════════════
// FETCH — Smart caching strategy
// ═══════════════════════════════════════════════════════
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip browser extensions and chrome-extension
  if (url.protocol === 'chrome-extension:') return;

  // Skip API calls (Anthropic API — always needs network)
  if (url.hostname === 'api.anthropic.com') return;

  // Skip Google Maps (always needs network)
  if (url.hostname.includes('google.com') || url.hostname.includes('gstatic.com')) return;

  // ── STRATEGY: Stale-While-Revalidate for HTML pages ──
  // Serve from cache instantly, update cache in background
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // ── STRATEGY: Cache First for static assets (fonts, icons) ──
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── STRATEGY: Network First for everything else ──
  event.respondWith(networkFirst(request));
});

// ═══════════════════════════════════════════════════════
// CACHING STRATEGIES
// ═══════════════════════════════════════════════════════

// Stale-While-Revalidate: serve cache immediately, refresh in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || fetchPromise || offlineFallback(request);
}

// Cache First: serve from cache, only hit network if not cached
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

// Network First: try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    return cached || offlineFallback(request);
  }
}

// Offline fallback
async function offlineFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  const offline = await cache.match(OFFLINE_PAGE);
  if (offline) return offline;
  // Last resort: return a simple offline message
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — Elite Tree Solutions</title><style>body{font-family:sans-serif;background:#0d2818;color:#f5f0e8;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem;}h1{font-size:1.5rem;margin-bottom:0.5rem;color:#7ab648;}p{color:rgba(245,240,232,0.5);font-size:0.9rem;}a{color:#7ab648;}</style></head><body><div><div style="font-size:3rem;margin-bottom:1rem;">🌳</div><h1>You're Offline</h1><p>No internet connection right now.<br>Please connect and try again.</p><p style="margin-top:1.5rem;"><a href="javascript:location.reload()">↺ Try Again</a></p></div></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// ═══════════════════════════════════════════════════════
// PUSH NOTIFICATIONS — Phase 4
// ═══════════════════════════════════════════════════════
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'Elite Tree Solutions 🌳',
    body: 'New update from Kakuye\'s nursery!',
    icon: '/elitetreesolutions/icons/icon-192.png',
    badge: '/elitetreesolutions/icons/icon-96.png',
    url: '/elitetreesolutions/index.html',
    tag: 'ets-notification',
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushed = event.data.json();
      data = { ...data, ...pushed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: data.url },
    actions: [
      { action: 'open', title: '🌿 View Now' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/elitetreesolutions/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('elitetreesolutions') && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync (for future order sync feature)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Background sync: orders');
  }
});

console.log('[SW] Elite Tree Solutions Service Worker loaded ✅');
