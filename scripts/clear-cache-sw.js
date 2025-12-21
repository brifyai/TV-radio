#!/usr/bin/env node

/**
 * Script para limpiar el cache del Service Worker
 * Ejecutar con: node scripts/clear-cache-sw.js
 * O copiar el código JavaScript y ejecutarlo en la consola del navegador
 */

console.log('🧹 Iniciando limpieza del cache del Service Worker...\n');

// Función para limpiar cache desde Node.js (para testing)
const clearCacheFromNode = async () => {
  console.log('📋 Este script debe ejecutarse en el navegador.');
  console.log('💡 Copia el siguiente código JavaScript y pégalo en la consola del navegador (F12):\n');
  
  const jsCode = `
// ===== CÓDIGO PARA EJECUTAR EN LA CONSOLA DEL NAVEGADOR =====

(async () => {
  try {
    console.log('🧹 Limpiando cache del Service Worker...');
    
    // 1. Obtener todos los caches
    const cacheNames = await caches.keys();
    console.log('📋 Caches encontrados:', cacheNames);
    
    // 2. Eliminar caches dinámicos (los más problemáticos)
    const dynamicCaches = cacheNames.filter(name => name.includes('dynamic'));
    for (const cacheName of dynamicCaches) {
      await caches.delete(cacheName);
      console.log('🗑️ Eliminado cache dinámico:', cacheName);
    }
    
    // 3. Eliminar caches estáticos antiguos si existen
    const staticCaches = cacheNames.filter(name => name.includes('static'));
    for (const cacheName of staticCaches) {
      await caches.delete(cacheName);
      console.log('🗑️ Eliminado cache estático:', cacheName);
    }
    
    // 4. Actualizar Service Worker
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('🔄 Service Worker actualizado');
    }
    
    // 5. Verificar limpieza
    const remainingCaches = await caches.keys();
    console.log('✅ Cache limpiado. Caches restantes:', remainingCaches);
    
    // 6. Recargar página en 2 segundos
    setTimeout(() => {
      console.log('🔄 Recargando página...');
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error al limpiar cache:', error);
  }
})();

// ===== FIN DEL CÓDIGO =====
`;
  
  console.log(jsCode);
  console.log('\n📝 Instrucciones:');
  console.log('1. Abre tu aplicación en el navegador');
  console.log('2. Presiona F12 para abrir DevTools');
  console.log('3. Ve a la pestaña "Console"');
  console.log('4. Copia y pega el código de arriba');
  console.log('5. Presiona Enter para ejecutar');
};

// Función para crear bookmarklet
const createBookmarklet = () => {
  const bookmarkletCode = `
javascript:(async()=>{try{console.log('🧹 Limpiando cache SW...');const cacheNames=await caches.keys();const dynamicCaches=cacheNames.filter(n=>n.includes('dynamic'));for(const name of dynamicCaches){await caches.delete(name);console.log('🗑️ Eliminado:',name);}const reg=await navigator.serviceWorker.getRegistration();if(reg){await reg.update();console.log('🔄 SW actualizado');}alert('Cache limpiado! Recarga la página.');}catch(e){console.error('❌ Error:',e);alert('Error: '+e.message);}})();
  `.trim();
  
  console.log('\n🔖 BOOKMARKLET (marcador de favoritos):');
  console.log('Crea un nuevo marcador con esta URL:');
  console.log(bookmarkletCode);
  console.log('\n📝 Instrucciones para bookmarklet:');
  console.log('1. Crea un nuevo marcador en tu navegador');
  console.log('2. Pega el código de arriba en la URL del marcador');
  console.log('3. Guarda el marcador');
  console.log('4. Haz clic en él cuando tengas problemas de cache');
};

// Función principal
const main = async () => {
  console.log('🎯 Script de Limpieza de Cache del Service Worker\n');
  
  await clearCacheFromNode();
  createBookmarklet();
  
  console.log('\n🎉 ¡Listo! Usa cualquiera de los métodos arriba para limpiar el cache.');
  console.log('💡 Recomendación: Usa el código JavaScript en la consola del navegador.');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { clearCacheFromNode, createBookmarklet };