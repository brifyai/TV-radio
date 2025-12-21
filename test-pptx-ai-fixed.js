// Script de prueba con algoritmo CORREGIDO para IA adaptativa PPTX
// Ejecutar con: node test-pptx-ai-fixed.js

// Simular el servicio de IA adaptativa CORREGIDO
class SimpleAdaptiveTestFixed {
  constructor() {
    this.slideDimensions = {
      width: 10,
      height: 7.5,
      margin: 0.5,
      maxContentHeight: 6.5,
      maxContentWidth: 9  // NUEVO: Ancho disponible
    };

    // NUEVO: Caracteres por línea según tamaño de fuente
    this.charsPerLine = {
      24: 35, // Título: ~35 caracteres por línea
      16: 50, // Subtítulo: ~50 caracteres por línea
      12: 65, // Body: ~65 caracteres por línea
      10: 75  // Small: ~75 caracteres por línea
    };
  }

  getFontSizeForItem(item) {
    if (item.importance === 'high') return 24;
    if (item.importance === 'medium') return 16;
    return 12;
  }

  analyzeTextDensity(contentItems) {
    let totalCharacters = 0;
    let totalLines = 0;
    let hasComplexElements = false;

    contentItems.forEach(item => {
      if (item.text) {
        // NUEVO: Calcular líneas reales para densidad
        const fontSize = this.getFontSizeForItem(item);
        const charsPerLine = this.charsPerLine[fontSize] || 65;
        const lines = Math.ceil(item.text.length / charsPerLine);
        
        totalLines += lines;
        totalCharacters += item.text.length;
      }
      
      if (item.type === 'table' || (item.items && item.items.length > 5)) {
        hasComplexElements = true;
      }
    });

    const density = Math.min(100, (totalCharacters / 500) * 100 + (hasComplexElements ? 30 : 0));

    return {
      totalCharacters,
      totalLines,
      hasComplexElements,
      density: Math.round(density),
      complexity: density > 70 ? 'high' : density > 40 ? 'medium' : 'low'
    };
  }

  // ALGORITMO CORREGIDO: Calcula espacio considerando word wrapping
  calculateContentSpace(contentItems, contentAnalysis) {
    let requiredSpace = 0;
    const availableSpace = this.slideDimensions.maxContentHeight;

    contentItems.forEach(item => {
      let itemSpace = 0;

      if (item.text) {
        // NUEVO: Calcular líneas reales basado en ancho y caracteres por línea
        const fontSize = this.getFontSizeForItem(item);
        const charsPerLine = this.charsPerLine[fontSize] || 65;
        const lines = Math.ceil(item.text.length / charsPerLine);
        const lineHeight = 0.4; // Altura de línea estándar
        
        itemSpace += lines * lineHeight;
        
        // Debug info para el problema del texto largo
        console.log(`  Texto: "${item.text.substring(0, 50)}..." (${item.text.length} chars)`);
        console.log(`  FontSize: ${fontSize}, CharsPerLine: ${charsPerLine}, Lines: ${lines}, Height: ${itemSpace.toFixed(2)}"`);
      }

      if (item.type === 'table') {
        const rows = item.data ? item.data.length : 3;
        itemSpace += rows * 0.4;
      }

      itemSpace += 0.2; // Espaciado entre elementos
      requiredSpace += itemSpace;
    });

    return {
      requiredSpace: Math.max(requiredSpace, 1),
      availableSpace,
      utilizationPercentage: (requiredSpace / availableSpace) * 100
    };
  }

