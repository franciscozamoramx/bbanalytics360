const CACHE_NAME = 'bb-analytics-360-v1.76';
const ASSETS = [
    '/bbanalytics360/',
    '/bbanalytics360/index.html',
    '/bbanalytics360/manifest.json'
];

// Instalar y cachear recursos básicos
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activar y limpiar caches anteriores
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) {
                    return key !== CACHE_NAME;
                }).map(function(key) {
                    return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

// Estrategia: Network first, cache como fallback
self.addEventListener('fetch', function(event) {
    // Solo manejar requests del mismo origen
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // Cachear respuesta válida
                if (response && response.status === 200) {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(function() {
                // Si no hay red, usar cache
                return caches.match(event.request);
            })
    );
});
