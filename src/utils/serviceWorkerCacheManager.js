/**
 * Utilidades para gestionar el cache del Service Worker
 * Incluye funciones para limpiar cache, diagnosticar problemas y optimizar rendimiento
 */

/**
 * Función principal para limpiar todo el cache del Service Worker
 */
export const clearServiceWorkerCache = async () => {
  try {
    console.log('🧹 Iniciando limpieza de cache del Service Worker...');
    
    // Obtener todos los nombres de cache
    const cacheNames = await caches.keys();
    
    if (cacheNames.length === 0) {
      console.log('✅ No hay caches para limpiar');
      return;
    }
    
    console.log('📋 Caches encontrados:', cacheNames);
    
    // Eliminar cada cache
    const deletePromises = cacheNames.map(async (cacheName) => {
      console.log('🗑️ Eliminando cache:', cacheName);
      const deleted = await caches.delete(cacheName);
      return { name: cacheName, deleted };
    });
    
    // Esperar a que se eliminen todos
    const results = await Promise.all(deletePromises);
    
    console.log('✅ Cache del Service Worker limpiado exitosamente');
    console.log('📊 Resultados:', results);
    
    // Forzar actualización del Service Worker
    await forceServiceWorkerUpdate();
    
    return results;
    
  } catch (error) {
    console.error('❌ Error al limpiar cache:', error);
    throw error;
  }
};

/**
 * Limpiar solo caches específicos de iMetrics
 */
export const clearIMetricsCache = async () => {
  try {
    const cacheNames = await caches.keys();
    const imetricsCaches = cacheNames.filter(name => 
      name.includes('imetrics')
    );
    
    if (imetricsCaches.length === 0) {
      console.log('✅ No hay caches de iMetrics para limpiar');
      return;
    }
    
    console.log('🧹 Limpiando caches de iMetrics:', imetricsCaches);
    
    await Promise.all(
      imetricsCaches.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('✅ Caches de iMetrics eliminados:', imetricsCaches);
    return imetricsCaches;
    
  } catch (error) {
    console.error('❌ Error al limpiar caches de iMetrics:', error);
    throw error;
  }
};

/**
 * Forzar actualización del Service Worker
 */
export const forceServiceWorkerUpdate = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        console.log('🔄 Actualizando Service Worker...');
        
        // Enviar mensaje al SW para limpiar cache
        if (registration.active) {
          registration.active.postMessage({
            type: 'CLEAR_CACHE'
          });
        }
        
        // Actualizar el SW
        await registration.update();
        
        console.log('✅ Service Worker actualizado');
        return true;
      } else {
        console.log('⚠️ No hay Service Worker registrado');
        return false;
      }
    } else {
      console.log('⚠️ Service Workers no soportados en este navegador');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al actualizar Service Worker:', error);
    throw error;
  }
};

/**
 * Diagnóstico completo del Service Worker y cache
 */
export const diagnoseServiceWorker = async () => {
  console.log('🔍 Iniciando diagnóstico del Service Worker...');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    serviceWorkerSupported: 'serviceWorker' in navigator,
    registration: null,
    caches: [],
    cacheSizes: {},
    errors: []
  };
  
  try {
    // Verificar soporte de Service Worker
    if (!diagnosis.serviceWorkerSupported) {
      diagnosis.errors.push('Service Workers no soportados');
      return diagnosis;
    }
    
    // Obtener registro del Service Worker
    const registration = await navigator.serviceWorker.getRegistration();
    diagnosis.registration = {
      active: !!registration?.active,
      waiting: !!registration?.waiting,
      installing: !!registration?.installing,
      scope: registration?.scope || null,
      updatefound: !!registration?.updatefound
    };
    
    // Obtener información de caches
    const cacheNames = await caches.keys();
    diagnosis.caches = cacheNames;
    
    // Calcular tamaños aproximados de cache
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        diagnosis.cacheSizes[cacheName] = keys.length;
      } catch (error) {
        diagnosis.errors.push(`Error al acceder al cache ${cacheName}: ${error.message}`);
      }
    }
    
    console.log('📊 Diagnóstico completo:', diagnosis);
    return diagnosis;
    
  } catch (error) {
    diagnosis.errors.push(`Error en diagnóstico: ${error.message}`);
    console.error('❌ Error en diagnóstico:', error);
    return diagnosis;
  }
};

