import { TemporalAnalysisService } from './temporalAnalysisService';
import ChutesVideoAnalysisService from './chutesVideoAnalysisService';
import { googleAnalyticsService } from './googleAnalyticsService';

/**
 * Obtiene datos de análisis de spots TV para un usuario
 * @param {string} userId - ID del usuario autenticado
 * @param {string} propertyId - ID de la propiedad de Google Analytics
 * @returns {Promise<Object>} Datos de análisis estructurados
 */
export const getSpotAnalysisData = async (userId, propertyId) => {
  try {
    // Validar que tenemos un userId válido
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn('⚠️ Invalid userId provided, skipping API call');
      throw new Error('UserId inválido');
    }

    // Validar que tenemos un propertyId válido
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      console.warn('⚠️ Invalid propertyId provided, skipping API call');
      throw new Error('ID de propiedad inválido');
    }

    console.log('🔍 Making API call for userId:', userId, 'propertyId:', propertyId);
    
    // Obtener datos de Google Analytics con parámetros básicos
    const metrics = ['activeUsers', 'sessions', 'pageviews'];
    const dimensions = ['minute'];
    const dateRange = {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días atrás
      endDate: new Date().toISOString().split('T')[0] // hoy
    };
    
    const analyticsData = await googleAnalyticsService.getAnalyticsData(userId, propertyId, metrics, dimensions, dateRange);
    
    // Obtener análisis temporal
    const temporalAnalysisService = new TemporalAnalysisService();
    const temporalImpact = temporalAnalysisService.analyzeTemporalImpact(
      analyticsData.spotData,
      analyticsData.trafficMetrics,
      temporalAnalysisService.calculateRobustReference(
        new Date(analyticsData.spotData.dateTime),
        analyticsData.historicalData
      )
    );
    
    // Obtener análisis de video (si está disponible)
    let videoAnalysis = null;
    if (analyticsData.videoUrl) {
      const videoService = new ChutesVideoAnalysisService();
      videoAnalysis = await videoService.analyzeVideo(analyticsData.videoUrl, analyticsData);
    }

    // Generar insights inteligentes
    const smartInsights = generateSmartInsights(temporalImpact, videoAnalysis);
    
    return {
      impactAnalysis: temporalImpact,
      confidenceLevel: calculateConfidenceLevel(temporalImpact, videoAnalysis),
      smartInsights,
      trafficData: analyticsData.trafficMetrics
    };
  } catch (error) {
    console.error('Error en spotAnalysisService:', error);
    // No re-lanzar el error para permitir fallback a datos alternativos
    throw error;
  }
};

/**
 * Genera insights inteligentes basados en análisis temporal y de video
 */
const generateSmartInsights = (temporalAnalysis, videoAnalysis) => {
  const insights = [];
  
  // Insight 1: Timing del spot
  insights.push({
    category: 'Timing del Spot',
    value: temporalAnalysis.timingEffectiveness,
    icon: '⏰',
    text: temporalAnalysis.timingRecommendation,
    color: 'bg-blue-100',
    border: 'border-blue-300'
  });

  // Insight 2: Análisis de impacto
  insights.push({
    category: 'Análisis de Impacto',
    value: temporalAnalysis.impactScore,
    icon: '📊',
    text: `Impacto: ${temporalAnalysis.impactPercentage}% de aumento`,
    color: 'bg-green-100',
    border: 'border-green-300'
  });

  // Insight 3: Sostenibilidad del efecto
  insights.push({
    category: 'Sostenibilidad del Efecto',
    value: temporalAnalysis.sustainabilityScore,
    icon: '⚡',
    text: temporalAnalysis.sustainabilityDescription,
    color: 'bg-yellow-100',
    border: 'border-yellow-300'
  });

  // Insight 4: Tasa de conversión
  if (temporalAnalysis.conversionRate !== undefined) {
    insights.push({
      category: 'Tasa de Conversión Real',
      value: temporalAnalysis.conversionRate,
      icon: '📊',
      text: `Tasa real: ${temporalAnalysis.conversionRate}%`,
      color: 'bg-purple-100',
      border: 'border-purple-300'
    });
  }

  // Insight 5: Benchmarking (si hay video analysis)
  if (videoAnalysis) {
    insights.push({
      category: 'Benchmarking',
      value: videoAnalysis.benchmarkScore,
      icon: '📊',
      text: videoAnalysis.benchmarkComparison,
      color: 'bg-red-100',
      border: 'border-red-300'
    });
  }

  return insights;
};

/**
 * Calcula nivel de confianza basado en análisis
 */
const calculateConfidenceLevel = (temporalAnalysis, videoAnalysis) => {
  let confidence = 80; // Base
  
  if (temporalAnalysis.dataQuality === 'high') confidence += 10;
  if (videoAnalysis && videoAnalysis.confidence === 'high') confidence += 10;
  
  return Math.min(confidence, 100);
};