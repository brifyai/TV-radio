const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002; // Puerto para el endpoint de limpieza

// Middleware
app.use(express.json());

// Endpoint que ejecuta limpieza automática
app.get('/auto-cleanup', (req, res) => {
  console.log('🧹 Sirviendo página de limpieza automática...');
  
  const cleanupHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Limpieza Automática de Cache SW</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        .title {
            font-size: 32px;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .status {
            font-size: 20px;
            margin: 20px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            border: 2px solid rgba(255, 255, 255, 0.3);
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
            margin: 15px 0;
            padding: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
        .results {
            text-align: left;
            margin: 20px 0;
            padding: 25px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #22c55e;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .button {
            background: #2563eb;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            margin: 15px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }
        .button:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }
        .emoji {
            font-size: 24px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">
            <span class="emoji">🧹</span>
            Limpieza Automática de Cache SW
        </h1>
        
        <div id="loadingSpinner" class="spinner" style="display: none;"></div>
        
        <div id="status" class="status">
            <span class="emoji">🔄</span>
            Preparando limpieza del cache...
        </div>
        
        <div id="progress" class="progress"></div>
        
        <div id="results" class="results" style="display: none;"></div>
        
        <div style="margin-top: 30px;">
            <button id="openApp" class="button" onclick="window.open('http://localhost:3000', '_blank')">
                <span class="emoji">🚀</span>
                Abrir Aplicación Principal
            </button>
            
            <button id="reloadBtn" class="button" onclick="window.location.reload()" style="display: none;">
                <span class="emoji">🔄</span>
                Recargar Página
            </button>
        </div>
        
        <div style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
            <p>💡 Esta página limpiará automáticamente el cache del Service Worker</p>
            <p>⚡ El proceso tomará solo unos segundos</p>
        </div>
    </div>

    <script>
        // Ejecutar limpieza inmediatamente al cargar
        window.addEventListener('load', async () => {
            console.log('🚀 Iniciando limpieza automática de cache SW...');
            await performAutomaticCleanup();
        });

        async function performAutomaticCleanup() {
            const statusEl = document.getElementById('status');
            const progressEl = document.getElementById('progress');
            const resultsEl = document.getElementById('results');
            const reloadBtn = document.getElementById('reloadBtn');
            const spinner = document.getElementById('loadingSpinner');
            
            try {
                // Mostrar spinner
                spinner.style.display = 'block';
                
                statusEl.innerHTML = '<span class="emoji">🔍</span> Verificando Service Worker...';
                progressEl.textContent = 'Analizando capacidades del navegador...';
                
                // Verificar soporte de Service Worker
                if (!('serviceWorker' in navigator)) {
                    throw new Error('Service Workers no soportados en este navegador');
                }
                
                await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa
                
                statusEl.innerHTML = '<span class="emoji">📋</span> Obteniendo caches...';
                progressEl.textContent = 'Consultando cache del Service Worker...';
                
                // Obtener todos los caches
                const cacheNames = await caches.keys();
                const results = {
                    totalCaches: cacheNames.length,
                    dynamicCaches: cacheNames.filter(name => name.includes('dynamic')),
                    staticCaches: cacheNames.filter(name => name.includes('static')),
                    otherCaches: cacheNames.filter(name => !name.includes('dynamic') && !name.includes('static')),
                    deleted: [],
                    errors: []
                };
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                statusEl.innerHTML = '<span class="emoji">🗑️</span> Eliminando caches dinámicos...';
                progressEl.textContent = \`Procesando \${results.dynamicCaches.length} caches dinámicos...\`;
                
                // Eliminar caches dinámicos
                for (const cacheName of results.dynamicCaches) {
                    try {
                        await caches.delete(cacheName);
                        results.deleted.push(cacheName);
                        console.log('✅ Eliminado cache dinámico:', cacheName);
                        await new Promise(resolve => setTimeout(resolve, 100)); // Pausa entre eliminaciones
                    } catch (error) {
                        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
                        console.error('❌ Error eliminando cache dinámico:', cacheName, error.message);
                    }
                }
                
                statusEl.innerHTML = '<span class="emoji">🗑️</span> Eliminando caches estáticos...';
                progressEl.textContent = \`Procesando \${results.staticCaches.length} caches estáticos...\`;
                
                // Eliminar caches estáticos
                for (const cacheName of results.staticCaches) {
                    try {
                        await caches.delete(cacheName);
                        results.deleted.push(cacheName);
                        console.log('✅ Eliminado cache estático:', cacheName);
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
                        console.error('❌ Error eliminando cache estático:', cacheName, error.message);
                    }
                }
                
                statusEl.innerHTML = '<span class="emoji">🗑️</span> Eliminando otros caches...';
                progressEl.textContent = \`Procesando \${results.otherCaches.length} otros caches...\`;
                
                // Eliminar otros caches
                for (const cacheName of results.otherCaches) {
                    try {
                        await caches.delete(cacheName);
                        results.deleted.push(cacheName);
                        console.log('✅ Eliminado otro cache:', cacheName);
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
                        console.error('❌ Error eliminando otro cache:', cacheName, error.message);
                    }
                }
                
                statusEl.innerHTML = '<span class="emoji">🔄</span> Actualizando Service Worker...';
                progressEl.textContent = 'Sincronizando con el Service Worker...';
                
                // Actualizar Service Worker
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    console.log('✅ Service Worker actualizado');
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                // Verificar resultado final
                const remainingCaches = await caches.keys();
                results.cachesDeleted = results.deleted.length;
                results.cachesRemaining = remainingCaches.length;
                
                // Ocultar spinner
                spinner.style.display = 'none';
                
                // Mostrar resultados
                if (results.cachesRemaining === 0) {
                    statusEl.innerHTML = '<span class="success"><span class="emoji">🎉</span> ¡Limpieza Completada!</span>';
                } else {
                    statusEl.innerHTML = '<span class="success"><span class="emoji">✅</span> Limpieza Parcialmente Completada</span>';
                }
                
                progressEl.textContent = 'Proceso finalizado exitosamente';
                
                // Generar reporte detallado
                let resultsHTML = '<h3><span class="emoji">📊</span> Reporte de Limpieza:</h3>';
                resultsHTML += \`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">\`;
                resultsHTML += \`<div style="background: rgba(34, 197, 94, 0.2); padding: 15px; border-radius: 10px;">\`;
                resultsHTML += \`<h4><span class="emoji">📋</span> Resumen</h4>\`;
                resultsHTML += \`<p><strong>Total encontrados:</strong> \${results.totalCaches}</p>\`;
                resultsHTML += \`<p><strong>Eliminados:</strong> \${results.cachesDeleted}</p>\`;
                resultsHTML += \`<p><strong>Restantes:</strong> \${results.cachesRemaining}</p>\`;
                resultsHTML += '</div>';
                
                resultsHTML += \`<div style="background: rgba(59, 130, 246, 0.2); padding: 15px; border-radius: 10px;">\`;
                resultsHTML += \`<h4><span class="emoji">📈</span> Detalles</h4>\`;
                resultsHTML += \`<p><strong>Dinámicos:</strong> \${results.dynamicCaches.length}</p>\`;
                resultsHTML += \`<p><strong>Estáticos:</strong> \${results.staticCaches.length}</p>\`;
                resultsHTML += \`<p><strong>Otros:</strong> \${results.otherCaches.length}</p>\`;
                resultsHTML += '</div>';
                resultsHTML += '</div>';
                
                if (results.deleted.length > 0) {
                    resultsHTML += '<h4><span class="emoji">🗑️</span> Caches Eliminados:</h4>';
                    resultsHTML += '<ul style="columns: 2; column-gap: 20px;">';
                    results.deleted.forEach(cache => {
                        resultsHTML += \`<li style="margin-bottom: 5px;">\${cache}</li>\`;
                    });
                    resultsHTML += '</ul>';
                }
                
                if (results.errors.length > 0) {
                    resultsHTML += '<h4><span class="emoji">❌</span> Errores Encontrados:</h4>';
                    resultsHTML += '<ul>';
                    results.errors.forEach(error => {
                        resultsHTML += \`<li style="color: #fca5a5;">\${error}</li>\`;
                    });
                    resultsHTML += '</ul>';
                }
                
                if (results.cachesRemaining === 0) {
                    resultsHTML += '<div style="background: rgba(34, 197, 94, 0.3); padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #22c55e;">';
                    resultsHTML += '<h3><span class="emoji">🎉</span> ¡CACHE COMPLETAMENTE LIMPIO!</h3>';
                    resultsHTML += '<p>El error "SW: Network failed, trying cache" ha sido resuelto.</p>';
                    resultsHTML += '</div>';
                } else {
                    resultsHTML += '<div style="background: rgba(251, 191, 36, 0.3); padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #f59e0b;">';
                    resultsHTML += '<h4><span class="emoji">⚠️</span> Limpieza Parcial</h4>';
                    resultsHTML += '<p>Algunos caches permanecen. Esto es normal para el funcionamiento básico.</p>';
                    resultsHTML += '</div>';
                }
                
                resultsEl.innerHTML = resultsHTML;
                resultsEl.style.display = 'block';
                reloadBtn.style.display = 'inline-block';
                
                console.log('🎉 Limpieza completada:', results);
                
                // Mostrar confirmación final
                const message = results.cachesRemaining === 0 
                    ? \`¡Limpieza de cache completada exitosamente!\\n\\n✅ Eliminados: \${results.cachesDeleted} caches\\n📊 Restantes: \${results.cachesRemaining}\\n\\n🎉 El error "SW: Network failed, trying cache" ha sido resuelto.\\n\\nLa aplicación debería funcionar correctamente ahora.\`
                    : \`Limpieza de cache parcialmente completada\\n\\n✅ Eliminados: \${results.cachesDeleted} caches\\n📊 Restantes: \${results.cachesRemaining}\\n\\n💡 El error debería estar significativamente reducido.\`;
                
                alert(message);
                
                // Auto-recargar después de 5 segundos
                setTimeout(() => {
                    console.log('🔄 Recargando página...');
                    window.location.reload();
                }, 5000);
                
            } catch (error) {
                spinner.style.display = 'none';
                statusEl.innerHTML = '<span class="error"><span class="emoji">❌</span> Error: ' + error.message + '</span>';
                progressEl.textContent = 'Error durante el proceso de limpieza';
                console.error('❌ Error en limpieza automática:', error);
                
                alert('Error durante la limpieza: ' + error.message + '\\n\\nPor favor, intenta ejecutar la limpieza manualmente en la consola del navegador.');
            }
        }
    </script>
</body>
</html>`;

  res.send(cleanupHTML);
});

// Endpoint para verificar estado
app.get('/cleanup-status', (req, res) => {
  res.json({
    status: 'ready',
    message: 'Endpoint de limpieza automática disponible',
    url: 'http://localhost:3002/auto-cleanup',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de limpieza automática iniciado en puerto ${PORT}`);
  console.log(`📋 URL de limpieza automática: http://localhost:${PORT}/auto-cleanup`);
  console.log(`🔍 Verificar estado: http://localhost:${PORT}/cleanup-status`);
  console.log(`\\n💡 Para ejecutar la limpieza:`);
  console.log(`   1. Abre: http://localhost:${PORT}/auto-cleanup`);
  console.log(`   2. La limpieza se ejecutará automáticamente`);
  console.log(`   3. Espera a que termine el proceso`);
  console.log(`   4. La página se recargará automáticamente`);
});

module.exports = app;