const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001; // Puerto diferente para el endpoint de limpieza

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para limpiar cache del Service Worker
app.post('/api/clear-service-worker-cache', async (req, res) => {
  try {
    console.log('🧹 Iniciando limpieza de cache del Service Worker...');
    
    // Simular limpieza de cache (en un entorno real, esto se haría en el cliente)
    const cleanupScript = `
      // Este código se ejecutará en el navegador del cliente
      (async () => {
        try {
          console.log('🧹 Limpiando cache del Service Worker...');
          
          // 1. Obtener todos los caches
          const cacheNames = await caches.keys();
          console.log('📋 Caches encontrados:', cacheNames);
          
          const results = {
            totalCaches: cacheNames.length,
            dynamicCaches: cacheNames.filter(name => name.includes('dynamic')),
            staticCaches: cacheNames.filter(name => name.includes('static')),
            deleted: [],
            errors: []
          };
          
          // 2. Eliminar caches dinámicos
          for (const cacheName of results.dynamicCaches) {
            try {
              await caches.delete(cacheName);
              results.deleted.push(cacheName);
              console.log('✅ Eliminado cache dinámico:', cacheName);
            } catch (error) {
              results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
            }
          }
          
          // 3. Eliminar caches estáticos
          for (const cacheName of results.staticCaches) {
            try {
              await caches.delete(cacheName);
              results.deleted.push(cacheName);
              console.log('✅ Eliminado cache estático:', cacheName);
            } catch (error) {
              results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
            }
          }
          
          // 4. Actualizar Service Worker
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
            console.log('✅ Service Worker actualizado');
          }
          
          // 5. Verificar limpieza
          const remainingCaches = await caches.keys();
          results.cachesDeleted = results.deleted.length;
          results.cachesRemaining = remainingCaches.length;
          
          console.log('📊 Resultados:', results);
          
          // 6. Recargar página
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
          return results;
          
        } catch (error) {
          console.error('❌ Error:', error);
          return { error: error.message };
        }
      })();
    `;
    
    res.json({
      success: true,
      message: 'Script de limpieza generado',
      script: cleanupScript,
      instructions: [
        '1. Abre http://localhost:3000 en tu navegador',
        '2. Abre DevTools (F12) y ve a Console',
        '3. Pega y ejecuta el script proporcionado',
        '4. La página se recargará automáticamente'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error en endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener información del cache
app.get('/api/cache-info', async (req, res) => {
  try {
    const cacheInfoScript = `
      (async () => {
        try {
          const cacheNames = await caches.keys();
          const info = {
            totalCaches: cacheNames.length,
            cacheNames: cacheNames,
            dynamicCaches: cacheNames.filter(name => name.includes('dynamic')),
            staticCaches: cacheNames.filter(name => name.includes('static')),
            timestamp: new Date().toISOString()
          };
          
          console.log('📊 Información del cache:', info);
          return info;
          
        } catch (error) {
          console.error('❌ Error obteniendo info del cache:', error);
          return { error: error.message };
        }
      })();
    `;
    
    res.json({
      success: true,
      script: cacheInfoScript,
      instructions: [
        'Ejecuta este script en la consola del navegador para ver el estado actual del cache'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Servir archivos estáticos si es necesario
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de limpieza de cache iniciado en puerto ${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   - POST http://localhost:${PORT}/api/clear-service-worker-cache`);
  console.log(`   - GET  http://localhost:${PORT}/api/cache-info`);
  console.log(`\\n💡 Para limpiar el cache:`);
  console.log(`   1. Ejecuta: curl -X POST http://localhost:${PORT}/api/clear-service-worker-cache`);
  console.log(`   2. Copia el script que devuelve`);
  console.log(`   3. Pégalo en la consola del navegador (F12)`);
  console.log(`   4. Presiona Enter`);
});

module.exports = app;