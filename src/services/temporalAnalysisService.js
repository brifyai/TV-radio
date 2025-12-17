// Servicio de análisis temporal digital avanzado
// Implementa las 4 ventanas de tiempo y baseline robusto de 30 días

export class TemporalAnalysisService {
  constructor() {
    this.timeWindows = {
      immediate: { // 0-30 minutos
        name: 'Inmediato',
        duration: 30 * 60 * 1000, // 30 minutos en ms
        label: '0-30 min',
        color: '#10B981'
      },
      shortTerm: { // 1-4 horas
        name: 'Corto Plazo',
        duration: 4 * 60 * 60 * 1000, // 4 horas en ms
        label: '1-4 hrs',
        color: '#3B82F6'
      },
      mediumTerm: { // 1-7 días
        name: 'Medio Plazo',
        duration: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
        label: '1-7 días',
        color: '#8B5CF6'
      },
      longTerm: { // 1-4 semanas
        name: 'Largo Plazo',
        duration: 30 * 24 * 60 * 60 * 1000, // 30 días en ms
        label: '1-4 semanas',
        color: '#F59E0B'
      }
    };
  }

  /**
   * Calcular baseline robusto usando 30 días de historial
   * @param {Date} spotDateTime - Fecha y hora del spot
   * @param {Array} historicalData - Datos históricos de Google Analytics
   * @returns {Object} Referencia robusta con múltiples períodos
   */
  calculateRobustReference(spotDateTime, historicalData) {
    const baseline = {
      immediate: this.calculateReferenceForWindow(spotDateTime, this.timeWindows.immediate, historicalData),
      shortTerm: this.calculateReferenceForWindow(spotDateTime, this.timeWindows.shortTerm, historicalData),
      mediumTerm: this.calculateReferenceForWindow(spotDateTime, this.timeWindows.mediumTerm, historicalData),
      longTerm: this.calculateReferenceForWindow(spotDateTime, this.timeWindows.longTerm, historicalData)
    };

    return baseline;
  }

  /**
   * Calcular baseline para una ventana de tiempo específica
   */
  calculateReferenceForWindow(spotDateTime, timeWindow, historicalData) {
    const spotHour = spotDateTime.getHours();
    const spotDayOfWeek = spotDateTime.getDay();
    const spotDayOfMonth = spotDateTime.getDate();

    // Filtrar datos históricos del mismo día de la semana y hora similar
    const similarPeriods = historicalData.filter(data => {
      const dataDate = new Date(data.date);
      const dataHour = dataDate.getHours();
      const dataDayOfWeek = dataDate.getDay();
      
      // Mismo día de la semana ± 1 y hora ± 2
      return Math.abs(dataDayOfWeek - spotDayOfWeek) <= 1 && 
             Math.abs(dataHour - spotHour) <= 2;
    });

    // Calcular estadísticas robustas
    const metrics = ['activeUsers', 'sessions', 'pageviews'];
    const baseline = {};

    metrics.forEach(metric => {
      const values = similarPeriods.map(p => p[metric] || 0);
      
      if (values.length === 0) {
        baseline[metric] = {
          mean: 0,
          median: 0,
          stdDev: 0,
          confidence: 0,
          sampleSize: 0
        };
      } else {
        const sorted = values.sort((a, b) => a - b);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const confidence = Math.min(95, 60 + (values.length * 2)); // Más datos = más confianza

        baseline[metric] = {
          mean: Math.round(mean),
          median: Math.round(median),
          stdDev: Math.round(stdDev),
          confidence: Math.round(confidence),
          sampleSize: values.length
        };
      }
    });

    return baseline;
  }

  /**
   * Analizar impacto en las 4 ventanas de tiempo
   * @param {Object} spotData - Datos del spot
   * @param {Object} analyticsData - Datos de Google Analytics
   * @param {Object} baseline - Referencia robusta
   * @returns {Object} Análisis de impacto por ventana temporal
   */
  analyzeTemporalImpact(spotData, analyticsData, baseline) {
    const spotDateTime = new Date(spotData.dateTime);
    const impact = {};

    Object.entries(this.timeWindows).forEach(([windowKey, windowConfig]) => {
      const windowStart = new Date(spotDateTime);
      const windowEnd = new Date(spotDateTime.getTime() + windowConfig.duration);

      // Obtener datos de la ventana temporal
      const windowData = this.getDataForTimeWindow(windowStart, windowEnd, analyticsData);
      
      // Calcular métricas de la ventana
      const windowMetrics = this.calculateWindowMetrics(windowData);
      
      // Comparar con referencia
      const comparison = this.compareWithReference(windowMetrics, baseline[windowKey]);
      
      impact[windowKey] = {
        ...windowConfig,
        metrics: windowMetrics,
        comparison: comparison,
        significance: this.calculateSignificance(comparison),
        confidence: this.calculateTemporalConfidence(windowMetrics, baseline[windowKey])
      };
    });

    return impact;
  }

  /**
   * Obtener datos de Google Analytics para una ventana de tiempo específica
   */
  getDataForTimeWindow(start, end, analyticsData) {
    // Filtrar datos que caen dentro de la ventana temporal
    return analyticsData.filter(data => {
      const dataDate = new Date(data.date);
      return dataDate >= start && dataDate <= end;
    });
  }

