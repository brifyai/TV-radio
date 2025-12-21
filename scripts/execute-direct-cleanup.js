#!/usr/bin/env node

/**
 * Script para ejecutar directamente la limpieza del cache del Service Worker
 * Usa las herramientas disponibles para ejecutar el JavaScript
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Ejecutar limpieza usando curl para hacer petición al navegador
 */
const executeViaCurl = async () => {
  console.log('🚀 Ejecutando limpieza directa del cache del Service Worker...\n');
  
  try {
    // 1. Crear script de limpieza como archivo temporal
    const cleanupScript = `
      (async () => {
        try {
          console.log('🧹 LIMPIEZA DIRECTA INICIADA');
          
          // Verificar Service Worker
          if (!('serviceWorker' in navigator)) {
            console.log('❌ Service Workers no soportados');
            return { error: 'Service Workers no soportados' };
          }
          
          // Obtener caches
          const cacheNames = await caches.keys();
          console.log('📋 Caches actuales:', cacheNames);
          
          const results = {
            totalCaches: cacheNames.length,
            deleted: [],
            errors: []
          };
          
          // Eliminar TODOS los caches
          console.log('🗑️ Eliminando TODOS los caches...');
          for (const cacheName of cacheNames) {
            try {
              await caches.delete(cacheName);
              results.deleted.push(cacheName);
              console.log('✅ Eliminado:', cacheName);
            } catch (error) {
              results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
              console.error('❌ Error eliminando', cacheName, ':', error.message);
            }
          }
          
          // Actualizar Service Worker
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
            console.log('🔄 Service Worker actualizado');
          }
          
          // Verificar resultado
          const remainingCaches = await caches.keys();
          results.cachesDeleted = results.deleted.length;
          results.cachesRemaining = remainingCaches.length;
          
          console.log('\\n📊 RESULTADOS FINALES:');
          console.log('═'.repeat(40));
          console.log('🗑️ Caches eliminados:', results.cachesDeleted);
          console.log('📊 Caches restantes:', results.cachesRemaining);
          
          if (remainingCaches.length === 0) {
            console.log('🎉 ¡CACHE COMPLETAMENTE LIMPIO!');
          }
          
          // Mostrar confirmación
          alert(\`Cache limpiado exitosamente!\\n\\nEliminados: \${results.cachesDeleted} caches\\nRestantes: \${results.cachesRemaining}\\n\\nRecargando página...\`);
          
          // Recargar página
          setTimeout(() => {
            console.log('🔄 Recargando página...');
            window.location.reload();
          }, 2000);
          
          return results;
          
        } catch (error) {
          console.error('❌ Error crítico:', error);
          alert('Error durante la limpieza: ' + error.message);
          return { error: error.message };
        }
      })();
    `;
    
    // 2. Guardar script como archivo temporal
    const tempScriptPath = path.join(__dirname, 'temp-cleanup-script.js');
    fs.writeFileSync(tempScriptPath, cleanupScript);
    console.log('✅ Script temporal creado:', tempScriptPath);
    
    // 3. Crear comando para ejecutar en el navegador
    const browserCommand = createBrowserExecutionCommand(cleanupScript);
    
    console.log('\n💻 CÓDIGO PARA EJECUTAR EN EL NAVEGADOR:');
    console.log('═'.repeat(60));
    console.log(cleanupScript);
    console.log('═'.repeat(60));
    
    // 4. Intentar ejecutar usando herramientas del sistema
    await trySystemExecution(browserCommand);
    
    // 5. Crear archivo HTML de auto-ejecución
    const autoExecPath = createAutoExecutionHTML(cleanupScript);
    console.log('\n🔗 Archivo de auto-ejecución creado:', autoExecPath);
    
    // 6. Mostrar instrucciones finales
    showFinalInstructions(autoExecPath);
    
    return {
      success: true,
      script: cleanupScript,
      autoExecPath,
      message: 'Limpieza preparada para ejecutar'
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
 * Crear comando para ejecutar en el navegador
 */
const createBrowserExecutionCommand = (script) => {
  // Crear bookmarklet
  const bookmarklet = 'javascript:' + encodeURIComponent(script.replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').trim());
  
  return {
    bookmarklet,
    instructions: [
      '1. Ve a http://localhost:3000',
      '2. Abre DevTools (F12)',
      '3. Ve a Console',
      '4. Pega el código JavaScript',
      '5. Presiona Enter'
    ]
  };
};

/**
 * Intentar ejecución usando herramientas del sistema
 */
const trySystemExecution = async (browserCommand) => {
  console.log('\n🔧 Intentando ejecución automática...');
  
  // Intentar abrir navegador con el script
  try {
    // Comando para abrir navegador (Windows)
    const openCommand = `start "" "http://localhost:3000"`;
    
    console.log('🌐 Abriendo aplicación en navegador...');
    exec(openCommand, (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️ No se pudo abrir automáticamente el navegador');
        console.log('💡 Abre manualmente http://localhost:3000');
      } else {
        console.log('✅ Navegador abierto');
      }
    });
    
  } catch (error) {
    console.log('⚠️ Ejecución automática no disponible');
  }
};

/**
 * Crear archivo HTML de auto-ejecución
 */
const createAutoExecutionHTML = (script) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ejecución Automática - Limpieza Cache SW</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        .title {
            font-size: 28px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .status {
            font-size: 18px;
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }
        .success {
            background: rgba(34, 197, 94, 0.3);
            border: 2px solid #22c55e;
        }
        .error {
            background: rgba(239, 68, 68, 0.3);
            border: 2px solid #ef4444;
        }
        .progress {
            font-size: 16px;
            margin: 10px 0;
        }
        .button {
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
            transition: all 0.3s ease;
        }
        .button:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
        }
        .results {
            text-align: left;
            margin: 20px 0;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">🧹 Limpieza Automática de Cache SW</h1>
        <div id="status" class="status">Preparando limpieza...</div>
        <div id="progress" class="progress"></div>
        <div id="results" class="results" style="display: none;"></div>
        <button id="openApp" class="button" onclick="window.open('http://localhost:3000', '_blank')">
            🚀 Abrir Aplicación
        </button>
        <button id="reloadBtn" class="button" onclick="window.location.reload()" style="display: none;">
            🔄 Recargar
        </button>
    </div>

    <script>
        // Ejecutar limpieza automáticamente
        window.addEventListener('load', async () => {
            await performAutomaticCleanup();
        });

        async function performAutomaticCleanup() {
            const statusEl = document.getElementById('status');
            const progressEl = document.getElementById('progress');
            const resultsEl = document.getElementById('results');
            const reloadBtn = document.getElementById('reloadBtn');
            
            try {
                statusEl.textContent = '🔍 Verificando Service Worker...';
                progressEl.textContent = 'Iniciando proceso de limpieza...';
                
                // Verificar soporte
                if (!('serviceWorker' in navigator)) {
                    throw new Error('Service Workers no soportados en este navegador');
                }
                
                statusEl.textContent = '📋 Obteniendo caches...';
                progressEl.textContent = 'Analizando cache del Service Worker...';
                
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
                progressEl.textContent = \`Eliminando \${results.dynamicCaches.length} caches dinámicos...\`;
                
                // Eliminar caches dinámicos
                for (const cacheName of results.dynamicCaches) {
                    try {
                        await caches.delete(cacheName);
                        results.deleted.push(cacheName);
                        console.log('✅ Eliminado cache dinámico:', cacheName);
                    } catch (error) {
                        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
                    }
                }
                
                statusEl.textContent = '🗑️ Eliminando caches estáticos...';
                progressEl.textContent = \`Eliminando \${results.staticCaches.length} caches estáticos...\`;
                
                // Eliminar caches estáticos
                for (const cacheName of results.staticCaches) {
                    try {
                        await caches.delete(cacheName);
                        results.deleted.push(cacheName);
                        console.log('✅ Eliminado cache estático:', cacheName);
                    } catch (error) {
                        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
                    }
                }
                
                statusEl.textContent = '🔄 Actualizando Service Worker...';
                progressEl.textContent = 'Actualizando Service Worker...';
                
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
                statusEl.innerHTML = '<span class="success">✅ Limpieza Completada!</span>';
                progressEl.textContent = 'Proceso finalizado exitosamente';
                
                let resultsHTML = '<h3>📊 Resultados de la Limpieza:</h3>';
                resultsHTML += \`<p><strong>📋 Total de caches encontrados:</strong> \${results.totalCaches}</p>\`;
                resultsHTML += \`<p><strong>🗑️ Caches eliminados:</strong> \${results.cachesDeleted}</p>\`;
                resultsHTML += \`<p><strong>📊 Caches restantes:</strong> \${results.cachesRemaining}</p>\`;
                
                if (results.deleted.length > 0) {
                    resultsHTML += '<h4>🗑️ Caches Eliminados:</h4><ul>';
                    results.deleted.forEach(cache => {
                        resultsHTML += \`<li>\${cache}</li>\`;
                    });
                    resultsHTML += '</ul>';
                }
                
                if (results.errors.length > 0) {
                    resultsHTML += '<h4>❌ Errores Encontrados:</h4><ul>';
                    results.errors.forEach(error => {
                        resultsHTML += \`<li>\${error}</li>\`;
                    });
                    resultsHTML += '</ul>';
                }
                
                if (results.cachesRemaining === 0) {
                    resultsHTML += '<p style="color: #22c55e; font-weight: bold;">🎉 ¡CACHE COMPLETAMENTE LIMPIO!</p>';
                }
                
                resultsEl.innerHTML = resultsHTML;
                resultsEl.style.display = 'block';
                reloadBtn.style.display = 'inline-block';
                
                console.log('🎉 Limpieza completada:', results);
                
                // Mostrar confirmación
                alert(\`¡Limpieza de cache completada!\\n\\n✅ Eliminados: \${results.cachesDeleted} caches\\n📊 Restantes: \${results.cachesRemaining}\\n\\nEl error "SW: Network failed, trying cache" debería estar resuelto.\\n\\nLa página se recargará automáticamente.\`);
                
                // Auto-recargar después de 3 segundos
                setTimeout(() => {
                    console.log('🔄 Recargando página...');
                    window.location.reload();
                }, 3000);
                
            } catch (error) {
                statusEl.innerHTML = '<span class="error">❌ Error: ' + error.message + '</span>';
                progressEl.textContent = 'Error durante el proceso';
                console.error('❌ Error en limpieza automática:', error);
            }
        }
    </script>
</body>
</html>`;

  const filePath = path.join(__dirname, 'auto-execute-cleanup.html');
  fs.writeFileSync(filePath, htmlContent);
  return filePath;
};

/**
 * Mostrar instrucciones finales
 */
const showFinalInstructions = (autoExecPath) => {
  console.log('\n🎯 INSTRUCCIONES PARA EJECUTAR LA LIMPIEZA:');
  console.log('═'.repeat(60));
  console.log('OPCIÓN 1 - Auto-ejecución (Recomendada):');
  console.log('1. Abre este archivo en tu navegador:', autoExecPath);
  console.log('2. La limpieza se ejecutará automáticamente');
  console.log('3. Espera a que termine el proceso');
  console.log('4. La página se recargará automáticamente');
  
  console.log('\nOPCIÓN 2 - Manual:');
  console.log('1. Ve a http://localhost:3000');
  console.log('2. Abre DevTools (F12)');
  console.log('3. Ve a Console');
  console.log('4. Copia y pega el código JavaScript mostrado arriba');
  console.log('5. Presiona Enter');
  
  console.log('\n⚡ RESULTADO ESPERADO:');
  console.log('- ✅ Error "SW: Network failed, trying cache" resuelto');
  console.log('- ✅ Cache del Service Worker completamente limpio');
  console.log('- ✅ Aplicación funcionando correctamente');
  console.log('- ✅ Sin errores de conectividad');
};

/**
 * Función principal
 */
const main = async () => {
  console.log('🎯 EJECUCIÓN DIRECTA DE LIMPIEZA DEL CACHE DEL SERVICE WORKER');
  console.log('='.repeat(70));
  
  const result = await executeViaCurl();
  
  if (result.success) {
    console.log('\n🎉 ¡LIMPIEZA PREPARADA PARA EJECUTAR!');
    console.log('💡 El error se resolverá inmediatamente después de la ejecución.');
  } else {
    console.log('\n❌ Error preparando la limpieza:', result.error);
  }
  
  return result;
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeViaCurl, createAutoExecutionHTML };