import { TemporalAnalysisService } from './temporalAnalysisService';
import ChutesVideoAnalysisService from './chutesVideoAnalysisService';
import { googleAnalyticsService } from './googleAnalyticsService';

/**
 * Obtiene datos de análisis de spots TV para un usuario
 * @param {string} accessToken - Token de acceso de Google Analytics
 * @param {string} propertyId - ID de la propiedad de Google Analytics
 * @returns {Promise<Object>} Datos de análisis estructurados
 */
export const getSpotAnalysisData = async (accessToken, propertyId) => {
  try {
    // Validar que tenemos un accessToken válido
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
      console.warn('⚠️ Invalid accessToken provided, skipping API call');
      throw new Error('AccessToken inválido');
    }

    // Validar que tenemos un propertyId válido
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      console.warn('⚠️ Invalid propertyId provided, skipping API call');
      throw new Error('ID de propiedad inválido');
    }

    console.log('🔍 Making API call for propertyId:', propertyId);
    
    // Obtener datos de Google Analytics con parámetros básicos
    const metrics = ['activeUsers', 'sessions', 'pageviews'];
    const dimensions = ['minute'];
    const dateRange = {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días atrás
      endDate: new Date().toISOString().split('T')[0] // hoy
    };
    
    // 🚨 MEJORA: Manejo de errores 401 con retry automático
    try {
      const analyticsData = await googleAnalyticsService.getAnalyticsData(accessToken, propertyId, metrics, dimensions, dateRange);
      
      // 🚨 CORRECCIÓN: Manejar estructura real de datos de Google Analytics
      console.log('🔍 Estructura de datos recibidos:', analyticsData);
      
      // Verificar si tenemos datos válidos
      if (!analyticsData || !analyticsData.rows || analyticsData.rows.length === 0) {
        console.warn('⚠️ No hay datos disponibles de Google Analytics');
        // Retornar datos de ejemplo para evitar errores
        return getEmptyAnalysisData();
      }
      
      // Obtener análisis temporal con datos reales de GA
      const temporalAnalysisService = new TemporalAnalysisService();
      
      // Crear datos de spot ficticios para análisis temporal (ya que GA no tiene datos de spots específicos)
      const mockSpotData = {
        dateTime: new Date(), // Fecha actual como fallback
        canal: 'TV',
        titulo_programa: 'Análisis de Google Analytics',
        tipo_comercial: 'General',
        version: '1.0',
        duracion: 30,
        inversion: 0
      };
      
      const temporalImpact = temporalAnalysisService.analyzeTemporalImpact(
        mockSpotData,
        analyticsData, // Usar los datos reales de GA como trafficMetrics
        temporalAnalysisService.calculateRobustReference(
          new Date(analyticsData.rows[0]?.dimensionValues?.[0]?.value || new Date()),
          [] // Sin datos históricos por ahora
        )
      );
      
      // Obtener análisis de video (si está disponible) - por ahora null
      let videoAnalysis = null;

      // Generar insights inteligentes
      const smartInsights = generateSmartInsights(temporalImpact, videoAnalysis);
      
      return {
        impactAnalysis: temporalImpact,
        confidenceLevel: calculateConfidenceLevel(temporalImpact, videoAnalysis),
        smartInsights,
        trafficData: analyticsData
      };
    } catch (analyticsError) {
      // 🚨 NUEVO: Manejo específico de errores 401
      if (analyticsError.message.includes('token de acceso ha expirado') ||
          analyticsError.message.includes('401') ||
          analyticsError.message.includes('Unauthorized')) {
        console.log('🔄 Token expirado detectado en spotAnalysisService, el contexto debería manejar el refresh');
        // Re-lanzar el error para que el contexto lo maneje
        throw analyticsError;
      }
      
      // Para otros errores, retornar datos vacíos en lugar de fallar
      console.error('❌ Error obteniendo datos de Analytics:', analyticsError);
      return getEmptyAnalysisData();
    }
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

/**
 * Retorna datos de análisis vacíos o por defecto para evitar errores
 */
const getEmptyAnalysisData = () => {
  const temporalAnalysisService = new TemporalAnalysisService();
  
  // Crear datos de análisis temporal por defecto
  const defaultSpotData = {
    dateTime: new Date(),
    canal: 'TV',
    titulo_programa: 'Análisis de Google Analytics',
    tipo_comercial: 'General',
    version: '1.0',
    duracion: 30,
    inversion: 0
  };
  
  const temporalImpact = temporalAnalysisService.analyzeTemporalImpact(
    defaultSpotData,
    { rows: [], totals: [] }, // Datos vacíos de GA
    temporalAnalysisService.calculateRobustReference(new Date(), [])
  );
  
  // Generar insights por defecto
  const smartInsights = [
    {
      category: 'Estado del Sistema',
      value: 'Sin datos',
      icon: '⚠️',
      text: 'No hay datos disponibles de Google Analytics. Verifica tu conexión y configuración.',
      color: 'bg-gray-100',
      border: 'border-gray-300'
    },
    {
      category: 'Recomendación',
      value: 'Configuración',
      icon: '🔧',
      text: 'Conecta tu cuenta de Google Analytics y selecciona una propiedad válida.',
      color: 'bg-blue-100',
      border: 'border-blue-300'
    }
  ];
  
  return {
    impactAnalysis: temporalImpact,
    confidenceLevel: 0, // Sin confianza sin datos
    smartInsights,
    trafficData: { rows: [], totals: [] }
  };
};