  makeAdaptiveDecisions(contentItems, slideContext) {
    const decisions = {
      shouldSplit: false,
      optimalLayout: 'single',
      fontScale: 1.0,
      spacingAdjustment: 1.0,
      contentDistribution: [],
      reasoning: []
    };

    const contentAnalysis = this.analyzeTextDensity(contentItems);
    decisions.reasoning.push(`Densidad de contenido: ${contentAnalysis.density}%`);

    const spaceAnalysis = this.calculateContentSpace(contentItems, contentAnalysis);
    decisions.reasoning.push(`Espacio requerido: ${spaceAnalysis.requiredSpace.toFixed(2)}" vs disponible: ${spaceAnalysis.availableSpace.toFixed(2)}"`);

    if (spaceAnalysis.requiredSpace > spaceAnalysis.availableSpace * 0.9) {
      decisions.shouldSplit = true;
      decisions.reasoning.push('Contenido excede 90% del espacio disponible - se recomienda división');
    }

    // Determinar layout óptimo
    const itemCount = contentItems.length;
    if (itemCount >= 4 && contentAnalysis.complexity === 'low') {
      decisions.optimalLayout = 'grid-2x2';
    } else if (itemCount >= 2 && itemCount <= 4) {
      decisions.optimalLayout = 'vertical-list';
    } else if (contentAnalysis.hasComplexElements) {
      decisions.optimalLayout = 'card-layout';
    } else {
      decisions.optimalLayout = 'single-column';
    }
    decisions.reasoning.push(`Layout óptimo seleccionado: ${decisions.optimalLayout}`);

    // Calcular escalado de fuente si es necesario
    if (spaceAnalysis.requiredSpace > spaceAnalysis.availableSpace) {
      const overage = spaceAnalysis.requiredSpace / spaceAnalysis.availableSpace;
      if (overage <= 1.1) {
        decisions.fontScale = 0.95;
      } else if (overage <= 1.3) {
        decisions.fontScale = 0.85;
      } else if (overage <= 1.6) {
        decisions.fontScale = 0.75;
      } else {
        decisions.fontScale = 0.65;
      }
      decisions.reasoning.push(`Escalado de fuente aplicado: ${(decisions.fontScale * 100).toFixed(1)}%`);
    }

    // Distribuir contenido
    if (!decisions.shouldSplit) {
      decisions.contentDistribution.push({
        slideIndex: 0,
        items: contentItems,
        layout: decisions.optimalLayout,
        fontScale: decisions.fontScale
      });
    } else {
      const itemsPerSlide = Math.max(1, Math.ceil(contentItems.length / 3));
      let currentIndex = 0;
      
      while (currentIndex < contentItems.length) {
        const slideItems = contentItems.slice(currentIndex, currentIndex + itemsPerSlide);
        decisions.contentDistribution.push({
          slideIndex: decisions.contentDistribution.length,
          items: slideItems,
          layout: 'single-column',
          fontScale: 1.0
        });
        currentIndex += itemsPerSlide;
      }
    }

    return decisions;
  }

