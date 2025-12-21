#!/usr/bin/env node

/**
 * Script automatizado para limpiar el cache del Service Worker
 * Usa Puppeteer para ejecutar JavaScript directamente en el navegador
 */

const puppeteer = require('puppeteer');

/**
 * Función principal para limpiar cache automáticamente
 */
const autoClearCache = async () => {
  console.log('🚀 Iniciando limpieza automática del cache del Service Worker...\n');
  
  let browser;
  
  try {
    // Lanzar navegador
    console.log('🌐 Abriendo navegador...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Configurar consola del navegador
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'log') {
        console.log('🌐 Browser:', text);
      } else if (type === 'error') {
        console.error('❌ Browser Error:', text);
      } else if (type === 'warn') {
        console.warn('⚠️ Browser Warning:', text);
      }
    });
    
    // Navegar a la aplicación
    console.log('📱 Navegando a la aplicación...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('✅ Aplicación cargada');
    
    // Esperar un poco para que el Service Worker se registre
    await page.waitForTimeout(2000);
    
    // Ejecutar limpieza de cache
    console.log('🧹 Ejecutando limpieza de cache...\n');
    
    const cleanupResult = await page.evaluate(async () => {
      try {
        console.log('🔍 Iniciando limpieza de cache...');
        
        // 1. Obtener todos los caches
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
        
        // 2. Categorizar caches
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
        
        // 3. Eliminar caches dinámicos (los más problemáticos)
        for (const cacheName of results.dynamicCaches) {
          try {
            await caches.delete(cacheName);
            results.deleted.push(cacheName);
            console.log('🗑️ Eliminado cache dinámico:', cacheName);
          } catch (error) {
            results.errors.push(`Error eliminando ${cacheName}: ${error.message}`);
            console.error('❌ Error eliminando cache dinámico:', cacheName, error.message);
          }
        }
        
        // 4. Eliminar caches estáticos antiguos
        for (const cacheName of results.staticCaches) {
          try {
            await caches.delete(cacheName);
            results.deleted.push(cacheName);
            console.log('🗑️ Eliminado cache estático:', cacheName);
          } catch (error) {
            results.errors.push(`Error eliminando ${cacheName}: ${error.message}`);
            console.error('❌ Error eliminando cache estático:', cacheName, error.message);
          }
        }
        
        // 5. Actualizar Service Worker
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
            console.log('🔄 Service Worker actualizado');
          } else {
            console.log('⚠️ No hay Service Worker registrado');
          }
        } catch (error) {
          results.errors.push(`Error actualizando SW: ${error.message}`);
          console.error('❌ Error actualizando Service Worker:', error.message);
        }
        
        // 6. Verificar limpieza
        const remainingCaches = await caches.keys();
        results.remainingCaches = remainingCaches;
        results.cachesDeleted = results.deleted.length;
        results.cachesRemaining = remainingCaches.length;
        
        console.log('✅ Cache limpiado');
        console.log('📊 Caches eliminados:', results.deleted.length);
        console.log('📊 Caches restantes:', remainingCaches.length);
        
        // 7. Recargar página
        console.log('🔄 Recargando página en 3 segundos...');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        
        return results;
        
      } catch (error) {
        console.error('❌ Error general en limpieza:', error);
        return {
          error: error.message,
          stack: error.stack
        };
      }
    });
    
    console.log('\n📊 RESULTADOS DE LA LIMPIEZA:');
    console.log('═'.repeat(50));
    console.log(`📋 Total de caches encontrados: ${cleanupResult.totalCaches}`);
    console.log(`🗑️ Caches eliminados: ${cleanupResult.cachesDeleted || 0}`);
    console.log(`📊 Caches restantes: ${cleanupResult.cachesRemaining || 0}`);
    
    if (cleanupResult.dynamicCaches?.length > 0) {
      console.log(`\n🗑️ Caches dinámicos eliminados:`);
      cleanupResult.dynamicCaches.forEach(cache => console.log(`   - ${cache}`));
    }
    
    if (cleanupResult.staticCaches?.length > 0) {
      console.log(`\n🗑️ Caches estáticos eliminados:`);
      cleanupResult.staticCaches.forEach(cache => console.log(`   - ${cache}`));
    }
    
    if (cleanupResult.errors?.length > 0) {
      console.log(`\n❌ Errores encontrados:`);
      cleanupResult.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (cleanupResult.remainingCaches?.length > 0) {
      console.log(`\n📊 Caches que permanecen:`);
      cleanupResult.remainingCaches.forEach(cache => console.log(`   - ${cache}`));
    }
    
    console.log('\n🎉 ¡Limpieza completada!');
    console.log('💡 La página se recargará automáticamente en unos segundos.');
    
    // Esperar a que se recargue
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error en limpieza automática:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🌐 Navegador cerrado');
    }
  }
};

/**
 * Función para verificar si Puppeteer está disponible
 */
const checkPuppeteer = async () => {
  try {
    require.resolve('puppeteer');
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Función principal
 */
const main = async () => {
  console.log('🎯 Script de Limpieza Automática del Cache del Service Worker\n');
  
  // Verificar Puppeteer
  const hasPuppeteer = await checkPuppeteer();
  
  if (!hasPuppeteer) {
    console.log('❌ Puppeteer no está instalado.');
    console.log('📦 Instalando Puppeteer...');
    
    try {
      const { execSync } = require('child_process');
      execSync('npm install puppeteer', { stdio: 'inherit' });
      console.log('✅ Puppeteer instalado exitosamente');
    } catch (error) {
      console.error('❌ Error instalando Puppeteer:', error.message);
      console.log('\n💡 Alternativa: Usa el código JavaScript manual:');
      console.log('1. Abre http://localhost:3000 en tu navegador');
      console.log('2. Presiona F12 para abrir DevTools');
      console.log('3. Ve a la pestaña "Console"');
      console.log('4. Copia y pega el código de scripts/clear-cache-sw.js');
      return;
    }
  }
  
  // Ejecutar limpieza
  await autoClearCache();
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { autoClearCache, checkPuppeteer };