  /**
   * Calcular métricas agregadas para una ventana temporal
   */
  calculateWindowMetrics(windowData) {
    if (windowData.length === 0) {
      return {
        activeUsers: 0,
        sessions: 0,
        pageviews: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        conversionRate: 0
      };
    }

    const totals = windowData.reduce((acc, data) => ({
      activeUsers: acc.activeUsers + (data.activeUsers || 0),
      sessions: acc.sessions + (data.sessions || 0),
      pageviews: acc.pageviews + (data.pageviews || 0),
      bounces: acc.bounces + (data.bounces || 0),
      sessionDuration: acc.sessionDuration + (data.sessionDuration || 0),
      conversions: acc.conversions + (data.conversions || 0)
    }), {
      activeUsers: 0,
      sessions: 0,
      pageviews: 0,
      bounces: 0,
      sessionDuration: 0,
      conversions: 0
    });

    return {
      activeUsers: totals.activeUsers,
      sessions: totals.sessions,
      pageviews: totals.pageviews,
      bounceRate: totals.sessions > 0 ? (totals.bounces / totals.sessions) * 100 : 0,
      avgSessionDuration: totals.sessions > 0 ? totals.sessionDuration / totals.sessions : 0,
      conversionRate: totals.sessions > 0 ? (totals.conversions / totals.sessions) * 100 : 0
    };
  }

  /**
   * Comparar métricas de ventana con baseline
   */
  compareWithReference(windowMetrics, baseline) {
    const comparison = {};
    
    Object.keys(windowMetrics).forEach(metric => {
      const windowValue = windowMetrics[metric];
      const baselineValue = baseline[metric]?.mean || 0;
      
      const absoluteChange = windowValue - baselineValue;
      const percentageChange = baselineValue > 0 ? (absoluteChange / baselineValue) * 100 : 0;
      
      comparison[metric] = {
        windowValue,
        baselineValue,
        absoluteChange,
        percentageChange,
        isSignificant: Math.abs(percentageChange) > 10, // >10% es significativo
        effectSize: this.calculateEffectSize(windowValue, baselineValue, baseline[metric]?.stdDev || 0)
      };
    });
    
    return comparison;
  }

  /**
   * Calcular tamaño del efecto (Cohen's d)
   */
  calculateEffectSize(treatment, control, pooledStdDev) {
    if (pooledStdDev === 0) return 0;
    return (treatment - control) / pooledStdDev;
  }

  /**
   * Calcular significancia estadística
   */
  calculateSignificance(comparison) {
    const metrics = Object.keys(comparison);
    const significantMetrics = metrics.filter(metric => comparison[metric].isSignificant);
    
    return {
      overall: significantMetrics.length / metrics.length,
      significantMetrics: significantMetrics.length,
      totalMetrics: metrics.length,
      effectSizes: metrics.map(metric => comparison[metric].effectSize)
    };
  }

  /**
   * Calcular confianza temporal
   */
  calculateTemporalConfidence(windowMetrics, baseline) {
    const sampleSize = baseline.sampleSize || 0;
    const baselineConfidence = baseline.confidence || 0;
    
    // Factores que aumentan la confianza
    let confidence = baselineConfidence;
    
    // Más datos históricos = más confianza
    if (sampleSize >= 30) confidence += 10;
    else if (sampleSize >= 15) confidence += 5;
    
    // Consistencia en baseline = más confianza
    const consistency = baseline.stdDev / (baseline.mean || 1);
    if (consistency < 0.3) confidence += 5; // Baja variabilidad = alta confianza
    
    return Math.min(95, Math.max(50, confidence));
  }

  /**
   * Generar insights temporales automáticos
   */
  generateTemporalInsights(temporalImpact) {
    const insights = [];
    
    Object.entries(temporalImpact).forEach(([windowKey, impact]) => {
      const windowName = impact.name;
      const metrics = impact.comparison;
      
      // Insight de impacto por ventana
      const significantMetrics = Object.entries(metrics)
        .filter(([_, comp]) => comp.isSignificant)
        .map(([metric, _]) => metric);
      
      if (significantMetrics.length > 0) {
        const metricNames = {
          activeUsers: 'usuarios activos',
          sessions: 'sesiones',
          pageviews: 'vistas de página',
          bounceRate: 'tasa de rebote',
          avgSessionDuration: 'duración promedio',
          conversionRate: 'tasa de conversión'
        };
        
        const metricText = significantMetrics
          .map(m => metricNames[m] || m)
          .join(', ');
        
        insights.push({
          type: 'temporal_impact',
          window: windowName,
          message: `En la ventana ${windowName.toLowerCase()}, se detectó impacto significativo en: ${metricText}`,
          confidence: impact.confidence,
          metrics: significantMetrics
        });
      }
      
      // Insight de sostenibilidad
      if (windowKey === 'shortTerm' && impact.significance.overall > 0.5) {
        insights.push({
          type: 'sustainability',
          window: windowName,
          message: `El efecto del spot se mantuvo durante ${windowName.toLowerCase()}, indicando buena recordación de marca.`,
          confidence: impact.confidence
        });
      }
      
      // Insight de conversión tardía
      if (windowKey === 'longTerm' && metrics.conversionRate?.percentageChange > 20) {
        insights.push({
          type: 'delayed_conversion',
          window: windowName,
          message: `Conversiones tardías detectadas en ${windowName.toLowerCase()}. El spot generó interés sostenido.`,
          confidence: impact.confidence
        });
      }
    });
    
    return insights;
  }

  /**
   * Calcular ROI temporal
   */
  calculateTemporalROI(temporalImpact, spotCost) {
    const totalIncrementalValue = Object.values(temporalImpact).reduce((total, impact) => {
      return total + (impact.comparison.sessions?.absoluteChange || 0) * 0.5; // $0.5 por sesión
    }, 0);
    
    const roi = spotCost > 0 ? ((totalIncrementalValue - spotCost) / spotCost) * 100 : 0;
    
    return {
      totalIncrementalValue: Math.round(totalIncrementalValue),
      spotCost: spotCost,
      roi: Math.round(roi),
      isProfitable: roi > 0
    };
  }
}

export default new TemporalAnalysisService();