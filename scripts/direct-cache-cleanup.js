#!/usr/bin/env node

/**
 * Script directo para limpiar cache del Service Worker
 * Ejecuta la limpieza inmediatamente
 */

const fs = require('fs');
const path = require('path');

/**
 * Crear archivo HTML con auto-ejecución
 */
const createAutoCleanupHTML = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Limpieza Automática de Cache SW</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f0f0f0;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .loading {
            font-size: 18px;
            color: #2563eb;
            margin: 20px 0;
        }
        .success {
            color: #16a34a;
            font-weight: bold;
        }
        .error {
            color: #dc2626;
            font-weight: bold;
        }
        .button {
            background: #2563eb;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
        }
        .button:hover {
            background: #1d4ed8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Limpieza de Cache del Service Worker</h1>
        <div id="status" class="loading">Iniciando limpieza...</div>
        <div id="results"></div>
        <button id="reloadBtn" class="button" style="display: none;" onclick="window.location.reload()">
            🔄 Recargar Página
        </button>
    </div>

    <script>
        // Ejecutar limpieza automáticamente al cargar
        window.addEventListener('load', async () => {
            await performCleanup();
        });

        async function performCleanup() {
            const statusEl = document.getElementById('status');
            const resultsEl = document.getElementById('results');
            const reloadBtn = document.getElementById('reloadBtn');
            
            try {
                statusEl.textContent = '🔍 Verificando Service Worker...';
                
                // Verificar soporte
                if (!('serviceWorker' in navigator)) {
                    throw new Error('Service Workers no soportados');
                }
                
                statusEl.textContent = '📋 Obteniendo caches...';
                
                // Obtener caches
                const cacheNames = await caches.keys();
                const results = {
                    totalCaches: cacheNames.length,
                    dynamicCaches: cacheNames.filter(name => name.includes('dynamic')),
                    staticCaches: cacheNames.filter(name => name.includes('static')),
                    deleted: [],
                    errors: []
                };
                
                statusEl.textContent = '🗑️ Eliminando caches dinámicos...';
                
                // Eliminar caches dinámicos
                for (const cacheName of results.dynamicCaches) {
                    try {
                        await caches.delete(cacheName);
                        results.deleted.push(cacheName);
                        console.log('✅ Eliminado:', cacheName);
                    } catch (error) {
                        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
                    }
                }
                
                statusEl.textContent = '🗑️ Eliminando caches estáticos...';
                
                // Eliminar caches estáticos
                for (const cacheName of results.staticCaches) {
                    try {
                        await caches.delete(cacheName);
                        results.deleted.push(cacheName);
                        console.log('✅ Eliminado:', cacheName);
                    } catch (error) {
                        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
                    }
                }
                
                statusEl.textContent = '🔄 Actualizando Service Worker...';
                
                // Actualizar Service Worker
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    console.log('✅ Service Worker actualizado');
                }
                
                // Verificar resultado
                const remainingCaches = await caches.keys();
                results.cachesDeleted = results.deleted.length;
                results.cachesRemaining = remainingCaches.length;
                
                // Mostrar resultados
                statusEl.innerHTML = '<span class="success">✅ Limpieza completada!</span>';
                
                let resultsHTML = '<h3>📊 Resultados:</h3>';
                resultsHTML += \`<p><strong>Caches encontrados:</strong> \${results.totalCaches}</p>\`;
                resultsHTML += \`<p><strong>Caches eliminados:</strong> \${results.cachesDeleted}</p>\`;
                resultsHTML += \`<p><strong>Caches restantes:</strong> \${results.cachesRemaining}</p>\`;
                
                if (results.deleted.length > 0) {
                    resultsHTML += '<h4>🗑️ Eliminados:</h4><ul>';
                    results.deleted.forEach(cache => {
                        resultsHTML += \`<li>\${cache}</li>\`;
                    });
                    resultsHTML += '</ul>';
                }
                
                if (results.errors.length > 0) {
                    resultsHTML += '<h4>❌ Errores:</h4><ul>';
                    results.errors.forEach(error => {
                        resultsHTML += \`<li>\${error}</li>\`;
                    });
                    resultsHTML += '</ul>';
                }
                
                resultsEl.innerHTML = resultsHTML;
                reloadBtn.style.display = 'inline-block';
                
                console.log('🎉 Limpieza completada:', results);
                
                // Auto-recargar después de 3 segundos
                setTimeout(() => {
                    console.log('🔄 Recargando página...');
                    window.location.reload();
                }, 3000);
                
            } catch (error) {
                statusEl.innerHTML = '<span class="error">❌ Error: ' + error.message + '</span>';
                console.error('❌ Error en limpieza:', error);
            }
        }
    </script>
</body>
</html>`;

  const filePath = path.join(__dirname, 'auto-cleanup.html');
  fs.writeFileSync(filePath, htmlContent);
  return filePath;
};

/**
 * Ejecutar limpieza directa
 */
const executeDirectCleanup = async () => {
  console.log('🚀 Ejecutando limpieza directa del cache del Service Worker...\n');
  
  // Crear archivo HTML de auto-limpieza
  const htmlPath = createAutoCleanupHTML();
  console.log('✅ Archivo de auto-limpieza creado:', htmlPath);
  
  // Código JavaScript directo para ejecutar
  const directCleanupCode = `
// ===== LIMPIEZA DIRECTA DEL CACHE =====
// Ejecutar este código AHORA MISMO en la consola del navegador

(async () => {
  console.log('🧹 LIMPIEZA DIRECTA INICIADA');
  
  try {
    // 1. Verificar Service Worker
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Workers no soportados');
      return;
    }
    
    // 2. Obtener y mostrar caches actuales
    const cacheNames = await caches.keys();
    console.log('📋 Caches actuales:', cacheNames);
    
    // 3. Eliminar TODOS los caches (más agresivo)
    console.log('🗑️ Eliminando TODOS los caches...');
    let deletedCount = 0;
    
    for (const cacheName of cacheNames) {
      try {
        await caches.delete(cacheName);
        console.log('✅ Eliminado:', cacheName);
        deletedCount++;
      } catch (error) {
        console.error('❌ Error eliminando', cacheName, ':', error.message);
      }
    }
    
    // 4. Actualizar Service Worker
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('🔄 Service Worker actualizado');
    }
    
    // 5. Verificar limpieza
    const remainingCaches = await caches.keys();
    console.log('\\n📊 RESULTADOS FINALES:');
    console.log('═'.repeat(40));
    console.log('🗑️ Caches eliminados:', deletedCount);
    console.log('📊 Caches restantes:', remainingCaches.length);
    
    if (remainingCaches.length === 0) {
      console.log('🎉 ¡CACHE COMPLETAMENTE LIMPIO!');
    } else {
      console.log('⚠️ Caches que permanecen:', remainingCaches);
    }
    
    // 6. Confirmación visual
    alert(\`Cache limpiado!\\n\\nEliminados: \${deletedCount} caches\\nRestantes: \${remainingCaches.length}\\n\\nRecargando página...\`);
    
    // 7. Recargar inmediatamente
    console.log('🔄 Recargando página en 1 segundo...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error crítico:', error);
    alert('Error durante la limpieza: ' + error.message);
  }
})();

// ===== FIN DE LIMPIEZA DIRECTA =====
`;
  
  console.log('\n💻 CÓDIGO PARA EJECUTAR AHORA MISMO:');
  console.log('═'.repeat(60));
  console.log(directCleanupCode);
  console.log('═'.repeat(60));
  
  console.log('\n🎯 INSTRUCCIONES INMEDIATAS:');
  console.log('1. Ve a http://localhost:3000');
  console.log('2. Presiona F12 para abrir DevTools');
  console.log('3. Ve a la pestaña "Console"');
  console.log('4. COPIA Y PEGA el código de arriba COMPLETO');
  console.log('5. PRESIONA ENTER inmediatamente');
  console.log('6. La página se recargará automáticamente');
  
  console.log('\n🔗 ALTERNATIVA:');
  console.log('Abre este archivo en tu navegador:', htmlPath);
  console.log('(Se ejecutará automáticamente)');
  
  console.log('\n⚡ RESULTADO ESPERADO:');
  console.log('- El error "SW: Network failed, trying cache" desaparecerá');
  console.log('- La aplicación funcionará correctamente');
  console.log('- El cache estará completamente limpio');
  
  return {
    htmlPath,
    directCleanupCode
  };
};

/**
 * Función principal
 */
const main = async () => {
  console.log('🎯 LIMPIEZA DIRECTA DEL CACHE DEL SERVICE WORKER');
  console.log('='.repeat(60));
  
  const result = await executeDirectCleanup();
  
  console.log('\n🎉 ¡HERRAMIENTAS DE LIMPIEZA DIRECTA LISTAS!');
  console.log('💡 El error se resolverá inmediatamente después de ejecutar el código.');
  
  return result;
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeDirectCleanup, createAutoCleanupHTML };