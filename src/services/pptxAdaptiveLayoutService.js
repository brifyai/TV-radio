// Servicio de IA Adaptativa para Layout PPTX
// Sistema inteligente que adapta automáticamente el contenido a las láminas

class PPTXAdaptiveLayoutService {
  constructor() {
    // Configuración de dimensiones de lámina PPTX estándar
    this.slideDimensions = {
      width: 10,    // 10 pulgadas de ancho
      height: 7.5,  // 7.5 pulgadas de alto
      margin: 0.5,  // Margen de 0.5 pulgadas
      maxContentHeight: 6.5 // Altura máxima para contenido (7.5 - 0.5 margen superior - 0.5 margen inferior)
    };

    // Configuración de fuentes y espaciado
    this.fontConfig = {
      title: { size: 24, lineHeight: 0.8 },
      subtitle: { size: 16, lineHeight: 0.6 },
      body: { size: 12, lineHeight: 0.4 },
      small: { size: 10, lineHeight: 0.3 }
    };

    // Límites de contenido por tipo
    this.contentLimits = {
      maxLinesPerSlide: 25,
      minFontSize: 8,
      maxFontSize: 36,
      optimalLineSpacing: 0.3,
      // NUEVO: Caracteres aproximados por línea según tamaño de fuente
      charsPerLine: {
        24: 35, // Título: ~35 caracteres por línea
        16: 50, // Subtítulo: ~50 caracteres por línea
        12: 65, // Body: ~65 caracteres por línea
        10: 75  // Small: ~75 caracteres por línea
      }
    };

    // Algoritmos de decisión de IA
    this.decisionAlgorithms = {
      calculateContentSpace: this.calculateContentSpace.bind(this),
      analyzeTextDensity: this.analyzeTextDensity.bind(this),
      determineOptimalLayout: this.determineOptimalLayout.bind(this),
      calculateFontScaling: this.calculateFontScaling.bind(this)
    };
  }

  /**
   * Función principal de IA que decide cómo adaptar el contenido
   * @param {Array} contentItems - Array de elementos de contenido
   * @param {Object} slideContext - Contexto de la lámina actual
   * @returns {Object} Decisiones de adaptación
   */
  makeAdaptiveDecisions(contentItems, slideContext) {
    const decisions = {
      shouldSplit: false,
      optimalLayout: 'single',
      fontScale: 1.0,
      spacingAdjustment: 1.0,
      contentDistribution: [],
      reasoning: []
    };

    // 1. Analizar densidad del contenido
    const contentAnalysis = this.analyzeTextDensity(contentItems);
    decisions.reasoning.push(`Densidad de contenido: ${contentAnalysis.density}%`);

    // 2. Calcular espacio requerido vs disponible
    const spaceAnalysis = this.calculateContentSpace(contentItems, contentAnalysis);
    decisions.reasoning.push(`Espacio requerido: ${spaceAnalysis.requiredSpace.toFixed(2)}" vs disponible: ${spaceAnalysis.availableSpace.toFixed(2)}"`);

    // 3. Decidir si se debe dividir el contenido
    if (spaceAnalysis.requiredSpace > spaceAnalysis.availableSpace * 0.9) {
      decisions.shouldSplit = true;
      decisions.reasoning.push('Contenido excede 90% del espacio disponible - se recomienda división');
    }

    // 4. Determinar layout óptimo
    decisions.optimalLayout = this.determineOptimalLayout(contentItems, contentAnalysis, spaceAnalysis);
    decisions.reasoning.push(`Layout óptimo seleccionado: ${decisions.optimalLayout}`);

    // 5. Calcular escalado de fuente si es necesario
    if (spaceAnalysis.requiredSpace > spaceAnalysis.availableSpace) {
      decisions.fontScale = this.calculateFontScaling(spaceAnalysis);
      decisions.reasoning.push(`Escalado de fuente aplicado: ${(decisions.fontScale * 100).toFixed(1)}%`);
    }

    // 6. Calcular distribución de contenido
    decisions.contentDistribution = this.distributeContentIntelligently(contentItems, decisions);

    return decisions;
  }

