// Service Worker para iMetrics - SEO y Performance Optimization
const CACHE_NAME = 'imetrics-v1.0.0';
const STATIC_CACHE = 'imetrics-static-v1.0.0';
const DYNAMIC_CACHE = 'imetrics-dynamic-v1.0.0';

// Archivos críticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index-seo-complete.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/logo192.png',
  '/robots.txt',
  '/sitemap.xml'
];

// Recursos externos para cachear
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Archivos estáticos cacheados exitosamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Error al cachear archivos estáticos:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('SW: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activación completada');
        return self.clients.claim();
      })
  );
});

// Estrategia de Cache: Stale While Revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar peticiones de Chrome Extension y otros no HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Para recursos estáticos: Cache First
  if (STATIC_ASSETS.includes(url.pathname) || 
      EXTERNAL_RESOURCES.some(resource => request.url.includes(resource))) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // Actualizar cache en segundo plano
            fetch(request)
              .then((fetchResponse) => {
                if (fetchResponse.ok && (request.method === 'GET' || request.method === 'HEAD')) {
                  caches.open(STATIC_CACHE)
                    .then((cache) => cache.put(request, fetchResponse.clone()))
                    .catch((error) => {
                      console.warn('SW: Error al actualizar cache estática:', error);
                    });
                }
              })
              .catch(() => {
                // Silenciar errores de fetch para offline
              });
            return response;
          }
          
          // Si no está en cache, fetch y cache
          return fetch(request)
            .then((fetchResponse) => {
              if (!fetchResponse.ok) {
                throw new Error('Network response was not ok');
              }
              
              // Cache solo para métodos seguros
              if (request.method === 'GET' || request.method === 'HEAD') {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(request, responseClone))
                  .catch((error) => {
                    console.warn('SW: Error al cachear respuesta estática:', error);
                  });
              }
              
              return fetchResponse;
            });
        })
        .catch(() => {
          // Para recursos de fuentes, fallback a fuentes del sistema
          if (request.url.includes('fonts.googleapis.com')) {
            return new Response('', {
              headers: { 'Content-Type': 'text/css' }
            });
          }
          
          // Para otros recursos, retornar página offline
          if (request.mode === 'navigate') {
            return caches.match('/index-seo-complete.html');
          }
        })
    );
    return;
  }
  
  // Para peticiones de API: Network First
  if (url.pathname.startsWith('/api/') || url.pathname.includes('analytics')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) {
            throw new Error('API response was not ok');
          }
          
          // Cache exit responses por 5 minutos (solo para métodos seguros)
          if (request.method === 'GET' || request.method === 'HEAD') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone))
              .catch((error) => {
                console.warn('SW: Error al cachear respuesta de API:', error);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback a cache si network falla
          return caches.match(request);
        })
    );
    return;
  }
  
  // Para páginas de navegación: Stale While Revalidate
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          const fetchPromise = fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.ok) {
                // Cache solo para métodos seguros
                if (request.method === 'GET' || request.method === 'HEAD') {
                  const responseClone = fetchResponse.clone();
                  caches.open(DYNAMIC_CACHE)
                    .then((cache) => cache.put(request, responseClone))
                    .catch((error) => {
                      console.warn('SW: Error al cachear respuesta de navegación:', error);
                    });
                }
              }
              return fetchResponse;
            })
            .catch(() => {
              // Fallback a página principal
              return caches.match('/index-seo-complete.html');
            });
          
          return response || fetchPromise;
        })
    );
    return;
  }
  
  // Para otros recursos: Network First con fallback a cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        // Cache responses exitosas (solo para métodos seguros)
        if (request.method === 'GET' || request.method === 'HEAD') {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => cache.put(request, responseClone))
            .catch((error) => {
              console.warn('SW: Error al cachear respuesta:', error);
            });
        }
        
        return response;
      })
      .catch((error) => {
        console.log('SW: Network failed, trying cache:', error);
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Si no hay cache y es una navegación, retornar página principal
            if (request.mode === 'navigate') {
              return caches.match('/index-seo-complete.html');
            }
            
            // Para otros recursos sin cache, retornar respuesta vacía o error
            return new Response('Resource not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background Sync para datos offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(
      // Sincronizar datos pendientes cuando vuelva la conexión
      syncPendingData()
    );
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nuevas métricas disponibles en iMetrics',
    icon: '/favicon.ico',
    badge: '/favicon-16x16.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver métricas',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/favicon-16x16.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('iMetrics', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Limpieza de cache dinámico
const cleanDynamicCache = (cacheName, maxItems = 50) => {
  caches.open(cacheName)
    .then((cache) => {
      return cache.keys()
        .then((keys) => {
          if (keys.length > maxItems) {
            const itemsToDelete = keys.slice(0, keys.length - maxItems);
            return Promise.all(
              itemsToDelete.map((key) => cache.delete(key))
            );
          }
        });
    });
};

// Sincronización de datos pendientes
const syncPendingData = () => {
  return new Promise((resolve) => {
    // Lógica para sincronizar datos guardados localmente
    console.log('SW: Sincronizando datos pendientes...');
    resolve();
  });
};

// Actualización periódica de cache
setInterval(() => {
  cleanDynamicCache(DYNAMIC_CACHE);
}, 24 * 60 * 60 * 1000); // Cada 24 horas

console.log('SW: Service Worker cargado exitosamente');