/**
 * Limpieza específica del cache dinámico (más propenso a errores)
 */
export const clearDynamicCache = async () => {
  try {
    const cacheNames = await caches.keys();
    const dynamicCache = cacheNames.find(name => name.includes('dynamic'));
    
    if (dynamicCache) {
      console.log('🧹 Limpiando cache dinámico:', dynamicCache);
      await caches.delete(dynamicCache);
      console.log('✅ Cache dinámico eliminado');
      return dynamicCache;
    } else {
      console.log('ℹ️ No se encontró cache dinámico');
      return null;
    }
  } catch (error) {
    console.error('❌ Error al limpiar cache dinámico:', error);
    throw error;
  }
};

/**
 * Optimización del cache: mantener solo los elementos más recientes
 */
export const optimizeCache = async (maxItemsPerCache = 50) => {
  try {
    console.log('⚡ Optimizando cache...');
    
    const cacheNames = await caches.keys();
    const optimizationResults = [];
    
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        if (keys.length > maxItemsPerCache) {
          const itemsToDelete = keys.slice(0, keys.length - maxItemsToDelete);
          await Promise.all(
            itemsToDelete.map(key => cache.delete(key))
          );
          
          optimizationResults.push({
            cacheName,
            deleted: itemsToDelete.length,
            remaining: maxItemsPerCache
          });
          
          console.log(`🗑️ Cache ${cacheName}: eliminados ${itemsToDelete.length} elementos`);
        }
      } catch (error) {
        console.error(`❌ Error al optimizar cache ${cacheName}:`, error);
      }
    }
    
    console.log('✅ Optimización de cache completada:', optimizationResults);
    return optimizationResults;
    
  } catch (error) {
    console.error('❌ Error al optimizar cache:', error);
    throw error;
  }
};

/**
 * Función para ejecutar limpieza completa y diagnóstico
 */
export const fullCacheMaintenance = async () => {
  console.log('🔧 Iniciando mantenimiento completo del cache...');
  
  try {
    // 1. Diagnóstico inicial
    const initialDiagnosis = await diagnoseServiceWorker();
    
    // 2. Optimización del cache
    await optimizeCache();
    
    // 3. Limpieza específica de cache dinámico
    await clearDynamicCache();
    
    // 4. Diagnóstico final
    const finalDiagnosis = await diagnoseServiceWorker();
    
    // 5. Actualización del Service Worker
    await forceServiceWorkerUpdate();
    
    console.log('🎉 Mantenimiento completo finalizado');
    
    return {
      initial: initialDiagnosis,
      final: finalDiagnosis,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error en mantenimiento completo:', error);
    throw error;
  }
};

/**
 * Función para ejecutar desde la consola del navegador
 */
export const quickCacheFix = async () => {
  console.log('🚀 Ejecutando solución rápida de cache...');
  
  try {
    // Limpiar solo el cache dinámico (más problemático)
    await clearDynamicCache();
    
    // Actualizar Service Worker
    await forceServiceWorkerUpdate();
    
    console.log('✅ Solución rápida aplicada');
    
  } catch (error) {
    console.error('❌ Error en solución rápida:', error);
  }
};

// Exportar funciones principales para uso fácil
export default {
  clearServiceWorkerCache,
  clearIMetricsCache,
  forceServiceWorkerUpdate,
  diagnoseServiceWorker,
  clearDynamicCache,
  optimizeCache,
  fullCacheMaintenance,
  quickCacheFix
};