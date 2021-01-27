const files = [
  '/',
  '/console.css',
  '/events.js',
  '/console.js',
  '/metacom.js',
  '/favicon.ico',
  '/favicon.png',
  '/metarhia.png',
  '/metarhia.svg',
];

self.addEventListener('install', async (event) => {
  const cache = await caches.open('metarhia');
  event.waitUntil(cache.addAll(files));
});

self.addEventListener('fetch', async ({ request }) => {
  const cache = await caches.open('metarhia');
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.status < 400) cache.put(request, response.clone());
  return response;
});