  /**
   * Analiza la densidad del contenido para determinar complejidad
   */
  analyzeTextDensity(contentItems) {
    let totalCharacters = 0;
    let totalLines = 0;
    let hasComplexElements = false;

    contentItems.forEach(item => {
      if (item.text) {
        // CORREGIDO: Calcular líneas reales para densidad
        const fontSize = this.getFontSizeForItem(item);
        const charsPerLine = this.contentLimits.charsPerLine[fontSize] || 65;
        const lines = Math.ceil(item.text.length / charsPerLine);
        
        totalLines += lines;
        totalCharacters += item.text.length;
      }
      
      // Detectar elementos complejos (tablas, listas largas, etc.)
      if (item.type === 'table' || (item.items && item.items.length > 5)) {
        hasComplexElements = true;
      }
    });

    // Calcular densidad como porcentaje de contenido complejo
    const density = Math.min(100, (totalCharacters / 500) * 100 + (hasComplexElements ? 30 : 0));

    return {
      totalCharacters,
      totalLines,
      hasComplexElements,
      density: Math.round(density),
      complexity: density > 70 ? 'high' : density > 40 ? 'medium' : 'low'
    };
  }

  /**
   * Calcula el espacio requerido vs disponible para el contenido
   */
  calculateContentSpace(contentItems, contentAnalysis) {
    let requiredSpace = 0;
    const availableSpace = this.slideDimensions.maxContentHeight;

    contentItems.forEach(item => {
      let itemSpace = 0;

      if (item.text) {
        // CORREGIDO: Calcular líneas reales basado en ancho y caracteres por línea
        const fontSize = this.getFontSizeForItem(item);
        const charsPerLine = this.contentLimits.charsPerLine[fontSize] || 65;
        const lines = Math.ceil(item.text.length / charsPerLine);
        const lineHeight = this.fontConfig.body.lineHeight * (fontSize / 12);
        itemSpace += lines * lineHeight;
      }

      if (item.type === 'table') {
        const rows = item.data ? item.data.length : 3;
        itemSpace += rows * 0.4; // 0.4 pulgadas por fila
      }

      if (item.items && Array.isArray(item.items)) {
        itemSpace += item.items.length * this.fontConfig.body.lineHeight;
      }

      // Agregar espaciado entre elementos
      itemSpace += 0.2;
      requiredSpace += itemSpace;
    });

    return {
      requiredSpace: Math.max(requiredSpace, 1), // Mínimo 1 pulgada
      availableSpace,
      utilizationPercentage: (requiredSpace / availableSpace) * 100
    };
  }

  /**
   * Determina el layout óptimo basado en el análisis de contenido
   */
  determineOptimalLayout(contentItems, contentAnalysis, spaceAnalysis) {
    const itemCount = contentItems.length;
    
    // Si hay muchos elementos pequeños, usar grid
    if (itemCount >= 4 && contentAnalysis.complexity === 'low') {
      return 'grid-2x2';
    }
    
    // Si hay elementos medianos, usar layout vertical
    if (itemCount >= 2 && itemCount <= 4) {
      return 'vertical-list';
    }
    
    // Si hay contenido complejo, usar layout de tarjetas
    if (contentAnalysis.hasComplexElements) {
      return 'card-layout';
    }
    
    // Default: layout simple
    return 'single-column';
  }

  /**
   * Calcula el factor de escalado de fuente necesario
   */
  calculateFontScaling(spaceAnalysis) {
    const overage = spaceAnalysis.requiredSpace / spaceAnalysis.availableSpace;
    
    if (overage <= 1.1) {
      return 0.95; // Reducción mínima
    } else if (overage <= 1.3) {
      return 0.85; // Reducción moderada
    } else if (overage <= 1.6) {
      return 0.75; // Reducción significativa
    } else {
      return 0.65; // Reducción máxima
    }
  }

