#!/usr/bin/env node

/**
 * Script para ejecutar limpieza de cache del Service Worker
 * Versión simplificada que genera código JavaScript para ejecutar en el navegador
 */

const fs = require('fs');
const path = require('path');

/**
 * Generar código JavaScript para limpieza de cache
 */
const generateCleanupCode = () => {
  return `
// ===== CÓDIGO PARA LIMPIAR CACHE DEL SERVICE WORKER =====
// Ejecutar este código en la consola del navegador (F12)

(async () => {
  try {
    console.log('🧹 Iniciando limpieza del cache del Service Worker...');
    
    // 1. Verificar soporte de Service Worker
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Workers no soportados en este navegador');
      return;
    }
    
    // 2. Obtener todos los caches
    const cacheNames = await caches.keys();
    console.log('📋 Caches encontrados:', cacheNames);
    
    const results = {
      totalCaches: cacheNames.length,
      dynamicCaches: [],
      staticCaches: [],
      otherCaches: [],
      deleted: [],
      errors: []
    };
    
    // 3. Categorizar caches
    cacheNames.forEach(name => {
      if (name.includes('dynamic')) {
        results.dynamicCaches.push(name);
      } else if (name.includes('static')) {
        results.staticCaches.push(name);
      } else {
        results.otherCaches.push(name);
      }
    });
    
    console.log('📊 Caches dinámicos:', results.dynamicCaches);
    console.log('📊 Caches estáticos:', results.staticCaches);
    console.log('📊 Otros caches:', results.otherCaches);
    
    // 4. Eliminar caches dinámicos (los más problemáticos)
    console.log('🗑️ Eliminando caches dinámicos...');
    for (const cacheName of results.dynamicCaches) {
      try {
        await caches.delete(cacheName);
        results.deleted.push(cacheName);
        console.log('✅ Eliminado cache dinámico:', cacheName);
      } catch (error) {
        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
        console.error('❌ Error eliminando cache dinámico:', cacheName, error.message);
      }
    }
    
    // 5. Eliminar caches estáticos antiguos
    console.log('🗑️ Eliminando caches estáticos...');
    for (const cacheName of results.staticCaches) {
      try {
        await caches.delete(cacheName);
        results.deleted.push(cacheName);
        console.log('✅ Eliminado cache estático:', cacheName);
      } catch (error) {
        results.errors.push(\`Error eliminando \${cacheName}: \${error.message}\`);
        console.error('❌ Error eliminando cache estático:', cacheName, error.message);
      }
    }
    
    // 6. Actualizar Service Worker
    console.log('🔄 Actualizando Service Worker...');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('✅ Service Worker actualizado');
      } else {
        console.log('⚠️ No hay Service Worker registrado');
      }
    } catch (error) {
      results.errors.push(\`Error actualizando SW: \${error.message}\`);
      console.error('❌ Error actualizando Service Worker:', error.message);
    }
    
    // 7. Verificar limpieza
    const remainingCaches = await caches.keys();
    results.remainingCaches = remainingCaches;
    results.cachesDeleted = results.deleted.length;
    results.cachesRemaining = remainingCaches.length;
    
    console.log('\\n📊 RESULTADOS DE LA LIMPIEZA:');
    console.log('═'.repeat(50));
    console.log(\`📋 Total de caches encontrados: \${results.totalCaches}\`);
    console.log(\`🗑️ Caches eliminados: \${results.cachesDeleted}\`);
    console.log(\`📊 Caches restantes: \${results.cachesRemaining}\`);
    
    if (results.dynamicCaches.length > 0) {
      console.log('\\n🗑️ Caches dinámicos eliminados:');
      results.dynamicCaches.forEach(cache => console.log(\`   - \${cache}\`));
    }
    
    if (results.staticCaches.length > 0) {
      console.log('\\n🗑️ Caches estáticos eliminados:');
      results.staticCaches.forEach(cache => console.log(\`   - \${cache}\`));
    }
    
    if (results.errors.length > 0) {
      console.log('\\n❌ Errores encontrados:');
      results.errors.forEach(error => console.log(\`   - \${error}\`));
    }
    
    if (remainingCaches.length > 0) {
      console.log('\\n📊 Caches que permanecen:');
      remainingCaches.forEach(cache => console.log(\`   - \${cache}\`));
    }
    
    console.log('\\n🎉 ¡Limpieza completada exitosamente!');
    console.log('💡 El error "SW: Network failed, trying cache" debería estar resuelto.');
    
    // 8. Mostrar confirmación
    alert(\`Cache limpiado exitosamente!\\n\\nEliminados: \${results.cachesDeleted} caches\\nRestantes: \${results.cachesRemaining} caches\\n\\nRecarga la página para aplicar los cambios.\`);
    
    // 9. Recargar página en 3 segundos
    console.log('🔄 Recargando página en 3 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error general en limpieza:', error);
    alert(\`Error durante la limpieza: \${error.message}\`);
    return {
      error: error.message,
      stack: error.stack
    };
  }
})();

// ===== FIN DEL CÓDIGO =====
`;
};

