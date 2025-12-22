// Service Worker básico para iMetrics
// Versión: 1.0.0

const CACHE_NAME = 'imetrics-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', function(event) {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('[SW] Error al abrir cache:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', function(event) {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', function(event) {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si encuentra el recurso en cache, lo devuelve
        if (response) {
          return response;
        }

        // Si no está en cache, lo busca en la red
        return fetch(event.request)
          .then(function(response) {
            // Verificar si es una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta para guardarla en cache
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(function(error) {
            console.log('[SW] Error en fetch:', error);
            // Aquí podrías devolver una página offline personalizada
            return new Response('Sin conexión', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Manejar notificaciones push (si se implementan en el futuro)
self.addEventListener('push', function(event) {
  console.log('[SW] Push recibido:', event);
});

// Manejar sincronización en background
self.addEventListener('sync', function(event) {
  console.log('[SW] Background sync:', event);
});

console.log('[SW] Service Worker cargado correctamente');