  /**
   * Distribuye el contenido inteligentemente entre láminas
   */
  distributeContentIntelligently(contentItems, decisions) {
    const distribution = [];
    
    if (!decisions.shouldSplit) {
      // Todo el contenido cabe en una lámina
      distribution.push({
        slideIndex: 0,
        items: contentItems,
        layout: decisions.optimalLayout,
        fontScale: decisions.fontScale
      });
    } else {
      // Dividir contenido en múltiples láminas
      const itemsPerSlide = this.calculateOptimalItemsPerSlide(contentItems, decisions);
      let currentIndex = 0;
      
      while (currentIndex < contentItems.length) {
        const slideItems = contentItems.slice(currentIndex, currentIndex + itemsPerSlide);
        distribution.push({
          slideIndex: distribution.length,
          items: slideItems,
          layout: this.determineLayoutForSlide(slideItems),
          fontScale: 1.0 // Reset font scale for new slides
        });
        currentIndex += itemsPerSlide;
      }
    }
    
    return distribution;
  }

  /**
   * Calcula el número óptimo de elementos por lámina
   */
  calculateOptimalItemsPerSlide(contentItems, decisions) {
    const totalItems = contentItems.length;
    const avgComplexity = contentItems.reduce((sum, item) => {
      return sum + (item.text ? item.text.length : 100);
    }, 0) / totalItems;

    // Si el contenido es muy denso, mostrar menos elementos por lámina
    if (avgComplexity > 300) {
      return Math.max(1, Math.ceil(totalItems / 3));
    } else if (avgComplexity > 150) {
      return Math.max(1, Math.ceil(totalItems / 2));
    } else {
      return Math.max(2, Math.ceil(totalItems / 2));
    }
  }

  /**
   * Determina el layout específico para una lámina
   */
  determineLayoutForSlide(items) {
    if (items.length === 1) {
      return 'single-item';
    } else if (items.length === 2) {
      return 'two-column';
    } else if (items.length <= 4) {
      return 'grid-2x2';
    } else {
      return 'vertical-list';
    }
  }

  /**
   * Obtiene el tamaño de fuente apropiado para un elemento
   */
  getFontSizeForItem(item) {
    if (item.importance === 'high') return this.fontConfig.title.size;
    if (item.importance === 'medium') return this.fontConfig.subtitle.size;
    return this.fontConfig.body.size;
  }

  /**
   * Aplica las decisiones de IA al contenido
   * @param {Object} slide - Objeto de lámina PPTX
   * @param {Array} contentItems - Elementos de contenido
   * @param {Object} decisions - Decisiones de IA
   * @returns {Array} Array de láminas creadas
   */
  applyAdaptiveLayout(slide, contentItems, decisions) {
    const slides = [slide];
    
    decisions.contentDistribution.forEach((distribution, index) => {
      if (index > 0) {
        // Solo retornar información sobre la necesidad de crear nueva lámina
        // La creación real se maneja desde el servicio principal
      }

      // Aplicar layout a la lámina correspondiente
      this.applyLayoutToSlide(slides[index], distribution.items, distribution);
    });
    
    return slides;
  }

  /**
   * Aplica un layout específico a una lámina
   */
  applyLayoutToSlide(slide, items, distribution) {
    const layout = distribution.layout;
    const fontScale = distribution.fontScale;

    switch (layout) {
      case 'grid-2x2':
        this.applyGridLayout(slide, items, fontScale);
        break;
      case 'two-column':
        this.applyTwoColumnLayout(slide, items, fontScale);
        break;
      case 'vertical-list':
        this.applyVerticalLayout(slide, items, fontScale);
        break;
      case 'card-layout':
        this.applyCardLayout(slide, items, fontScale);
        break;
      default:
        this.applySingleColumnLayout(slide, items, fontScale);
    }
  }

