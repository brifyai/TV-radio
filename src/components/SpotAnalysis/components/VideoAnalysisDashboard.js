import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Play,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import ChutesVideoAnalysisService from '../../../services/chutesVideoAnalysisService';

const VideoAnalysisDashboard = ({ 
  analysisResults, 
  videoFile, 
  spotData,
  isAnalyzing = false 
}) => {
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [analyzingVideo, setAnalyzingVideo] = useState(false);
  const [videoAnalysisService] = useState(new ChutesVideoAnalysisService());
  const [error, setError] = useState(null);

  // Definir función de análisis de video antes de usarla
  const analyzeVideoContent = React.useCallback(async () => {
    if (!videoFile || !spotData || !analysisResults || analysisResults.length === 0) return;

    setAnalyzingVideo(true);
    setError(null);

    try {
      console.log('🎬 Iniciando análisis de video...');
      
      // Usar el primer spot como referencia para el análisis
      const referenceSpot = analysisResults[0];
      const spotInfo = {
        fecha: referenceSpot.spot.fecha,
        hora: referenceSpot.spot.hora,
        canal: referenceSpot.spot.canal,
        titulo_programa: referenceSpot.spot.titulo_programa,
        tipo_comercial: referenceSpot.spot.tipo_comercial,
        version: referenceSpot.spot.version,
        duracion: referenceSpot.spot.duracion
      };

      const result = await videoAnalysisService.analyzeVideo(videoFile, spotInfo);
      
      if (result.success) {
        // Parsear la respuesta JSON
        const parsedAnalysis = videoAnalysisService.parseAnalysisResponse(result.analysis);
        setVideoAnalysis({
          ...parsedAnalysis,
          rawAnalysis: result.analysis,
          model: result.model,
          tokensUsed: result.tokensUsed,
          timestamp: result.timestamp
        });
        console.log('✅ Análisis de video completado');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Error en análisis de video:', err);
      setError(err.message);
    } finally {
      setAnalyzingVideo(false);
    }
  }, [videoFile, spotData, analysisResults, videoAnalysisService]);

  // Analizar video cuando se proporciona
  useEffect(() => {
    if (videoFile && spotData && analysisResults && analysisResults.length > 0) {
      analyzeVideoContent();
    }
  }, [videoFile, spotData, analysisResults, analyzeVideoContent]);

  // Generar racional de vinculación video-analytics basado en datos 100% REALES
  const generateVideoAnalyticsRational = () => {
    if (!videoAnalysis || !analysisResults || analysisResults.length === 0) return null;

    const spot = analysisResults[0];
    const rational = [];

    // 1. Análisis de timing REAL basado únicamente en datos de Google Analytics
    const spotHour = spot.spot.dateTime.getHours();
    const spotUsers = spot.metrics.spot.activeUsers;
    const spotSessions = spot.metrics.spot.sessions;
    const spotPageviews = spot.metrics.spot.pageviews;
    
    // Usar únicamente métricas reales de GA, sin simulaciones
    rational.push({
      type: 'timing',
      title: 'Análisis de Timing Real',
      message: `Spot transmitido a las ${spotHour}:00. Métricas reales GA: ${spotUsers} usuarios activos, ${spotSessions} sesiones, ${spotPageviews} vistas de página durante la transmisión.`,
      impact: Math.abs(spot.impact.activeUsers.percentageChange) > 20 ? 'Alto' : Math.abs(spot.impact.activeUsers.percentageChange) > 10 ? 'Medio' : 'Bajo',
      confidence: 95, // Alta confianza porque son datos directos de GA
      realData: true
    });

    // 2. Análisis de efectividad REAL vs métricas reales de GA
    if (videoAnalysis.analisis_efectividad) {
      const efectividad = videoAnalysis.analisis_efectividad;
      const avgEffectiveness = Object.values(efectividad).reduce((sum, val) => sum + parseFloat(val), 0) / Object.values(efectividad).length;
      const realImpact = spot.impact.activeUsers.percentageChange;
      
      rational.push({
        type: 'effectiveness',
        title: 'Efectividad IA vs Métricas Reales GA',
        message: `Evaluación IA: ${avgEffectiveness.toFixed(1)}/10. Impacto real medido en GA: ${realImpact >= 0 ? '+' : ''}${realImpact.toFixed(1)}% en usuarios activos.`,
        impact: Math.abs(realImpact) > 25 ? 'Alto' : Math.abs(realImpact) > 12 ? 'Medio' : 'Bajo',
        confidence: 90, // Alta confianza por datos directos
        realData: true
      });
    }

    // 3. Análisis de contenido visual REAL vs engagement real
    if (videoAnalysis.contenido_visual) {
      const escenas = videoAnalysis.contenido_visual.escenas_principales || [];
      const colores = videoAnalysis.contenido_visual.colores_dominantes || [];
      
      if (escenas.length > 0) {
        const realEngagement = spot.impact.pageviews.percentageChange;
        
        rational.push({
          type: 'visual_content',
          title: 'Contenido Visual vs Engagement Real GA',
          message: `Video contiene ${escenas.length} escenas principales. Engagement real GA: ${realEngagement >= 0 ? '+' : ''}${realEngagement.toFixed(1)}% en vistas de página.`,
          impact: Math.abs(realEngagement) > 30 ? 'Alto' : Math.abs(realEngagement) > 15 ? 'Medio' : 'Bajo',
          confidence: 85,
          realData: true
        });
      }

      if (colores.length > 0) {
        const realRetention = spot.impact.sessions.percentageChange;
        
        rational.push({
          type: 'color_psychology',
          title: 'Colores vs Retención Real GA',
          message: `Paleta de colores detectada: ${colores.join(', ')}. Retención real GA: ${realRetention >= 0 ? '+' : ''}${realRetention.toFixed(1)}% en sesiones.`,
          impact: Math.abs(realRetention) > 25 ? 'Alto' : Math.abs(realRetention) > 12 ? 'Medio' : 'Bajo',
          confidence: 80,
          realData: true
        });
      }
    }

    // 4. Análisis de mensaje vs conversión REAL
    if (videoAnalysis.mensaje_marketing) {
      const mensaje = videoAnalysis.mensaje_marketing;
      const hasClearCTA = mensaje.call_to_action && mensaje.call_to_action !== '';
      const hasValueProposition = mensaje.propuesta_valor && mensaje.propuesta_valor !== '';
      const realConversion = spot.impact.activeUsers.percentageChange;
      
      rational.push({
        type: 'messaging',
        title: 'Calidad del Mensaje vs Conversión Real GA',
        message: `Call-to-action: ${hasClearCTA ? 'Identificado' : 'No identificado'}, Propuesta de valor: ${hasValueProposition ? 'Presente' : 'Ausente'}. Conversión real GA: ${realConversion >= 0 ? '+' : ''}${realConversion.toFixed(1)}%.`,
        impact: Math.abs(realConversion) > 35 ? 'Alto' : Math.abs(realConversion) > 18 ? 'Medio' : 'Bajo',
        confidence: 85,
        realData: true
      });
    }

    return rational;
  };


  // Generar recomendaciones basadas únicamente en datos REALES
  const generateRecommendations = () => {
    if (!videoAnalysis || !analysisResults || analysisResults.length === 0) return [];

    const recommendations = [];
    const spot = analysisResults[0];
    const impact = spot.impact.activeUsers.percentageChange;
    const spotHour = spot.spot.dateTime.getHours();
    const isPrimeTime = spotHour >= 19 && spotHour <= 23;

    // Recomendaciones basadas en efectividad REAL del análisis de IA
    if (videoAnalysis.analisis_efectividad) {
      const efectividad = videoAnalysis.analisis_efectividad;
      
      if (parseFloat(efectividad.claridad_mensaje) < 6) {
        recommendations.push({
          priority: 'Alta',
          category: 'Mensaje',
          text: 'Mejorar la claridad del mensaje principal del spot',
          why: `Evaluación actual: ${parseFloat(efectividad.claridad_mensaje).toFixed(1)}/10. Un mensaje más claro puede mejorar la comprensión del mensaje.`
        });
      }
      
      if (parseFloat(efectividad.engagement_visual) < 6) {
        recommendations.push({
          priority: 'Media',
          category: 'Visual',
          text: 'Incrementar elementos visuales atractivos',
          why: `Evaluación actual: ${parseFloat(efectividad.engagement_visual).toFixed(1)}/10. Elementos visuales más dinámicos pueden aumentar el engagement.`
        });
      }
      
      if (parseFloat(efectividad.memorabilidad) < 6) {
        recommendations.push({
          priority: 'Alta',
          category: 'Branding',
          text: 'Desarrollar elementos más memorables',
          why: `Evaluación actual: ${parseFloat(efectividad.memorabilidad).toFixed(1)}/10. Elementos distintivos mejoran el recall de marca.`
        });
      }
    }

    // Recomendaciones basadas en métricas REALES de Google Analytics
    if (impact < 15) {
      recommendations.push({
        priority: 'Alta',
        category: 'Timing',
        text: 'Evaluar diferentes horarios de transmisión',
        why: `Impacto actual: ${impact >= 0 ? '+' : ''}${impact.toFixed(1)}%. Considerar horarios con mayor actividad de audiencia.`
      });
    }
    
    if (impact > 40) {
      recommendations.push({
        priority: 'Media',
        category: 'Optimización',
        text: 'Replicar elementos exitosos de este spot',
        why: `Impacto medido: ${impact >= 0 ? '+' : ''}${impact.toFixed(1)}%. Los elementos que generaron este resultado pueden aplicarse en futuras campañas.`
      });
    }

    // Recomendación basada en timing REAL
    if (!isPrimeTime && impact < 25) {
      recommendations.push({
        priority: 'Alta',
        category: 'Timing',
        text: 'Considerar horarios de mayor audiencia',
        why: `Spot transmitido a las ${spotHour}:00. Impacto: ${impact >= 0 ? '+' : ''}${impact.toFixed(1)}%. Horarios 19:00-23:00 suelen tener mayor actividad.`
      });
    }

    return recommendations;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'text-red-600 bg-red-50 border-red-200';
      case 'Media': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Baja': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Alto': return 'text-green-600';
      case 'Medio': return 'text-yellow-600';
      case 'Bajo': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const [rational, setRational] = useState(null);

  // Cargar racional cuando estén disponibles los datos
  useEffect(() => {
    if (videoAnalysis && analysisResults && analysisResults.length > 0) {
      loadRealRational();
    }
  }, [videoAnalysis, analysisResults]);

  const loadRealRational = async () => {
    const realRational = await generateVideoAnalyticsRational();
    setRational(realRational);
  };

  const recommendations = generateRecommendations();

  if (!videoFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Análisis de Video
            </h3>
            <p className="text-gray-600">
              Sube un video del spot para obtener análisis detallado de contenido
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Análisis de Video & Analytics
            </h3>
            <p className="text-sm text-gray-600">
              Racional de vinculación entre contenido visual y métricas web
            </p>
          </div>
        </div>
        
        {analyzingVideo && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm font-medium">Analizando...</span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Error en análisis</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </motion.div>
      )}

      {/* Video Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <Play className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Video Analizado</h4>
            <p className="text-sm text-blue-700">{videoFile.name}</p>
          </div>
        </div>
      </div>

      {/* Racional Video-Analytics */}
      {rational && rational.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h4 className="font-semibold text-gray-900">Racional Video-Analytics</h4>
          </div>
          
          <div className="space-y-4">
            {rational.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-indigo-900">{item.title}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(item.impact)} bg-white border`}>
                      Impacto {item.impact}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.confidence}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                        className="h-2 bg-indigo-500 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-600">{item.confidence}%</span>
                  </div>
                </div>
                <p className="text-sm text-indigo-800">{item.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas de Correlación */}
      {analysisResults && analysisResults.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Correlación Video-Web</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const result = analysisResults[0];
              return (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Usuarios Activos</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      +{(result.impact.activeUsers.percentageChange).toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Durante el spot vs referencia
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Sesiones</span>
                      <MousePointer className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      +{(result.impact.sessions.percentageChange).toFixed(1)}%
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Incremento en sesiones
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Vistas de Página</span>
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      +{(result.impact.pageviews.percentageChange).toFixed(1)}%
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      Aumento en engagement
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900">Recomendaciones Específicas</h4>
          </div>
          
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {rec.category}
                    </span>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                      {rec.priority}
                    </span>
                  </div>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-sm mt-1">{rec.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen Ejecutivo del Video */}
      {videoAnalysis && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="h-5 w-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Resumen Ejecutivo</h4>
          </div>
          
          {(() => {
            let resumenContent = 'Análisis no disponible';
            
            if (videoAnalysis.resumen_ejecutivo) {
              if (typeof videoAnalysis.resumen_ejecutivo === 'string') {
                resumenContent = videoAnalysis.resumen_ejecutivo;
              } else if (typeof videoAnalysis.resumen_ejecutivo === 'object') {
                // Si es un objeto, intentar extraer información útil
                const obj = videoAnalysis.resumen_ejecutivo;
                if (obj.analisis_general) {
                  resumenContent = obj.analisis_general;
                } else if (obj.resumen) {
                  resumenContent = obj.resumen;
                } else if (obj.conclusion) {
                  resumenContent = obj.conclusion;
                } else {
                  // NO generar contenido simulado - mostrar mensaje de no disponibilidad
                  resumenContent = 'Análisis no disponible';
                }
              }
            } else {
              // NO generar contenido simulado cuando no hay resumen ejecutivo
              resumenContent = 'Análisis no disponible';
            }
            
            return (
              <div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {resumenContent}
                </p>
                
                {/* Métricas clave del análisis */}
                {videoAnalysis.analisis_efectividad && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xs text-gray-600">Claridad</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {parseFloat(videoAnalysis.analisis_efectividad.claridad_mensaje || 0).toFixed(1)}/10
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xs text-gray-600">Engagement</div>
                      <div className="text-sm font-semibold text-green-600">
                        {parseFloat(videoAnalysis.analisis_efectividad.engagement_visual || 0).toFixed(1)}/10
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xs text-gray-600">Memorabilidad</div>
                      <div className="text-sm font-semibold text-purple-600">
                        {parseFloat(videoAnalysis.analisis_efectividad.memorabilidad || 0).toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          
          {videoAnalysis.tags_relevantes &&
           Array.isArray(videoAnalysis.tags_relevantes) &&
           videoAnalysis.tags_relevantes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {videoAnalysis.tags_relevantes.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600"
                >
                  {typeof tag === 'string' ? tag : 'Tag no válido'}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {analyzingVideo && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Analizando contenido del video...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoAnalysisDashboard;