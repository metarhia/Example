// Change version here in case of static content updates
const CACHE_NAME = 'metarhia-static-v1';
const CACHE_FILES = [
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

const registerContent = async () => {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(CACHE_FILES);
};

const checkVersionUpdates = async () => {
  const cacheWhitelist = [CACHE_NAME];
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map((name) => {
      if (!cacheWhitelist.includes(name)) return caches.delete(name);
    })
  );
};

const getContent = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.status === 200 && response.type === 'basic') {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener('install', (event) => {
  const contentRegistration = registerContent();
  event.waitUntil(contentRegistration);
});

self.addEventListener('activate', (event) => {
  const versionChecking = checkVersionUpdates();
  event.waitUntil(versionChecking);
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.url.startsWith('http')) {
    const contentRetrieving = getContent(request);
    event.respondWith(contentRetrieving);
  }
});
