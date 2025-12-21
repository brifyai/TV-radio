
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
              results.errors.push(`Error eliminando ${cacheName}: ${error.message}`);
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
          
          console.log('\n📊 RESULTADOS FINALES:');
          console.log('═'.repeat(40));
          console.log('🗑️ Caches eliminados:', results.cachesDeleted);
          console.log('📊 Caches restantes:', results.cachesRemaining);
          
          if (remainingCaches.length === 0) {
            console.log('🎉 ¡CACHE COMPLETAMENTE LIMPIO!');
          }
          
          // Mostrar confirmación
          alert(`Cache limpiado exitosamente!\n\nEliminados: ${results.cachesDeleted} caches\nRestantes: ${results.cachesRemaining}\n\nRecargando página...`);
          
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
    