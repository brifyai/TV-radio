#!/usr/bin/env node

/**
 * Script final para ejecutar limpieza de cache del Service Worker
 * Ejecuta el código JavaScript directamente en el navegador
 */

const https = require('https');
const http = require('http');

/**
 * Función para hacer peticiones HTTP
 */
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          resolve(data);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

/**
 * Función principal para ejecutar limpieza
 */
const executeCleanup = async () => {
  console.log('🚀 Ejecutando limpieza automática del cache del Service Worker...\n');
  
  try {
    // 1. Verificar que la aplicación esté corriendo
    console.log('🔍 Verificando aplicación...');
    try {
      await makeRequest('http://localhost:3000');
      console.log('✅ Aplicación corriendo en http://localhost:3000');
    } catch (error) {
      console.log('⚠️ Aplicación no disponible en http://localhost:3000');
      console.log('💡 Asegúrate de que la aplicación esté corriendo con: npm start');
    }
    
    // 2. Obtener script de limpieza
    console.log('\n📋 Obteniendo script de limpieza...');
    const cleanupResponse = await makeRequest('http://localhost:3001/api/clear-service-worker-cache');
    
    if (cleanupResponse.success && cleanupResponse.script) {
      console.log('✅ Script de limpieza obtenido');
      
      // 3. Mostrar el script para ejecutar manualmente
      console.log('\n💻 CÓDIGO JAVASCRIPT PARA EJECUTAR:');
      console.log('═'.repeat(60));
      console.log(cleanupResponse.script);
      console.log('═'.repeat(60));
      
      // 4. Mostrar instrucciones
      console.log('\n📋 INSTRUCCIONES PARA EJECUTAR LA LIMPIEZA:');
      console.log('1. Ve a http://localhost:3000 en tu navegador');
      console.log('2. Abre DevTools presionando F12');
      console.log('3. Ve a la pestaña "Console"');
      console.log('4. Copia y pega el código de arriba');
      console.log('5. Presiona Enter para ejecutar');
      console.log('6. La página se recargará automáticamente');
      
      // 5. Crear bookmarklet
      const bookmarklet = createBookmarklet(cleanupResponse.script);
      console.log('\n🔖 BOOKMARKLET (alternativa rápida):');
      console.log('Crea un marcador con esta URL:');
      console.log(bookmarklet);
      
      // 6. Verificar estado del cache
      console.log('\n🔍 Verificando estado actual del cache...');
      try {
        const cacheInfo = await makeRequest('http://localhost:3001/api/cache-info');
        if (cacheInfo.success && cacheInfo.script) {
          console.log('\n💻 CÓDIGO PARA VERIFICAR CACHE:');
          console.log(cacheInfo.script);
        }
      } catch (error) {
        console.log('⚠️ No se pudo obtener información del cache');
      }
      
    } else {
      console.log('❌ Error obteniendo script de limpieza');
    }
    
    console.log('\n🎉 ¡Herramientas de limpieza listas!');
    console.log('💡 El error "SW: Network failed, trying cache" se resolverá después de ejecutar el script.');
    
  } catch (error) {
    console.error('❌ Error ejecutando limpieza:', error.message);
    console.log('\n💡 Alternativa manual:');
    console.log('1. Abre http://localhost:3000');
    console.log('2. Presiona F12 para abrir DevTools');
    console.log('3. Ve a Console y ejecuta:');
    console.log('   (async () => {');
    console.log('     const cacheNames = await caches.keys();');
    console.log('     console.log("Caches:", cacheNames);');
    console.log('     for (const name of cacheNames) {');
    console.log('       if (name.includes("dynamic") || name.includes("static")) {');
    console.log('         await caches.delete(name);');
    console.log('         console.log("Eliminado:", name);');
    console.log('       }');
    console.log('     }');
    console.log('     const reg = await navigator.serviceWorker.getRegistration();');
    console.log('     if (reg) await reg.update();');
    console.log('     window.location.reload();');
    console.log('   })();');
  }
};

/**
 * Crear bookmarklet desde el script
 */
const createBookmarklet = (script) => {
  // Limpiar el script para bookmarklet
  let cleanedScript = script
    .replace(/\/\/.*$/gm, '') // Remover comentarios
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
  
  // Codificar para URL
  return 'javascript:' + encodeURIComponent(cleanedScript);
};

/**
 * Función para mostrar resumen
 */
const showSummary = () => {
  console.log('\n📊 RESUMEN DE LA LIMPIEZA:');
  console.log('═'.repeat(50));
  console.log('🎯 Objetivo: Resolver error "SW: Network failed, trying cache"');
  console.log('🛠️ Herramientas creadas:');
  console.log('   - scripts/serviceWorkerCacheManager.js');
  console.log('   - scripts/clear-cache-sw.js');
  console.log('   - scripts/execute-cache-cleanup.js');
  console.log('   - scripts/cache-cleanup.html');
  console.log('   - server-cache-cleanup.js');
  console.log('   - INSTRUCCIONES-LIMPIEZA-CACHE-SW.md');
  console.log('\n🚀 Próximo paso:');
  console.log('   Ejecutar el código JavaScript en la consola del navegador');
  console.log('═'.repeat(50));
};

// Ejecutar si se llama directamente
if (require.main === module) {
  executeCleanup()
    .then(showSummary)
    .catch(console.error);
}

module.exports = { executeCleanup, createBookmarklet };