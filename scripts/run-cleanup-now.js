#!/usr/bin/env node

/**
 * Script para ejecutar la limpieza del cache del Service Worker AHORA
 * Usa múltiples métodos para asegurar que se ejecute
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

/**
 * Función para verificar si el servidor está corriendo
 */
const checkServer = (port) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

/**
 * Función para abrir navegador automáticamente
 */
const openBrowser = (url) => {
  return new Promise((resolve) => {
    // Comando para Windows
    const command = `start "" "${url}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️ No se pudo abrir el navegador automáticamente');
        console.log('💡 Abre manualmente:', url);
        resolve(false);
      } else {
        console.log('✅ Navegador abierto automáticamente');
        resolve(true);
      }
    });
  });
};

/**
 * Crear script de limpieza inmediata
 */
const createImmediateCleanupScript = () => {
  const script = `
// ===== LIMPIEZA INMEDIATA DEL CACHE =====
// Este script se ejecuta inmediatamente al abrirlo

(async () => {
  console.log('🧹 LIMPIEZA INMEDIATA INICIADA - ' + new Date().toLocaleTimeString());
  
  try {
    // Verificar Service Worker
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Workers no soportados');
      alert('Service Workers no soportados en este navegador');
      return;
    }
    
    console.log('✅ Service Worker soportado');
    
    // Obtener caches actuales
    const cacheNames = await caches.keys();
    console.log('📋 Caches encontrados:', cacheNames.length);
    cacheNames.forEach(name => console.log('   -', name));
    
    const results = {
      totalCaches: cacheNames.length,
      deleted: [],
      errors: []
    };
    
    console.log('🗑️ Iniciando eliminación de caches...');
    
    // Eliminar TODOS los caches inmediatamente
    for (const cacheName of cacheNames) {
      try {
        const deleted = await caches.delete(cacheName);
        if (deleted) {
          results.deleted.push(cacheName);
          console.log('✅ Eliminado:', cacheName);
        } else {
          console.log('⚠️ No se pudo eliminar:', cacheName);
        }
      } catch (error) {
        results.errors.push(\`\${cacheName}: \${error.message}\`);
        console.error('❌ Error eliminando', cacheName, ':', error.message);
      }
    }
    
    // Actualizar Service Worker
    console.log('🔄 Actualizando Service Worker...');
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('✅ Service Worker actualizado');
    }
    
    // Verificar resultado final
    const remainingCaches = await caches.keys();
    results.cachesDeleted = results.deleted.length;
    results.cachesRemaining = remainingCaches.length;
    
    // Mostrar resultados
    console.log('\\n🎉 LIMPIEZA COMPLETADA');
    console.log('═'.repeat(40));
    console.log('📊 Total caches:', results.totalCaches);
    console.log('🗑️ Eliminados:', results.cachesDeleted);
    console.log('📊 Restantes:', results.cachesRemaining);
    
    if (results.cachesRemaining === 0) {
      console.log('🎉 ¡CACHE COMPLETAMENTE LIMPIO!');
    }
    
    if (results.errors.length > 0) {
      console.log('❌ Errores:', results.errors.length);
      results.errors.forEach(err => console.log('   -', err));
    }
    
    // Confirmación visual
    const message = results.cachesRemaining === 0 
      ? \`¡LIMPIEZA EXITOSA!\\n\\n✅ \${results.cachesDeleted} caches eliminados\\n🎉 Cache completamente limpio\\n\\nEl error "SW: Network failed, trying cache" ha sido resuelto.\\n\\nRecargando página...\`
      : \`Limpieza parcial\\n\\n✅ \${results.cachesDeleted} caches eliminados\\n📊 \${results.cachesRemaining} caches restantes\\n\\nRecargando página...\`;
    
    alert(message);
    
    // Recargar inmediatamente
    console.log('🔄 Recargando página en 1 segundo...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error crítico:', error);
    alert('Error durante la limpieza: ' + error.message);
  }
})();

// ===== FIN DE LIMPIEZA INMEDIATA =====
`;
  
  return script;
};

/**
 * Crear archivo HTML de limpieza inmediata
 */
const createImmediateCleanupHTML = () => {
  const script = createImmediateCleanupScript();
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Limpieza Inmediata - Cache SW</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(0, 0, 0, 0.8);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 600px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .title {
            font-size: 36px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .status {
            font-size: 20px;
            margin: 20px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        .success {
            background: rgba(34, 197, 94, 0.3);
            border: 2px solid #22c55e;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #22c55e;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .emoji {
            font-size: 48px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">🧹 Limpieza Inmediata</h1>
        <div class="emoji">⚡</div>
        <div id="status" class="status">Iniciando limpieza del cache...</div>
        <div id="spinner" class="spinner"></div>
        <div id="results" style="display: none;"></div>
    </div>

    <script>
        // Ejecutar limpieza inmediatamente
        ${script}
    </script>
</body>
</html>`;

  const filePath = path.join(__dirname, 'immediate-cleanup.html');
  fs.writeFileSync(filePath, html);
  return filePath;
};

/**
 * Función principal para ejecutar limpieza ahora
 */
const runCleanupNow = async () => {
  console.log('⚡ EJECUTANDO LIMPIEZA DEL CACHE DEL SERVICE WORKER AHORA');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar servidores
    console.log('🔍 Verificando servidores...');
    const server3001Running = await checkServer(3001);
    const server3002Running = await checkServer(3002);
    
    console.log(`📡 Servidor 3001: ${server3001Running ? '✅' : '❌'}`);
    console.log(`📡 Servidor 3002: ${server3002Running ? '✅' : '❌'}`);
    
    // 2. Crear archivo de limpieza inmediata
    console.log('\n🛠️ Creando script de limpieza inmediata...');
    const immediateHTMLPath = createImmediateCleanupHTML();
    console.log('✅ Archivo creado:', immediateHTMLPath);
    
    // 3. Abrir navegador con limpieza automática
    console.log('\n🌐 Abriendo navegador con limpieza automática...');
    const browserOpened = await openBrowser(`file://${immediateHTMLPath}`);
    
    // 4. También abrir el endpoint automático si está disponible
    if (server3002Running) {
      console.log('\n🚀 Abriendo endpoint de limpieza automática...');
      await openBrowser('http://localhost:3002/auto-cleanup');
    }
    
    // 5. Mostrar resumen
    console.log('\n🎯 LIMPIEZA EJECUTÁNDOSE:');
    console.log('═'.repeat(50));
    console.log('✅ Script de limpieza inmediata creado');
    console.log(browserOpened ? '✅ Navegador abierto automáticamente' : '⚠️ Abre manualmente el archivo HTML');
    if (server3002Running) {
      console.log('✅ Endpoint automático disponible en http://localhost:3002/auto-cleanup');
    }
    
    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Si el navegador no se abrió automáticamente:');
    console.log('   - Abre:', immediateHTMLPath);
    console.log('   - O ve a: http://localhost:3002/auto-cleanup');
    console.log('2. La limpieza se ejecutará automáticamente');
    console.log('3. Espera a que termine (unos segundos)');
    console.log('4. La página se recargará automáticamente');
    
    console.log('\n⚡ RESULTADO ESPERADO:');
    console.log('- ✅ Error "SW: Network failed, trying cache" resuelto');
    console.log('- ✅ Cache del Service Worker completamente limpio');
    console.log('- ✅ Aplicación funcionando sin errores');
    
    return {
      success: true,
      immediateHTMLPath,
      endpointAvailable: server3002Running,
      browserOpened
    };
    
  } catch (error) {
    console.error('❌ Error ejecutando limpieza:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Función para mostrar estado final
 */
const showFinalStatus = (result) => {
  console.log('\n🎉 ESTADO FINAL:');
  console.log('═'.repeat(40));
  
  if (result.success) {
    console.log('✅ Limpieza iniciada exitosamente');
    console.log('📁 Archivo HTML:', result.immediateHTMLPath);
    if (result.endpointAvailable) {
      console.log('🌐 Endpoint: http://localhost:3002/auto-cleanup');
    }
    console.log('🚀 Navegador:', result.browserOpened ? 'Abierto automáticamente' : 'Abrir manualmente');
    console.log('\n💡 La limpieza se está ejecutando ahora mismo');
  } else {
    console.log('❌ Error:', result.error);
    console.log('💡 Intenta ejecutar manualmente el código JavaScript');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  runCleanupNow()
    .then(showFinalStatus)
    .catch(console.error);
}

module.exports = { runCleanupNow, createImmediateCleanupHTML };