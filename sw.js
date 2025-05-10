const CACHE_NAME = 'moms-v12';  // Incremented version
const OFFLINE_URL = 'offline.html';  // Make sure this file exists

const urlsToCache = [
  './',
  './index.html',
  './message.html',
  './css/common.css',
  './css/index.css',
  './css/message.css',
  './fonts/Montserrat-Regular.ttf',
  './images/bg.png',
  './images/bg-mobile.png',
  './images/down-arrow.png',
  './images/icon.png',
  './js/index.js',
  './js/message.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css',
  'https://code.jquery.com/jquery-3.6.0.min.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.4/TweenLite.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.4/plugins/ScrollToPlugin.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('Service Worker installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, {
            credentials: 'same-origin',
            redirect: 'follow'
          });
        })).catch(err => {
        console.warn('Failed to cache some assets:', err);
      });
 })
	  .then(() => {
		console.log('All core assets cached');
	  })
	  .catch(err => {
		console.warn('Failed to open cache:', err);
	  })
  );

});

self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Handle different types of requests
  if (isCDNRequest(event.request)) {
    // Cache-first for CDN resources
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetchWithCache(event.request))
        .catch(() => fetch(event.request))
    );
  } else {
    // Network-first for local resources
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          // Only cache successful responses
          if (response && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => console.warn('Cache put error:', err));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request)
            .then(cached => {
              if (cached) return cached;
              // If HTML request, return offline page
              if (isHtmlRequest(event.request)) {
                return caches.match(OFFLINE_URL);
              }
              return new Response('Network error', {
                status: 408,
                headers: {'Content-Type': 'text/plain'}
              });
            });
        })
    );
  }
});

function fetchWithCache(request) {
  return fetch(request.clone())
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseToCache = response.clone();
      return caches.open(CACHE_NAME)
        .then(cache => cache.put(request, responseToCache))
        .then(() => response);
    })
    .catch(err => {
      console.warn('Fetch failed for:', request.url, err);
      throw err;
    });
}

function isCDNRequest(request) {
  const cdnDomains = [
    'cdnjs.cloudflare.com',
    'bootstrapcdn.com',
    'code.jquery.com'
  ];
  return cdnDomains.some(domain => request.url.includes(domain));
}

function isHtmlRequest(request) {
  const acceptHeader = request.headers.get('accept');
  return acceptHeader && acceptHeader.includes('text/html');
}