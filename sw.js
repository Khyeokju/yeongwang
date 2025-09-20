const CACHE_NAME = 'app-cache-v3';
self.skipWaiting && self.skipWaiting();
self.clients && self.clients.claim && self.clients.claim();
const ASSETS = [
  '/',
  '/index.html',
  '/index2.html',
  '/css/style.css',
  '/css/style2.css',
  '/js/index.js',
  '/js/index2.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // HTML은 항상 네트워크 우선 (최신 배포 즉시 반영)
  if (req.destination === 'document' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // 그 외 정적 자원은 캐시 우선, 실패 시 네트워크
  event.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => cached)
    )
  );
});
