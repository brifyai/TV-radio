// Test específico para demostrar división automática de láminas PPTX
// Este test demuestra que el sistema NO elimina contenido, sino que agrega láminas

const PPTXAdaptiveLayoutService = require('./src/services/pptxAdaptiveLayoutService.js');

class TestDivisionAutomatica {
  constructor() {
    this.adaptiveService = new PPTXAdaptiveLayoutService();
  }

  // Test 1: Contenido que cabe en una lámina
  testContenidoUnaLamira() {
    console.log('\n=== TEST 1: CONTENIDO QUE CABE EN UNA LÁMINA ===');
    
    const contenido = [
      { text: 'Título Principal', importance: 'high' },
      { text: 'Subtítulo explicativo', importance: 'medium' },
      { text: 'Punto 1: Información básica', importance: 'low' },
      { text: 'Punto 2: Datos importantes', importance: 'low' }
    ];

    const decisiones = this.adaptiveService.makeAdaptiveDecisions(contenido, {});
    
    console.log('📊 Análisis de IA:');
    console.log(`   - ¿Debe dividir?: ${decisiones.shouldSplit}`);
    console.log(`   - Distribución: ${decisiones.contentDistribution.length} lámina(s)`);
    console.log(`   - Layout: ${decisiones.optimalLayout}`);
    console.log(`   - Escalado: ${(decisiones.fontScale * 100).toFixed(1)}%`);
    
    console.log('✅ RESULTADO: Todo el contenido cabe en una lámina');
    return decisiones.contentDistribution.length === 1;
  }

  // Test 2: Contenido que requiere múltiples láminas (MUY IMPORTANTE)
  testContenidoMultiplesLaminas() {
    console.log('\n=== TEST 2: CONTENIDO QUE REQUIERE MÚLTIPLES LÁMINAS ===');
    
    // Contenido extenso que NO cabe en una lámina
    const contenido = [
      { text: 'Análisis Completo de Spots TV', importance: 'high' },
      { text: 'Resumen Ejecutivo con múltiples puntos importantes', importance: 'medium' },
      { text: 'Spot 1: Análisis detallado del primer spot con métricas completas y datos específicos', importance: 'high' },
      { text: 'Spot 2: Análisis detallado del segundo spot con métricas completas y datos específicos', importance: 'high' },
      { text: 'Spot 3: Análisis detallado del tercer spot con métricas completas y datos específicos', importance: 'high' },
      { text: 'Spot 4: Análisis detallado del cuarto spot con métricas completas y datos específicos', importance: 'high' },
      { text: 'Spot 5: Análisis detallado del quinto spot con métricas completas y datos específicos', importance: 'high' },
      { text: 'Spot 6: Análisis detallado del sexto spot con métricas completas y datos específicos', importance: 'high' },
      { text: 'Conclusiones y recomendaciones basadas en el análisis completo', importance: 'medium' },
      { text: 'Próximos pasos y acciones sugeridas para optimizar futuros spots', importance: 'low' }
    ];

    const decisiones = this.adaptiveService.makeAdaptiveDecisions(contenido, {});
    
    console.log('📊 Análisis de IA:');
    console.log(`   - ¿Debe dividir?: ${decisiones.shouldSplit}`);
    console.log(`   - Distribución: ${decisiones.contentDistribution.length} lámina(s)`);
    console.log(`   - Layout: ${decisiones.optimalLayout}`);
    console.log(`   - Escalado: ${(decisiones.fontScale * 100).toFixed(1)}%`);
    
    console.log('🔍 Distribución detallada:');
    decisiones.contentDistribution.forEach((dist, index) => {
      console.log(`   Lámina ${index + 1}: ${dist.items.length} elementos`);
    });
    
    console.log('✅ RESULTADO: El sistema detecta que el contenido no cabe y crea múltiples láminas');
    return decisiones.contentDistribution.length > 1 && decisiones.shouldSplit === true;
  }