  runTests() {
    console.log('🧪 PRUEBAS CON ALGORITMO CORREGIDO');
    console.log('===================================\n');

    const results = [];

    // Prueba 1: Contenido simple
    console.log('📋 Prueba 1: Contenido Simple');
    const simpleContent = [
      { text: 'Título Principal', importance: 'high', type: 'title' },
      { text: 'Subtítulo descriptivo', importance: 'medium', type: 'subtitle' },
      { text: 'Punto clave 1', importance: 'low', type: 'bullet' },
      { text: 'Punto clave 2', importance: 'low', type: 'bullet' }
    ];
    const simpleDecisions = this.makeAdaptiveDecisions(simpleContent, { slideType: 'simple' });
    console.log(`✅ Layout: ${simpleDecisions.optimalLayout}, Dividido: ${simpleDecisions.shouldSplit}`);
    results.push({ test: 'Contenido Simple', passed: !simpleDecisions.shouldSplit });

    // Prueba 2: Contenido complejo
    console.log('\n📊 Prueba 2: Contenido Complejo');
    const complexContent = [];
    for (let i = 1; i <= 10; i++) {
      complexContent.push({
        text: `Análisis detallado número ${i} con información extensa sobre métricas, insights de IA, recomendaciones estratégicas y análisis temporal`,
        importance: i <= 3 ? 'high' : 'medium',
        type: 'analysis'
      });
    }
    const complexDecisions = this.makeAdaptiveDecisions(complexContent, { slideType: 'complex' });
    console.log(`✅ Dividido en ${complexDecisions.contentDistribution.length} láminas, Layout: ${complexDecisions.optimalLayout}`);
    results.push({ test: 'Contenido Complejo', passed: complexDecisions.shouldSplit });

    // Prueba 3: Grid layout
    console.log('\n🔲 Prueba 3: Grid Layout');
    const gridContent = [
      { text: 'Dashboard de Componentes', importance: 'high', type: 'title' },
      { text: 'Componente 1: Métricas', importance: 'medium', type: 'component' },
      { text: 'Componente 2: Gráficos', importance: 'medium', type: 'component' },
      { text: 'Componente 3: IA Insights', importance: 'medium', type: 'component' },
      { text: 'Componente 4: Predicciones', importance: 'medium', type: 'component' }
    ];
    const gridDecisions = this.makeAdaptiveDecisions(gridContent, { slideType: 'grid' });
    console.log(`✅ Layout: ${gridDecisions.optimalLayout}, Escalado: ${(gridDecisions.fontScale * 100).toFixed(1)}%`);
    results.push({ test: 'Grid Layout', passed: gridDecisions.optimalLayout === 'grid-2x2' });

    // Prueba 4: Texto largo - AHORA CON ALGORITMO CORREGIDO
    console.log('\n📖 Prueba 4: Texto Largo (ALGORITMO CORREGIDO)');
    const longText = 'A'.repeat(800); // 800 caracteres
    const longContent = [
      { text: 'Análisis Exhaustivo', importance: 'high', type: 'title' },
      { text: longText, importance: 'medium', type: 'description' }
    ];
    
    console.log('🔍 ANÁLISIS DETALLADO DEL TEXTO LARGO:');
    const longDecisions = this.makeAdaptiveDecisions(longContent, { slideType: 'long-text' });
    console.log(`✅ Escalado aplicado: ${(longDecisions.fontScale * 100).toFixed(1)}%, Dividido: ${longDecisions.shouldSplit}`);
    
    // Verificar si el problema se resolvió
    const testPassed = longDecisions.fontScale < 1.0 || longDecisions.shouldSplit;
    results.push({ test: 'Texto Largo (Corregido)', passed: testPassed });

    // Prueba 5: Texto extremo
    console.log('\n📚 Prueba 5: Texto Extremo (2000 caracteres)');
    const extremeText = 'B'.repeat(2000);
    const extremeContent = [
      { text: 'Análisis Extremo', importance: 'high', type: 'title' },
      { text: extremeText, importance: 'medium', type: 'description' }
    ];
    
    console.log('🔍 ANÁLISIS DETALLADO DEL TEXTO EXTREMO:');
    const extremeDecisions = this.makeAdaptiveDecisions(extremeContent, { slideType: 'extreme' });
    console.log(`✅ Escalado aplicado: ${(extremeDecisions.fontScale * 100).toFixed(1)}%, Dividido: ${extremeDecisions.shouldSplit}`);
    
    const extremeTestPassed = extremeDecisions.fontScale < 1.0 || extremeDecisions.shouldSplit;
    results.push({ test: 'Texto Extremo', passed: extremeTestPassed });

    // Resumen
    console.log('\n📊 RESUMEN DE PRUEBAS CON ALGORITMO CORREGIDO');
    console.log('==============================================');
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`Total de pruebas: ${totalTests}`);
    console.log(`Pruebas exitosas: ${passedTests}`);
    console.log(`Tasa de éxito: ${successRate}%`);

    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
    });

    if (passedTests === totalTests) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El algoritmo corregido funciona perfectamente.');
    } else {
      console.log('\n⚠️ Algunas pruebas aún fallan. Se requiere más optimización.');
    }

    return results;
  }
}

// Ejecutar pruebas con algoritmo corregido
const tester = new SimpleAdaptiveTestFixed();
tester.runTests();