  /**
   * Layout de grid 2x2 para múltiples elementos
   */
  applyGridLayout(slide, items, fontScale) {
    const cellWidth = 4.5;
    const cellHeight = 3;
    const startX = 0.5;
    const startY = 1.5;

    items.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = startX + (col * (cellWidth + 0.2));
      const y = startY + (row * (cellHeight + 0.3));

      this.addContentToPosition(slide, item, x, y, cellWidth, fontScale);
    });
  }

  /**
   * Layout de dos columnas
   */
  applyTwoColumnLayout(slide, items, fontScale) {
    const columnWidth = 4.5;
    const startX = 0.5;
    const startY = 1.5;

    items.forEach((item, index) => {
      const x = startX + (index * (columnWidth + 0.3));
      this.addContentToPosition(slide, item, x, startY, columnWidth, fontScale);
    });
  }

  /**
   * Layout vertical para listas
   */
  applyVerticalLayout(slide, items, fontScale) {
    let currentY = 1.5;
    const itemHeight = 1.2;

    items.forEach((item) => {
      this.addContentToPosition(slide, item, 0.5, currentY, 9, fontScale);
      currentY += itemHeight;
    });
  }

  /**
   * Layout de tarjetas para contenido complejo
   */
  applyCardLayout(slide, items, fontScale) {
    const cardWidth = 4.2;
    const cardHeight = 2.5;
    const startX = 0.5;
    const startY = 1.5;
    const spacing = 0.3;

    items.forEach((item, index) => {
      const x = startX + (index % 2) * (cardWidth + spacing);
      const y = startY + Math.floor(index / 2) * (cardHeight + spacing);

      // Agregar fondo de tarjeta
      slide.addShape(slide.shapes.RECTANGLE, {
        x: x, y: y, w: cardWidth, h: cardHeight,
        fill: { color: 'F9FAFB' },
        line: { color: 'E5E7EB', width: 1 }
      });

      this.addContentToPosition(slide, item, x + 0.1, y + 0.1, cardWidth - 0.2, fontScale);
    });
  }

  /**
   * Layout de columna única
   */
  applySingleColumnLayout(slide, items, fontScale) {
    let currentY = 1.5;
    
    items.forEach((item) => {
      const contentHeight = this.calculateItemHeight(item, fontScale);
      this.addContentToPosition(slide, item, 0.5, currentY, 9, fontScale);
      currentY += contentHeight + 0.3;
    });
  }

  /**
   * Agrega contenido a una posición específica
   */
  addContentToPosition(slide, item, x, y, width, fontScale) {
    const fontSize = this.getFontSizeForItem(item) * fontScale;
    
    if (item.text) {
      slide.addText(item.text, {
        x: x,
        y: y,
        w: width,
        h: 1,
        fontSize: Math.max(fontSize, this.contentLimits.minFontSize),
        color: item.color || '374151',
        bold: item.bold || false
      });
    }
  }

  /**
   * Calcula la altura de un elemento
   */
  calculateItemHeight(item, fontScale) {
    if (item.text) {
      const lines = item.text.split('\n').length;
      const lineHeight = this.fontConfig.body.lineHeight * fontScale;
      return lines * lineHeight;
    }
    return 1;
  }

  /**
   * Método público para validar si el contenido cabe en una lámina
   * @param {Array} contentItems - Elementos de contenido
   * @returns {Object} Resultado de validación
   */
  validateContentFits(contentItems) {
    const analysis = this.analyzeTextDensity(contentItems);
    const spaceAnalysis = this.calculateContentSpace(contentItems, analysis);
    
    return {
      fits: spaceAnalysis.utilizationPercentage <= 100,
      utilization: spaceAnalysis.utilizationPercentage,
      recommendations: this.generateRecommendations(spaceAnalysis, analysis)
    };
  }

  /**
   * Genera recomendaciones para optimizar el contenido
   */
  generateRecommendations(spaceAnalysis, contentAnalysis) {
    const recommendations = [];
    
    if (spaceAnalysis.utilizationPercentage > 100) {
      recommendations.push('El contenido excede el espacio disponible');
      recommendations.push('Considere reducir el texto o dividir en múltiples láminas');
    }
    
    if (contentAnalysis.complexity === 'high') {
      recommendations.push('El contenido es muy denso, considere usar un layout de tarjetas');
    }
    
    if (contentAnalysis.totalLines > 20) {
      recommendations.push('Muchas líneas detectadas, considere usar viñetas o reducir texto');
    }
    
    return recommendations;
  }
}

module.exports = PPTXAdaptiveLayoutService;