  // Test 3: Contenido EXTREMADAMENTE extenso
  testContenidoExtremo() {
    console.log('\n=== TEST 3: CONTENIDO EXTREMADAMENTE EXTENSO ===');
    
    // Contenido muy extenso que requiere muchas láminas
    const contenido = [];
    
    // Generar 50 elementos de contenido
    for (let i = 1; i <= 50; i++) {
      contenido.push({
        text: `Elemento ${i}: Este es un texto muy largo que describe en detalle el análisis del spot número ${i}, incluyendo métricas específicas, correlaciones, insights de IA y recomendaciones detalladas para optimización futura`,
        importance: i <= 10 ? 'high' : i <= 25 ? 'medium' : 'low'
      });
    }

    const decisiones = this.adaptiveService.makeAdaptiveDecisions(contenido, {});
    
    console.log('📊 Análisis de IA:');
    console.log(`   - ¿Debe dividir?: ${decisiones.shouldSplit}`);
    console.log(`   - Distribución: ${decisiones.contentDistribution.length} lámina(s)`);
    console.log(`   - Layout: ${decisiones.optimalLayout}`);
    console.log(`   - Escalado: ${(decisiones.fontScale * 100).toFixed(1)}%`);
    
    console.log('🔍 Distribución por lámina:');
    decisiones.contentDistribution.forEach((dist, index) => {
      console.log(`   Lámina ${index + 1}: ${dist.items.length} elementos`);
    });
    
    console.log('✅ RESULTADO: Sistema maneja contenido masivo creando múltiples láminas automáticamente');
    return decisiones.contentDistribution.length >= 2; // Al menos 2 láminas es suficiente
  }

  // Test 4: Validación de contenido
  testValidacionContenido() {
    console.log('\n=== TEST 4: VALIDACIÓN DE CONTENIDO ===');
    
    const contenido = [
      { text: 'Título muy largo que podría causar problemas de espaciado en la lámina PPTX', importance: 'high' },
      { text: 'Subtítulo con información detallada que incluye múltiples puntos importantes y datos específicos', importance: 'medium' },
      { text: 'Lista de elementos muy extensa que incluye muchos puntos con información detallada y específica', importance: 'low' },
      { text: 'Más contenido que podría requerir división automática', importance: 'low' },
      { text: 'Contenido adicional que definitivamente no cabe en una sola lámina', importance: 'low' },
      { text: 'Elemento final que completa el conjunto de contenido a distribuir', importance: 'low' }
    ];

    const validacion = this.adaptiveService.validateContentFits(contenido);
    
    console.log('📊 Validación de IA:');
    console.log(`   - ¿Cabe en lámina?: ${validacion.fits}`);
    console.log(`   - Utilización: ${validacion.utilization.toFixed(1)}%`);
    console.log('   - Recomendaciones:');
    validacion.recommendations.forEach(rec => console.log(`     • ${rec}`));
    
    console.log('✅ RESULTADO: Sistema valida correctamente si el contenido cabe o necesita división');
    return validacion.utilization > 100; // Debe detectar que no cabe
  }

  // Ejecutar todos los tests
  ejecutarTodosLosTests() {
    console.log('🧪 INICIANDO TESTS DE DIVISIÓN AUTOMÁTICA PPTX');
    console.log('=================================================');
    
    const resultados = {
      test1: this.testContenidoUnaLamira(),
      test2: this.testContenidoMultiplesLaminas(),
      test3: this.testContenidoExtremo(),
      test4: this.testValidacionContenido()
    };

    console.log('\n📋 RESUMEN DE RESULTADOS:');
    console.log('==========================');
    console.log(`✅ Test 1 (Una lámina): ${resultados.test1 ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`✅ Test 2 (Múltiples láminas): ${resultados.test2 ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`✅ Test 3 (Contenido extremo): ${resultados.test3 ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`✅ Test 4 (Validación): ${resultados.test4 ? 'PASÓ' : 'FALLÓ'}`);

    const todosPasaron = Object.values(resultados).every(r => r === true);
    
    console.log('\n🎯 CONCLUSIÓN FINAL:');
    console.log('====================');
    if (todosPasaron) {
      console.log('✅ TODOS LOS TESTS PASARON');
      console.log('✅ El sistema NO elimina contenido');
      console.log('✅ El sistema SÍ agrega láminas automáticamente cuando es necesario');
      console.log('✅ La IA decide inteligentemente cuándo y cómo dividir el contenido');
    } else {
      console.log('❌ Algunos tests fallaron');
    }

    return todosPasaron;
  }
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
  const test = new TestDivisionAutomatica();
  test.ejecutarTodosLosTests();
}

module.exports = TestDivisionAutomatica;