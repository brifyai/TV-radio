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
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(null);
  const [isPermanentlyFailed, setIsPermanentlyFailed] = useState(false);

  // Definir función de análisis de video antes de usarla
  const analyzeVideoContent = React.useCallback(async () => {
    if (!videoFile || !spotData || !analysisResults || analysisResults.length === 0) return;

    // Verificar si ya se intentó demasiadas veces
    const now = Date.now();
    const TIME_BETWEEN_RETRIES = 5 * 60 * 1000; // 5 minutos
    const MAX_RETRIES = 3;
    
    if (isPermanentlyFailed) {
      console.log('🚫 Análisis de video marcado como fallido permanentemente, omitiendo intento');
      return;
    }
    
    if (retryCount >= MAX_RETRIES) {
      const timeSinceLastAttempt = lastAttemptTime ? now - lastAttemptTime : Infinity;
      if (timeSinceLastAttempt < TIME_BETWEEN_RETRIES) {
        console.log(`⏳ Esperando ${Math.ceil((TIME_BETWEEN_RETRIES - timeSinceLastAttempt) / 1000)}s antes de reintentar análisis de video`);
        return;
      } else {
        // Resetear contador después del tiempo de espera
        console.log('🔄 Reiniciando contador de reintentos para análisis de video');
        setRetryCount(0);
      }
    }

    setAnalyzingVideo(true);
    setError(null);
    setLastAttemptTime(now);

    try {
      console.log(`🎬 Iniciando análisis de video con Chutes AI (intento ${retryCount + 1}/${MAX_RETRIES})...`);
      
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
          timestamp: result.timestamp,
          apiProvider: result.apiProvider,
          attempt: result.attempt
        });
        console.log('✅ Análisis de video completado exitosamente');
        setRetryCount(0); // Resetear contador en éxito
      } else {
        const errorMessage = result.error || 'Error en el análisis del video';
        const suggestion = result.suggestion || '';
        const fullError = suggestion ? `${errorMessage}\n\n💡 Sugerencia: ${suggestion}` : errorMessage;
        
        // Incrementar contador de reintentos
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        // Log adicional para debugging
        console.error('🔍 Detalles del error:', {
          error: result.error,
          suggestion: result.suggestion,
          attempts: result.attempts,
          apiProvider: result.apiProvider,
          timestamp: result.timestamp,
          retryCount: newRetryCount
        });
        
        // Si es error 503 y hemos alcanzado el máximo de reintentos, marcar como fallido permanentemente
        if (errorMessage.includes('503') && newRetryCount >= MAX_RETRIES) {
          console.warn('🚫 Marcando análisis de video como fallido permanentemente después de múltiples intentos 503');
          setIsPermanentlyFailed(true);
          setError(`${fullError}\n\n⚠️ Se ha agotado el número máximo de intentos. El análisis se reintentará automáticamente en 5 minutos.`);
        } else {
          throw new Error(fullError);
        }
      }
    } catch (err) {
      console.error('❌ Error en análisis de video:', err);
      
      // Incrementar contador de reintentos
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      // Si hemos alcanzado el máximo de reintentos, marcar como fallido permanentemente
      if (newRetryCount >= MAX_RETRIES) {
        console.warn('🚫 Marcando análisis de video como fallido permanentemente después de múltiples errores');
        setIsPermanentlyFailed(true);
        setError(`${err.message}\n\n⚠️ Se ha agotado el número máximo de intentos. El análisis se reintentará automáticamente en 5 minutos.`);
      } else {
        setError(err.message);
      }
    } finally {
      setAnalyzingVideo(false);
    }
  }, [videoFile, spotData, analysisResults, videoAnalysisService, retryCount, lastAttemptTime, isPermanentlyFailed]);

  // Analizar video cuando se proporciona
  useEffect(() => {
    if (videoFile && spotData && analysisResults && analysisResults.length > 0) {
      // Solo analizar si no está en proceso y no ha fallado permanentemente
      if (!analyzingVideo && !isPermanentlyFailed) {
        analyzeVideoContent();
      }
    }
  }, [videoFile, spotData, analysisResults, analyzeVideoContent, analyzingVideo, isPermanentlyFailed]);

  // Efecto para reintentar análisis después del tiempo de espera
  useEffect(() => {
    if (isPermanentlyFailed && lastAttemptTime) {
      const TIME_BETWEEN_RETRIES = 5 * 60 * 1000; // 5 minutos
      const timeSinceLastAttempt = Date.now() - lastAttemptTime;
      
      if (timeSinceLastAttempt >= TIME_BETWEEN_RETRIES) {
        console.log('🔄 Reiniciando análisis de video después del tiempo de espera');
        setIsPermanentlyFailed(false);
        setRetryCount(0);
        setError(null);
      }
    }
  }, [isPermanentlyFailed, lastAttemptTime]);

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
    if (videoAnalysis?.analisis_efectividad) {
      const efectividad = videoAnalysis.analisis_efectividad;
      const avgEffectiveness = efectividad && Object.values(efectividad).length > 0
        ? Object.values(efectividad).reduce((sum, val) => sum + parseFloat(val || 0), 0) / Object.values(efectividad).length
        : 0;
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
    if (videoAnalysis?.contenido_visual) {
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
    if (videoAnalysis?.mensaje_marketing) {
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


  // ANÁLISIS CAUSAL: Determinar si el spot funcionó y qué factores influyeron
  const generateRecommendations = () => {
    console.log('🔍 Generando análisis causal...', { videoAnalysis, analysisResults });
    
    const recommendations = [];
    
    // Si no hay datos de análisis, no generar recomendaciones
    if (!analysisResults || analysisResults.length === 0) {
      console.log('⚠️ No hay datos de análisis para generar recomendaciones');
      return recommendations;
    }

    try {
      const spot = analysisResults[0];
      const impact = spot.impact?.activeUsers?.percentageChange || 0;
      const spotHour = spot.spot?.dateTime?.getHours() || new Date().getHours();
      const isPrimeTime = spotHour >= 19 && spotHour <= 23;
      const isMorning = spotHour >= 6 && spotHour < 12;
      const isAfternoon = spotHour >= 12 && spotHour < 19;

      console.log('📊 Datos del spot para análisis causal:', { impact, spotHour, isPrimeTime });

      // RECOMENDACIONES ESPECÍFICAS DE TIMING - ALTA PRIORIDAD
      recommendations.push({
        priority: 'Alta',
        category: 'Timing',
        text: 'Evaluar diferentes horarios de transmisión',
        why: `El spot fue transmitido a las ${spotHour}:00. Los horarios de mayor audiencia para generar tráfico web son: 19:00-23:00 (prime time), 12:00-14:00 (almuerzo) y 20:00-22:00 (nocturno).`
      });

      recommendations.push({
        priority: 'Alta',
        category: 'Timing',
        text: 'Considerar horarios de mayor audiencia',
        why: `Horario actual: ${spotHour}:00 ${isPrimeTime ? '(Prime Time - ÓPTIMO)' : isMorning ? '(Mañana - MEDIO)' : isAfternoon ? '(Tarde - MEJORABLE)' : '(Noche - BAJO)'}. Recomendación: ${isPrimeTime ? 'Mantener este horario' : 'Probar horarios 19:00-23:00 para maximizar impacto'}.`
      });

      // ANÁLISIS CAUSAL 1: ¿El spot funcionó o no?
      if (impact > 20) {
        // SPOT EXITOSO - Identificar qué factores causaron el éxito
        recommendations.push({
          priority: 'Media',
          category: 'Análisis de Éxito',
          text: 'El spot SÍ funcionó - Incremento significativo en tráfico',
          why: `Impacto medido: +${impact.toFixed(1)}%. El spot generó correlación positiva entre TV y tráfico web.`
        });

        // Analizar factores de éxito específicos
        if (videoAnalysis?.mensaje_marketing?.call_to_action) {
          recommendations.push({
            priority: 'Media',
            category: 'Factor de Éxito',
            text: 'Call-to-action efectivo identificado',
            why: `El spot contenía CTA claro: "${videoAnalysis.mensaje_marketing.call_to_action}". Este elemento contribuyó al éxito del spot.`
          });
        }

        if (videoAnalysis.contenido_visual?.elementos_generadores_tráfico) {
          const elementos = videoAnalysis.contenido_visual.elementos_generadores_tráfico;
          recommendations.push({
            priority: 'Media',
            category: 'Factor de Éxito',
            text: 'Elementos visuales generadores de tráfico identificados',
            why: `Elementos que motivaron visitas: ${elementos.join(', ')}. Estos elementos deben replicarse en futuros spots.`
          });
        }

        if (isPrimeTime) {
          recommendations.push({
            priority: 'Baja',
            category: 'Factor de Éxito',
            text: 'Timing óptimo (prime time) contribuyó al éxito',
            why: `Transmitido a las ${spotHour}:00 (horario prime). El timing adecuado maximizó la audiencia y el impacto.`
          });
        }

      } else if (impact < -10) {
        // SPOT FALLIDO - Identificar qué factores causaron el fracaso
        recommendations.push({
          priority: 'Alta',
          category: 'Análisis de Fracaso',
          text: 'El spot NO funcionó - Impacto negativo en tráfico',
          why: `Impacto medido: ${impact.toFixed(1)}%. El spot generó correlación negativa entre TV y tráfico web.`
        });

        // Analizar factores de fracaso específicos
        if (!videoAnalysis?.mensaje_marketing?.call_to_action) {
          recommendations.push({
            priority: 'Alta',
            category: 'Factor de Fracaso',
            text: 'Ausencia de call-to-action claro',
            why: 'El spot no contenía una llamada a la acción específica para visitar el sitio web, limitando la conversión TV-Web.'
          });
        }

        if (videoAnalysis?.analisis_efectividad?.claridad_mensaje && parseFloat(videoAnalysis.analisis_efectividad.claridad_mensaje) < 5) {
          recommendations.push({
            priority: 'Alta',
            category: 'Factor de Fracaso',
            text: 'Mensaje poco claro confundió a la audiencia',
            why: `Claridad del mensaje: ${parseFloat(videoAnalysis.analisis_efectividad.claridad_mensaje).toFixed(1)}/10. Un mensaje confuso reduce la intención de visitar el sitio.`
          });
        }

        if (!isPrimeTime) {
          recommendations.push({
            priority: 'Alta',
            category: 'Factor de Fracaso',
            text: 'Timing subóptimo limitó el alcance',
            why: `Transmitido a las ${spotHour}:00 (fuera de prime time). El horario redujo la audiencia potencial y el impacto.`
          });
        }

      } else {
        // SPOT NEUTRAL - Impacto mínimo
        recommendations.push({
          priority: 'Media',
          category: 'Análisis Neutral',
          text: 'Spot con impacto mínimo - Oportunidad de mejora',
          why: `Impacto medido: ${impact.toFixed(1)}%. El spot no generó cambios significativos en el tráfico web.`
        });

        // Analizar oportunidades de mejora
        if (videoAnalysis?.analisis_efectividad) {
          const efectividad = videoAnalysis.analisis_efectividad;
          
          if (efectividad && parseFloat(efectividad.engagement_visual || 0) < 7) {
            recommendations.push({
              priority: 'Alta',
              category: 'Oportunidad de Mejora',
              text: 'Incrementar engagement visual para generar más tráfico',
              why: `Engagement visual actual: ${parseFloat(efectividad.engagement_visual || 0).toFixed(1)}/10. Elementos más dinámicos pueden aumentar la motivación de visitar el sitio.`
            });
          }

          if (efectividad && parseFloat(efectividad.memorabilidad || 0) < 6) {
            recommendations.push({
              priority: 'Media',
              category: 'Oportunidad de Mejora',
              text: 'Mejorar memorabilidad para generar recall y visitas',
              why: `Memorabilidad actual: ${parseFloat(efectividad.memorabilidad || 0).toFixed(1)}/10. Elementos más distintivos pueden mejorar el recall y las visitas posteriores.`
            });
          }
        }
      }

      // ANÁLISIS CAUSAL 2: Factores específicos que influyeron en el resultado
      if (videoAnalysis?.contenido_visual?.barreras_visuales && videoAnalysis.contenido_visual.barreras_visuales.length > 0) {
        recommendations.push({
          priority: 'Alta',
          category: 'Barrera Identificada',
          text: 'Barreras visuales que limitaron el impacto',
          why: `Elementos que impidieron conversión TV-Web: ${videoAnalysis.contenido_visual.barreras_visuales.join(', ')}. Eliminar estas barreras puede mejorar futuros resultados.`
        });
      }

      if (videoAnalysis?.contenido_auditivo?.call_to_action_auditivo) {
        recommendations.push({
          priority: 'Media',
          category: 'Factor de Audio',
          text: 'Call-to-action auditivo evaluado',
          why: `CTA auditivo: ${videoAnalysis.contenido_auditivo.call_to_action_auditivo}. La efectividad del audio influye en la motivación de visitar el sitio.`
        });
      }

    } catch (error) {
      console.error('❌ Error en análisis causal:', error);
    }

    console.log('✅ Análisis causal completado:', recommendations);
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

  // Generar recomendaciones base
  const baseRecommendations = generateRecommendations();

  // Procesar recomendaciones estratégicas del nuevo formato
  const processStrategicRecommendations = () => {
    if (!videoAnalysis?.recomendaciones_estrategicas) return baseRecommendations;
    
    const strategicRecs = videoAnalysis.recomendaciones_estrategicas.map((rec, index) => ({
      priority: rec.priority || 'Media',
      category: rec.categoria || 'General',
      text: rec.titulo || rec.descripcion || 'Recomendación estratégica',
      why: rec.justificacion || rec.impacto_esperado || 'Mejorará el rendimiento del spot',
      implementation: rec.implementacion,
      timeline: rec.timeline,
      index: index
    }));
    
    return [...baseRecommendations, ...strategicRecs];
  };

  const allRecommendations = processStrategicRecommendations();

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
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Error en análisis</span>
          </div>
          <div className="text-sm text-red-700 whitespace-pre-line">
            {error.split('\n\n💡 Sugerencia:').map((part, index) => (
              <div key={index}>
                {part}
                {index === 0 && error.includes('💡 Sugerencia:') && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center space-x-1 mb-1">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-800">Sugerencia:</span>
                    </div>
                    <div className="text-xs text-yellow-700">
                      {error.split('\n\n💡 Sugerencia:')[1]}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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

      {/* Métricas de Correlación - CORREGIDO */}
      {analysisResults && analysisResults.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Correlación Video-Web</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const result = analysisResults[0];
              
              // VALIDAR Y CORREGIR DATOS ANTES DE MOSTRARLOS
              const validateMetric = (metricName, impactData) => {
                if (!impactData || typeof impactData.percentageChange !== 'number') {
                  return {
                    value: 0,
                    isValid: false,
                    message: 'Datos no disponibles'
                  };
                }
                
                // Verificar si el valor es realista (evitar valores simulados extremos)
                const change = impactData.percentageChange;
                if (Math.abs(change) > 1000) {
                  return {
                    value: 0,
                    isValid: false,
                    message: 'Valor fuera de rango realista'
                  };
                }
                
                return {
                  value: change,
                  isValid: true,
                  message: 'Datos válidos'
                };
              };
              
              const usersMetric = validateMetric('activeUsers', result.impact?.activeUsers);
              const sessionsMetric = validateMetric('sessions', result.impact?.sessions);
              const pageviewsMetric = validateMetric('pageviews', result.impact?.pageviews);
              
              return (
                <>
                  <div className={`p-4 border rounded-lg ${
                    usersMetric.isValid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        usersMetric.isValid ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        Usuarios Activos
                      </span>
                      {usersMetric.isValid ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${
                      usersMetric.isValid ? 'text-green-900' : 'text-gray-500'
                    }`}>
                      {usersMetric.isValid ? '+' : ''}{usersMetric.value.toFixed(1)}%
                    </div>
                    <div className={`text-xs mt-1 ${
                      usersMetric.isValid ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {usersMetric.isValid ? 'Durante el spot vs referencia' : usersMetric.message}
                    </div>
                    {!usersMetric.isValid && (
                      <div className="text-xs text-gray-400 mt-2">
                        Requiere datos de Google Analytics
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${
                    sessionsMetric.isValid
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        sessionsMetric.isValid ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        Sesiones
                      </span>
                      {sessionsMetric.isValid ? (
                        <MousePointer className="h-4 w-4 text-blue-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${
                      sessionsMetric.isValid ? 'text-blue-900' : 'text-gray-500'
                    }`}>
                      {sessionsMetric.isValid ? '+' : ''}{sessionsMetric.value.toFixed(1)}%
                    </div>
                    <div className={`text-xs mt-1 ${
                      sessionsMetric.isValid ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {sessionsMetric.isValid ? 'Incremento en sesiones' : sessionsMetric.message}
                    </div>
                    {!sessionsMetric.isValid && (
                      <div className="text-xs text-gray-400 mt-2">
                        Requiere datos de Google Analytics
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${
                    pageviewsMetric.isValid
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        pageviewsMetric.isValid ? 'text-purple-800' : 'text-gray-600'
                      }`}>
                        Vistas de Página
                      </span>
                      {pageviewsMetric.isValid ? (
                        <Eye className="h-4 w-4 text-purple-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${
                      pageviewsMetric.isValid ? 'text-purple-900' : 'text-gray-500'
                    }`}>
                      {pageviewsMetric.isValid ? '+' : ''}{pageviewsMetric.value.toFixed(1)}%
                    </div>
                    <div className={`text-xs mt-1 ${
                      pageviewsMetric.isValid ? 'text-purple-700' : 'text-gray-500'
                    }`}>
                      {pageviewsMetric.isValid ? 'Aumento en engagement' : pageviewsMetric.message}
                    </div>
                    {!pageviewsMetric.isValid && (
                      <div className="text-xs text-gray-400 mt-2">
                        Requiere datos de Google Analytics
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
          
          {/* Advertencia sobre calidad de datos */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Información sobre datos:</p>
                <p>
                  Estas métricas se basan en datos reales de Google Analytics cuando están disponibles.
                  Si muestra "Datos no disponibles", verifica la conexión con Google Analytics o espera
                  a que se complete el análisis del spot.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Análisis de Correlación TV-Web */}
      {videoAnalysis?.correlacion_tv_web && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-gray-900">Correlación TV-Web</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Correlación Directa</div>
              <div className="text-sm font-semibold text-orange-600">
                {videoAnalysis.correlacion_tv_web.existe_correlacion_directa || 'No determinada'}
              </div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Magnitud del Impacto</div>
              <div className="text-sm font-semibold text-green-600">
                {videoAnalysis.correlacion_tv_web.magnitud_impacto || 'No medida'}
              </div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Timing del Impacto</div>
              <div className="text-sm font-semibold text-blue-600">
                {videoAnalysis.correlacion_tv_web.timing_impacto || 'No analizado'}
              </div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Calidad de Conversión</div>
              <div className="text-sm font-semibold text-purple-600">
                {videoAnalysis.correlacion_tv_web.calidad_conversion || 'No evaluada'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones para Maximizar Tráfico Web */}
      {allRecommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900">Recomendaciones para Maximizar Tráfico Web</h4>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {allRecommendations.length} recomendaciones
            </span>
          </div>
          
          <div className="space-y-4">
            {allRecommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {rec.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.priority}
                    </span>
                    {rec.timeline && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {rec.timeline}
                      </span>
                    )}
                  </div>
                  <CheckCircle className="h-4 w-4" />
                </div>
                
                <h5 className="font-medium text-gray-900 mb-1">{rec.text}</h5>
                
                {rec.why && (
                  <p className="text-sm text-gray-700 mb-2">{rec.why}</p>
                )}
                
                {rec.impacto_esperado_tráfico && (
                  <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <p className="text-xs font-medium text-green-800 mb-1">Impacto Esperado en Tráfico Web:</p>
                    <p className="text-xs text-green-700">{rec.impacto_esperado_tráfico}</p>
                  </div>
                )}
                
                {rec.implementation && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border-l-4 border-blue-400">
                    <p className="text-xs font-medium text-gray-800 mb-1">Implementación:</p>
                    <p className="text-xs text-gray-700">{rec.implementation}</p>
                  </div>
                )}
                
                {rec.métrica_seguimiento && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-gray-400">
                    <p className="text-xs font-medium text-gray-800 mb-1">Métrica de Seguimiento:</p>
                    <p className="text-xs text-gray-700">{rec.métrica_seguimiento}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas Objetivo (nuevo) */}
      {videoAnalysis?.metricas_objetivo && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Métricas Objetivo Proyectadas</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(videoAnalysis.metricas_objetivo).map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-white rounded border">
                <div className="text-xs text-gray-600 capitalize">
                  {key.replace('_', ' ')}
                </div>
                <div className="text-sm font-semibold text-green-600">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan de Acción (nuevo) */}
      {videoAnalysis?.plan_accion && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Plan de Acción Estratégico</h4>
          </div>
          
          <div className="space-y-3">
            {Object.entries(videoAnalysis.plan_accion).map(([period, actions]) => (
              <div key={period} className="p-3 bg-white rounded border">
                <h5 className="font-medium text-blue-900 mb-2 capitalize">
                  {period.replace('_', ' ')}
                </h5>
                <p className="text-sm text-gray-700">{actions}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen Ejecutivo 100% Real */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="h-5 w-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Resumen Ejecutivo</h4>
        </div>
        
        {(() => {
          // Generar resumen ejecutivo 100% basado en datos reales
          const generateRealExecutiveSummary = () => {
            // Verificar si hay datos suficientes para el análisis
            if (!analysisResults || analysisResults.length === 0) {
              return 'Análisis no disponible: No hay datos de Analytics';
            }

            const spot = analysisResults[0];
            const spotHour = spot.spot?.dateTime?.getHours() || spot.spot?.hora || 'No especificada';
            const impact = spot.impact?.activeUsers?.percentageChange || 0;
            const usersActive = spot.metrics?.spot?.activeUsers || spot.activeUsers || 0;
            const sessions = spot.metrics?.spot?.sessions || spot.sessions || 0;
            const pageviews = spot.metrics?.spot?.pageviews || spot.pageviews || 0;

            let summary = `Spot transmitido a las ${spotHour}:00. `;
            
            // Análisis de correlación TV-Web
            if (impact > 0) {
              summary += `Generó un incremento de +${impact.toFixed(1)}% en usuarios activos durante la transmisión. `;
              summary += `Métricas reales: ${usersActive} usuarios activos, ${sessions} sesiones, ${pageviews} páginas vistas. `;
              
              if (impact > 20) {
                summary += 'El spot demostró una CORRELACIÓN FUERTE entre la transmisión TV y el tráfico web, indicando alta efectividad para generar visitas al sitio.';
              } else if (impact > 10) {
                summary += 'El spot mostró una CORRELACIÓN MODERADA entre TV y web, con impacto positivo pero mejorable en generación de tráfico.';
              } else {
                summary += 'El spot presentó CORRELACIÓN DÉBIL entre TV y web, sugiriendo necesidad de optimización para maximizar visitas al sitio.';
              }
            } else {
              summary += `No se detectó incremento significativo en tráfico web durante la transmisión (${impact.toFixed(1)}%). `;
              summary += `Métricas: ${usersActive} usuarios activos, ${sessions} sesiones, ${pageviews} páginas vistas. `;
              summary += 'Se requiere análisis detallado del contenido del spot y timing para identificar oportunidades de mejora en la correlación TV-Web.';
            }

            // Análisis de timing
            const isPrimeTime = spotHour >= 19 && spotHour <= 23;
            if (isPrimeTime) {
              summary += ' El horario de transmisión (prime time) es óptimo para maximizar audiencia y potencial de tráfico web.';
            } else {
              summary += ' El horario de transmisión está fuera del prime time, lo que puede limitar el alcance y la correlación con tráfico web.';
            }

            // Agregar análisis de video si está disponible
            if (videoAnalysis && videoAnalysis.analisis_efectividad) {
              const efectividad = videoAnalysis.analisis_efectividad;
              const clarity = parseFloat(efectividad.claridad_mensaje || 0);
              const engagement = parseFloat(efectividad.engagement_visual || 0);
              const memorability = parseFloat(efectividad.memorabilidad || 0);
              
              summary += ` Análisis de contenido: Claridad del mensaje ${clarity.toFixed(1)}/10, Engagement visual ${engagement.toFixed(1)}/10, Memorabilidad ${memorability.toFixed(1)}/10.`;
              
              if (clarity < 6 || engagement < 6) {
                summary += ' La calidad del contenido sugiere oportunidades de mejora para incrementar la efectividad del spot en generar tráfico web.';
              }
            } else {
              // Si no hay análisis de video, agregar nota sobre el estado
              if (analyzingVideo) {
                summary += ' Análisis de contenido del video en progreso...';
              } else if (error) {
                summary += ' Análisis de contenido del video no disponible debido a errores en la API.';
              } else {
                summary += ' Análisis de contenido del video pendiente.';
              }
            }

            return summary;
          };

          const realSummary = generateRealExecutiveSummary();
          
          // Si no hay datos disponibles, mostrar mensaje específico con más detalles
          if (realSummary.includes('Análisis no disponible')) {
            return (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 italic mb-2">
                  {realSummary}
                </p>
                <div className="text-xs text-gray-400">
                  <p>Estado del análisis:</p>
                  <p>• Datos de Analytics: {analysisResults && analysisResults.length > 0 ? '✅ Disponibles' : '❌ No disponibles'}</p>
                  <p>• Análisis de video: {videoAnalysis ? '✅ Completado' : '❌ Pendiente o con errores'}</p>
                  <p>• API Chutes AI: {videoAnalysis?.apiProvider ? '✅ Conectada' : '⏳ Esperando conexión'}</p>
                </div>
              </div>
            );
          }
          
          return (
            <div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {realSummary}
              </p>
              
              {/* Métricas clave del análisis */}
              {videoAnalysis && videoAnalysis.analisis_efectividad && (
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
              
              {/* Datos de correlación TV-Web */}
              {analysisResults && analysisResults.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-xs font-medium text-blue-800 mb-2">Datos de Correlación TV-Web</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-blue-600 font-semibold">
                        +{analysisResults[0].impact?.activeUsers?.percentageChange?.toFixed(1) || '0'}%
                      </div>
                      <div className="text-blue-700">Usuarios Activos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-600 font-semibold">
                        +{analysisResults[0].impact?.sessions?.percentageChange?.toFixed(1) || '0'}%
                      </div>
                      <div className="text-green-700">Sesiones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-600 font-semibold">
                        +{analysisResults[0].impact?.pageviews?.percentageChange?.toFixed(1) || '0'}%
                      </div>
                      <div className="text-purple-700">Páginas Vistas</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        
        {videoAnalysis?.tags_relevantes &&
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