/**
 * Crear archivo HTML con el código de limpieza
 */
const createCleanupHTML = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Limpieza de Cache del Service Worker</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2563eb;
            text-align: center;
            margin-bottom: 30px;
        }
        .instructions {
            background: #e0f2fe;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #2563eb;
        }
        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
            margin: 20px 0;
            white-space: pre-wrap;
        }
        .button {
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
            display: inline-block;
        }
        .button:hover {
            background: #1d4ed8;
        }
        .button.secondary {
            background: #64748b;
        }
        .button.secondary:hover {
            background: #475569;
        }
        .status {
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
            display: none;
        }
        .status.success {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        .status.error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        .step {
            margin: 15px 0;
            padding: 15px;
            background: #f8fafc;
            border-radius: 6px;
            border-left: 3px solid #64748b;
        }
        .step-number {
            background: #2563eb;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Limpieza de Cache del Service Worker</h1>
        
        <div class="instructions">
            <h3>📋 Instrucciones:</h3>
            <p>Este script limpiará el cache del Service Worker para resolver el error "SW: Network failed, trying cache".</p>
        </div>

        <div class="step">
            <span class="step-number">1</span>
            <strong>Abre tu aplicación</strong> en el navegador (http://localhost:3000)
        </div>

        <div class="step">
            <span class="step-number">2</span>
            <strong>Abre DevTools</strong> presionando F12 o Ctrl+Shift+I
        </div>

        <div class="step">
            <span class="step-number">3</span>
            <strong>Ve a la pestaña "Console"</strong>
        </div>

        <div class="step">
            <span class="step-number">4</span>
            <strong>Copia y pega el código de abajo</strong> en la consola
        </div>

        <div class="step">
            <span class="step-number">5</span>
            <strong>Presiona Enter</strong> para ejecutar
        </div>

        <h3>💻 Código JavaScript para ejecutar:</h3>
        <div class="code-block" id="cleanupCode">${generateCleanupCode().replace(/\n/g, '\\n')}</div>

        <div style="text-align: center; margin: 30px 0;">
            <button class="button" onclick="copyCode()">📋 Copiar Código</button>
            <button class="button secondary" onclick="openApp()">🚀 Abrir Aplicación</button>
        </div>

        <div id="status" class="status"></div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <h4>⚠️ Nota importante:</h4>
            <p>Después de ejecutar el código, la página se recargará automáticamente. El error del Service Worker debería estar resuelto.</p>
        </div>
    </div>

    <script>
        function copyCode() {
            const code = document.getElementById('cleanupCode').textContent;
            navigator.clipboard.writeText(code).then(() => {
                showStatus('✅ Código copiado al portapapeles', 'success');
            }).catch(() => {
                showStatus('❌ Error al copiar código', 'error');
            });
        }

        function openApp() {
            window.open('http://localhost:3000', '_blank');
        }

        function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status ' + type;
            status.style.display = 'block';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }

        // Mostrar código formateado
        window.onload = function() {
            const codeElement = document.getElementById('cleanupCode');
            const rawCode = codeElement.textContent;
            codeElement.textContent = rawCode.replace(/\\\\n/g, '\\n');
        };
    </script>
</body>
</html>`;

  const filePath = path.join(__dirname, 'cache-cleanup.html');
  fs.writeFileSync(filePath, htmlContent);
  return filePath;
};

/**
 * Función principal
 */
const main = async () => {
  console.log('🎯 Generando herramientas de limpieza de cache del Service Worker...\n');
  
  // Crear archivo HTML
  const htmlPath = createCleanupHTML();
  console.log('✅ Archivo HTML creado:', htmlPath);
  
  // Mostrar código JavaScript
  const jsCode = generateCleanupCode();
  console.log('\n💻 CÓDIGO JAVASCRIPT PARA EJECUTAR EN EL NAVEGADOR:');
  console.log('═'.repeat(60));
  console.log(jsCode);
  
  console.log('\n📋 INSTRUCCIONES:');
  console.log('1. Abre el archivo:', htmlPath);
  console.log('2. O copia el código JavaScript de arriba');
  console.log('3. Ve a tu aplicación en http://localhost:3000');
  console.log('4. Abre DevTools (F12) y ve a Console');
  console.log('5. Pega el código y presiona Enter');
  
  console.log('\n🎉 ¡Listo! El cache se limpiará automáticamente.');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateCleanupCode, createCleanupHTML };