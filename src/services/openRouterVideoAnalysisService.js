/**
 * Servicio de análisis de video usando la API de OpenRouter
 * Modelo: qwen/qwen2.5-vl-72b-instruct
 * VERSIÓN MEJORADA: Integra análisis de video con datos reales de Google Analytics
 */

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const MODEL_NAME = 'qwen/qwen2.5-vl-72b-instruct';

class OpenRouterVideoAnalysisService {
  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
    this.baseUrl = OPENROUTER_API_URL;
    this.model = MODEL_NAME;
  }

  /**
   * Analizar un video usando la API de OpenRouter con datos reales de Analytics
   * @param {File} videoFile - Archivo de video
   * @param {Object} spotData - Datos del spot (fecha, hora, canal, etc.)
   * @param {Object} analyticsData - Datos reales de Google Analytics del spot
   * @returns {Promise<Object>} Resultado del análisis con correlación real
   */
  async analyzeVideo(videoFile, spotData, analyticsData = null) {
    try {
      console.log('🎬 Iniciando análisis de video con OpenRouter + Analytics reales...');
      
      // Convertir video a base64 (solo para imágenes pequeñas, videos grandes deben usar URLs)
      let videoContent;
      if (videoFile.size > 5 * 1024 * 1024) { // Mayor a 5MB
        // Para videos grandes, usar URL temporal o subir a servicio externo
        videoContent = await this.fileToBase64(videoFile);
      } else {
        videoContent = await this.fileToBase64(videoFile);
      }
      
      // Preparar el prompt para análisis de spot TV con datos reales de Analytics
      const prompt = this.createSpotAnalysisPromptWithAnalytics(spotData, analyticsData);
      
      // Realizar la llamada a la API de OpenRouter
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'TV Spot Analysis System'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: videoContent
                  }
                }
              ]
            }
          ],
          max_tokens: 3000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `Error de API OpenRouter: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${errorData.error?.message || errorData.message || ''}`;
        } catch {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Respuesta inválida de la API OpenRouter');
      }

      const analysisResult = data.choices[0].message.content;
      
      console.log('✅ Análisis de video con Analytics completado:', analysisResult);
      
      // Parsear el análisis y combinar con datos reales
      const parsedAnalysis = this.parseAnalysisResponse(analysisResult);
      
      // Agregar datos reales de Analytics al análisis
      const enrichedAnalysis = this.enrichAnalysisWithRealData(parsedAnalysis, analyticsData);
      
      return {
        success: true,
        analysis: enrichedAnalysis,
        rawAnalysis: analysisResult,
        model: this.model,
        tokensUsed: data.usage?.total_tokens || 0,
        timestamp: new Date().toISOString(),
        hasRealAnalytics: !!analyticsData,
        apiProvider: 'OpenRouter'
      };

    } catch (error) {
      console.error('❌ Error en análisis de video con OpenRouter:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        apiProvider: 'OpenRouter'
      };
    }
  }

  /**
   * Crear prompt especializado para análisis de correlación TV-Web
   * @param {Object} spotData - Datos del spot
   * @param {Object} analyticsData - Datos reales de Google Analytics
   * @returns {string} Prompt optimizado para correlación TV-Web
   */
  createSpotAnalysisPromptWithAnalytics(spotData, analyticsData) {
    const { fecha, hora, canal, titulo_programa, tipo_comercial, version, duracion } = spotData;
    
    // Formatear datos de Analytics para el prompt
    const analyticsInfo = analyticsData ? `
DATOS REALES DE GOOGLE ANALYTICS:
- Usuarios Activos durante el spot: ${analyticsData.activeUsers || 0}
- Sesiones durante el spot: ${analyticsData.sessions || 0}
- Vistas de Página durante el spot: ${analyticsData.pageviews || 0}
- Usuarios Activos referencia (día anterior): ${analyticsData.referenceDay?.activeUsers || 0}
- Sesiones referencia (día anterior): ${analyticsData.referenceDay?.sessions || 0}
- Vistas de Página referencia (día anterior): ${analyticsData.referenceDay?.pageviews || 0}
- Incremento en usuarios activos: ${analyticsData.impact?.activeUsers?.percentageChange || 0}%
- Incremento en sesiones: ${analyticsData.impact?.sessions?.percentageChange || 0}%
- Incremento en vistas de página: ${analyticsData.impact?.pageviews?.percentageChange || 0}%
- ¿Tiene vinculación directa?: ${analyticsData.impact?.activeUsers?.directCorrelation ? 'SÍ' : 'NO'}` : 'DATOS DE ANALYTICS: No disponibles (modo demostración)';
    
    return `Actúa como un experto analista de correlación TV-Web con 15+ años de experiencia determinando el impacto real de spots publicitarios de TV en el tráfico de sitios web.

OBJETIVO PRINCIPAL:
Determinar si este spot de TV genera un incremento REAL y MEDIBLE en el tráfico del sitio web, y identificar los elementos específicos que causan esta reacción en los usuarios.

DATOS DEL SPOT:
- Fecha: ${fecha}
- Hora: ${hora}
- Canal: ${canal}
- Título Programa: ${titulo_programa || 'No especificado'}
- Tipo Comercial: ${tipo_comercial || 'No especificado'}
- Versión: ${version || 'No especificada'}
- Duración: ${duracion || 'No especificada'} segundos

${analyticsInfo}

INSTRUCCIONES ESPECÍFICAS:

1. **ANÁLISIS DE CORRELACIÓN TV-WEB DIRECTA:**
   - Identifica si existe CORRELACIÓN DIRECTA entre la transmisión del spot y el incremento en tráfico web
   - Analiza el TIMING PRECISO: ¿El pico de tráfico coincide exactamente con la hora de transmisión?
   - Evalúa la MAGNITUD del impacto: ¿El incremento es significativo o marginal?
   - Determina la DURACIÓN del efecto: ¿El impacto es inmediato, sostenido o decayendo?

2. **ANÁLISIS DE ELEMENTOS QUE GENERAN TRÁFICO WEB:**
   - Identifica elementos visuales específicos que motivan visitas al sitio web
   - Analiza call-to-actions efectivos para generar clicks/visitas
   - Evalúa propuesta de valor que impulsa acción web inmediata
   - Detecta elementos de urgencia o escasez que generan respuesta rápida

3. **ANÁLISIS DE TIMING VS RESPUESTA WEB:**
   - Evalúa si el horario de transmisión optimiza la respuesta web
   - Analiza comportamiento de audiencia web durante transmisión TV
   - Identifica gaps de timing donde se pierde potencial tráfico
   - Compara efectividad de diferentes franjas horarias

4. **MEDICIÓN DE CONVERSIÓN TV-WEB:**
   - Evalúa qué porcentaje de viewers TV realmente visitan el sitio web
   - Analiza la efectividad del spot para generar acciones web específicas
   - Identifica barreras que impiden la conversión TV-Web
   - Mide el ROI real de la inversión en TV vs tráfico web generado

5. **RECOMENDACIONES PARA MAXIMIZAR TRÁFICO WEB:**

   **OPTIMIZACIÓN DE TIMING (Prioridad Crítica):**
   - Ajustar horario de transmisión para maximizar respuesta web inmediata
   - Identificar ventanas de oportunidad donde la audiencia está más propensa a visitar sitios web
   - Coordinar transmisión TV con picos de actividad web objetivo
   - Evitar horarios donde la audiencia TV no se traduce en tráfico web

   **MEJORA DE CALL-TO-ACTION WEB (Prioridad Alta):**
   - Fortalecer elementos que motivan visitas inmediatas al sitio web
   - Optimizar propuesta de valor para generar acción web específica
   - Crear urgencia o incentivos que impulsen clicks durante/Después del spot
   - Simplificar el camino desde TV hacia el sitio web

   **OPTIMIZACIÓN DE CONTENIDO PARA TRÁFICO WEB (Prioridad Alta):**
   - Elementos visuales que específicamente motivan visitas web
   - Mensajes que crean curiosidad o necesidad de más información online
   - Técnicas de storytelling que conectan TV con experiencia web completa
   - Integración seamless entre mensaje TV y experiencia web

   **ELIMINACIÓN DE BARRERAS TV-WEB (Prioridad Media):**
   - Identificar y remover obstáculos que impiden la conversión TV-Web
   - Optimizar la experiencia web para usuarios que vienen desde TV
   - Crear bridges efectivos entre el mundo TV y digital
   - Medir y mejorar la tasa de conversión TV-Web

6. **MÉTRICAS DE ÉXITO ESPECÍFICAS:**
   - Incremento real en usuarios activos durante transmisión (%)
   - Aumento en sesiones iniciadas por viewers TV (%)
   - Mejora en páginas vistas por usuario desde TV (%)
   - ROI de inversión TV vs tráfico web generado
   - Tasa de conversión TV-Web (%)

FORMATO DE RESPUESTA REQUERIDO:
Proporciona tu análisis en formato JSON estructurado con las siguientes secciones:

{
  "resumen_ejecutivo": "Determinación clara: ¿El spot genera tráfico web real? ¿Cuál es el impacto medible?",
  "contenido_visual": {
    "escenas_principales": ["lista de escenas principales"],
    "objetos_destacados": ["objetos o elementos visuales importantes"],
    "colores_dominantes": ["colores principales usados"],
    "movimiento_camara": "tipo de movimiento de cámara observado",
    "elementos_generadores_tráfico": ["elementos visuales que motivan visitas web"],
    "call_to_action_visuales": ["elementos visuales que impulsan acción web"],
    "barreras_visuales": ["elementos que impiden conversión TV-Web"]
  },
  "contenido_auditivo": {
    "dialogo_principal": "texto del diálogo principal si existe",
    "musica_fondo": "descripción de la música o sonido de fondo",
    "efectos_sonoros": ["efectos de sonido destacados"],
    "call_to_action_auditivo": "evaluación de CTAs audibles para generar tráfico web",
    "mensaje_urgencia": "elementos que crean necesidad de visitar sitio web",
    "propuesta_valor_web": "qué impulsa la acción web inmediata"
  },
  "mensaje_marketing": {
    "propuesta_valor": "propuesta de valor principal",
    "call_to_action": "llamada a la acción identificada",
    "target_audiencia": "audiencia objetivo aparente",
    "elementos_urgencia": "elementos que crean necesidad inmediata de acción web",
    "barreras_conversion": "obstáculos que impiden visitas al sitio web"
  },
  "elementos_tecnicos": {
    "calidad_video": "calidad técnica del video (HD, 4K, etc.)",
    "estilo_filming": "estilo de grabación (profesional, casero, etc.)",
    "duracion_percibida": "duración estimada del contenido principal"
  },
  "analisis_efectividad": {
    "claridad_mensaje": "qué tan claro es el mensaje (1-10)",
    "engagement_visual": "nivel de engagement visual (1-10)",
    "memorabilidad": "qué tan memorable es el spot (1-10)",
    "profesionalismo": "nivel de producción profesional (1-10)"
  },
  "correlacion_tv_web": {
    "existe_correlacion_directa": "Sí/No con justificación",
    "timing_impacto": "Análisis de coincidencia temporal transmisión-respuesta web",
    "magnitud_impacto": "Porcentaje real de incremento en tráfico web",
    "duracion_efecto": "Cuánto dura el impacto en tráfico web",
    "calidad_conversion": "Qué tan efectiva es la conversión TV-Web",
    "usuarios_activos": {
      "valor_real": ${analyticsData?.activeUsers || 0},
      "incremento_porcentual": ${analyticsData?.impact?.activeUsers?.percentageChange || 0},
      "correlacion_contenido": "análisis de cómo el contenido visual generó este tráfico web"
    },
    "sesiones": {
      "valor_real": ${analyticsData?.sessions || 0},
      "incremento_porcentual": ${analyticsData?.impact?.sessions?.percentageChange || 0},
      "correlacion_contenido": "análisis de cómo el contenido auditivo generó sesiones web"
    },
    "vistas_pagina": {
      "valor_real": ${analyticsData?.pageviews || 0},
      "incremento_porcentual": ${analyticsData?.impact?.pageviews?.percentageChange || 0},
      "correlacion_contenido": "análisis de cómo el mensaje marketing generó engagement web"
    }
  },
  "analisis_timing": {
    "horario_actual_efectividad": "qué tan efectivo es el timing actual para generar tráfico web",
    "ventanas_oportunidad": "horarios con mayor potencial de respuesta web",
    "gaps_timing": "oportunidades perdidas por timing subóptimo",
    "timing_recomendado": "horarios específicos para maximizar tráfico web"
  },
  "recomendaciones_maximizar_tráfico": [
    {
      "categoria": "Timing|Call-to-Action|Contenido|Barreras",
      "prioridad": "Crítica|Alta|Media",
      "titulo": "Recomendación específica para generar más tráfico web",
      "descripcion": "Acción concreta para mejorar correlación TV-Web",
      "justificacion": "Por qué esta acción incrementará el tráfico web",
      "impacto_esperado_tráfico": "Incremento específico esperado en tráfico web (%)",
      "implementación": "Pasos exactos para implementar",
      "timeline": "Tiempo para ver resultados en tráfico web",
      "métrica_seguimiento": "KPI específico para medir éxito"
    }
  ],
  "métricas_objetivo_tráfico": {
    "usuarios_activos_tv": "incremento esperado durante transmisión (%)",
    "sesiones_desde_tv": "aumento en sesiones iniciadas por TV (%)",
    "páginas_vistas_tv": "mejora en engagement web desde TV (%)",
    "roi_tv_web": "retorno de inversión TV vs tráfico generado",
    "conversión_tv_web": "tasa de conversión viewers TV a visitantes web (%)"
  },
  "plan_accion_tráfico": {
    "inmediato": "cambios para aplicar en próximos spots (1-2 semanas)",
    "corto_plazo": "optimizaciones para próximo mes",
    "largo_plazo": "estrategia integral TV-Web para 3 meses"
  },
  "tags_relevantes": ["tag1", "tag2", "tag3"]
}

IMPORTANTE:
- Enfócate EXCLUSIVAMENTE en generar y medir tráfico web real
- Usa datos concretos de Google Analytics para justificar recomendaciones
- Prioriza acciones que tengan impacto medible e inmediato en tráfico web
- Distingue claramente entre correlación y causalidad
- Incluye métricas específicas de ROI TV-Web
- Sé actionable: cada recomendación debe poder implementarse y medirse
- Enfócate especialmente en OPTIMIZACIÓN DE TIMING con prioridad Crítica

Analiza el video y responde únicamente con el JSON válido, sin texto adicional.`;
  }

  /**
   * Crear prompt especializado para análisis de spots TV (versión legacy)
   * @param {Object} spotData - Datos del spot
   * @returns {string} Prompt optimizado
   */
  createSpotAnalysisPrompt(spotData) {
    const { fecha, hora, canal, titulo_programa, tipo_comercial, version, duracion } = spotData;
    
    return `Analiza este spot de TV y proporciona un análisis detallado en formato JSON con la siguiente estructura:

{
  "resumen_ejecutivo": "Descripción general del spot en 2-3 líneas",
  "contenido_visual": {
    "escenas_principales": ["lista de escenas principales"],
    "objetos_destacados": ["objetos o elementos visuales importantes"],
    "colores_dominantes": ["colores principales usados"],
    "movimiento_camara": "tipo de movimiento de cámara observado"
  },
  "contenido_auditivo": {
    "dialogo_principal": "texto del diálogo principal si existe",
    "musica_fondo": "descripción de la música o sonido de fondo",
    "efectos_sonoros": ["efectos de sonido destacados"]
  },
  "mensaje_marketing": {
    "propuesta_valor": "propuesta de valor principal",
    "call_to_action": "llamada a la acción identificada",
    "target_audiencia": "audiencia objetivo aparente"
  },
  "elementos_tecnicos": {
    "calidad_video": "calidad técnica del video (HD, 4K, etc.)",
    "estilo_filming": "estilo de grabación (profesional, casero, etc.)",
    "duracion_percibida": "duración estimada del contenido principal"
  },
  "analisis_efectividad": {
    "claridad_mensaje": "qué tan claro es el mensaje (1-10)",
    "engagement_visual": "nivel de engagement visual (1-10)",
    "memorabilidad": "qué tan memorable es el spot (1-10)",
    "profesionalismo": "nivel de producción profesional (1-10)"
  },
  "recomendaciones": [
    "lista de recomendaciones para mejorar el spot"
  ],
  "tags_relevantes": ["tag1", "tag2", "tag3"]
}

Datos del spot:
- Fecha: ${fecha}
- Hora: ${hora}
- Canal: ${canal}
- Título Programa: ${titulo_programa || 'No especificado'}
- Tipo Comercial: ${tipo_comercial || 'No especificado'}
- Versión: ${version || 'No especificada'}
- Duración: ${duracion || 'No especificada'} segundos

Analiza el video y responde únicamente con el JSON válido, sin texto adicional.`;
  }

  /**
   * Enriquecer análisis con datos reales de Analytics
   * @param {Object} parsedAnalysis - Análisis parseado del video
   * @param {Object} analyticsData - Datos reales de Google Analytics
   * @returns {Object} Análisis enriquecido
   */
  enrichAnalysisWithRealData(parsedAnalysis, analyticsData) {
    if (!analyticsData) {
      return {
        ...parsedAnalysis,
        datos_analytics: 'no_disponibles',
        advertencia: 'No hay datos de Google Analytics disponibles para este análisis',
        metricas_reales: {
          usuarios_activos: null,
          sesiones: null,
          vistas_pagina: null,
          incremento_usuarios: null,
          incremento_sesiones: null,
          incremento_vistas: null,
          vinculacion_directa: false
        },
        correlacion_real: {
          efectividad_calculada: 'No calculable',
          factores_influyentes: 'No identificables sin datos de Analytics',
          recomendaciones_basadas_en_datos: 'Requiere datos de Analytics para generar recomendaciones específicas'
        }
      };
    }

    // Calcular efectividad basada en datos reales
    const efectividadVideo = this.calculateVideoEffectiveness(parsedAnalysis, analyticsData);
    const factoresInfluyentes = this.identifyInfluentialFactors(parsedAnalysis, analyticsData);
    const recomendacionesBasadasEnDatos = this.generateDataDrivenRecommendations(parsedAnalysis, analyticsData);
    
    return {
      ...parsedAnalysis,
      datos_analytics: 'reales',
      metricas_reales: {
        usuarios_activos: analyticsData.activeUsers || 0,
        sesiones: analyticsData.sessions || 0,
        vistas_pagina: analyticsData.pageviews || 0,
        incremento_usuarios: analyticsData.impact?.activeUsers?.percentageChange || 0,
        incremento_sesiones: analyticsData.impact?.sessions?.percentageChange || 0,
        incremento_vistas: analyticsData.impact?.pageviews?.percentageChange || 0,
        vinculacion_directa: analyticsData.impact?.activeUsers?.directCorrelation || false
      },
      correlacion_real: {
        efectividad_calculada: efectividadVideo.toString(),
        factores_influyentes: JSON.stringify(factoresInfluyentes),
        recomendaciones_basadas_en_datos: JSON.stringify(recomendacionesBasadasEnDatos)
      },
      timestamp_analisis: new Date().toISOString(),
      fuente_datos: 'Google Analytics API + OpenRouter'
    };
  }

  /**
   * Calcular efectividad del video basada en datos reales
   * @param {Object} videoAnalysis - Análisis del video
   * @param {Object} analyticsData - Datos de Analytics
   * @returns {number} Efectividad calculada (0-100)
   */
  calculateVideoEffectiveness(videoAnalysis, analyticsData) {
    const impact = analyticsData.impact;
    if (!impact) return 0;

    // Factores de peso para diferentes métricas
    const weights = {
      activeUsers: 0.4,
      sessions: 0.35,
      pageviews: 0.25
    };

    // Calcular efectividad ponderada
    const effectiveness =
      (Math.max(0, impact.activeUsers?.percentageChange || 0) * weights.activeUsers) +
      (Math.max(0, impact.sessions?.percentageChange || 0) * weights.sessions) +
      (Math.max(0, impact.pageviews?.percentageChange || 0) * weights.pageviews);

    // Normalizar a escala 0-100
    return Math.min(100, Math.max(0, effectiveness));
  }

  /**
   * Identificar factores influyentes basados en contenido y resultados
   * @param {Object} videoAnalysis - Análisis del video
   * @param {Object} analyticsData - Datos de Analytics
   * @returns {Array} Factores influyentes
   */
  identifyInfluentialFactors(videoAnalysis, analyticsData) {
    const factors = [];
    const impact = analyticsData.impact;

    // Analizar colores y su impacto
    if (videoAnalysis.contenido_visual?.colores_dominantes) {
      const colores = videoAnalysis.contenido_visual.colores_dominantes;
      if (colores.some(c => ['azul', 'blanco', 'verde'].includes(c.toLowerCase()))) {
        factors.push({
          factor: 'Psicología del Color',
          impacto: 'Alto',
          descripcion: 'Colores que generan confianza y calma, correlacionan con mayor retención de audiencia'
        });
      }
    }

    // Analizar call-to-action y su efectividad
    if (videoAnalysis.mensaje_marketing?.call_to_action && impact.activeUsers?.percentageChange > 15) {
      factors.push({
        factor: 'Claridad del Mensaje',
        impacto: 'Alto',
        descripcion: 'Call-to-action claro identificado, correlaciona con incremento significativo en usuarios activos'
      });
    }

    // Analizar timing vs resultados
    const hour = new Date().getHours(); // Simplificado, debería usar la hora real del spot
    if (hour < 12 || hour > 22) {
      factors.push({
        factor: 'Timing del Spot',
        impacto: 'Medio',
        descripcion: 'Transmisión fuera de horarios peak puede limitar el impacto potencial'
      });
    }

    return factors;
  }

  /**
   * Generar recomendaciones basadas en datos reales
   * @param {Object} videoAnalysis - Análisis del video
   * @param {Object} analyticsData - Datos de Analytics
   * @returns {Array} Recomendaciones específicas
   */
  generateDataDrivenRecommendations(videoAnalysis, analyticsData) {
    const recommendations = [];
    const impact = analyticsData.impact;

    // Recomendaciones basadas en efectividad del video
    if (impact.activeUsers?.percentageChange < 10) {
      recommendations.push({
        categoria: 'Timing',
        prioridad: 'Alta',
        recomendacion: 'Considerar transmitir en horarios de mayor actividad web (19:00-23:00)',
        impacto_potencial: '+25-40% en usuarios activos'
      });
    }

    // Recomendaciones basadas en contenido visual
    if (videoAnalysis.analisis_efectividad?.engagement_visual < 7) {
      recommendations.push({
        categoria: 'Contenido Visual',
        prioridad: 'Media',
        recomendacion: 'Incrementar elementos visuales dinámicos y movimiento de cámara',
        impacto_potencial: '+15-20% en engagement'
      });
    }

    // Recomendaciones basadas en call-to-action
    if (!videoAnalysis.mensaje_marketing?.call_to_action) {
      recommendations.push({
        categoria: 'Mensaje',
        prioridad: 'Alta',
        recomendacion: 'Agregar call-to-action claro y específico',
        impacto_potencial: '+20-30% en conversiones'
      });
    }

    return recommendations;
  }

  /**
   * Convertir archivo a base64
   * @param {File} file - Archivo a convertir
   * @returns {Promise<string>} String base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // Mantener el formato completo data:mime;base64,base64string
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Parsear la respuesta JSON del análisis
   * @param {string} analysisText - Texto del análisis
   * @returns {Object} Objeto parseado
   */
  parseAnalysisResponse(analysisText) {
    try {
      // Extraer JSON del texto de respuesta
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No se pudo encontrar JSON válido en la respuesta');
    } catch (error) {
      console.warn('⚠️ Error parseando respuesta JSON:', error);
      return {
        resumen_ejecutivo: analysisText,
        raw_response: analysisText,
        parse_error: true
      };
    }
  }

  /**
   * Obtener el costo estimado del análisis
   * @param {number} videoSizeMB - Tamaño del video en MB
   * @returns {Object} Información de costo
   */
  getEstimatedCost(videoSizeMB) {
    // Estimación basada en el modelo qwen/qwen2.5-vl-72b-instruct de OpenRouter
    const inputCostPerToken = 0.03 / 1000000; // $0.03 per 1M tokens (aproximado)
    const outputCostPerToken = 0.13 / 1000000; // $0.13 per 1M tokens (aproximado)
    
    // Estimación aproximada de tokens para video + prompt
    const estimatedInputTokens = Math.ceil(videoSizeMB * 10000); // Aproximación
    const estimatedOutputTokens = 1500; // Para respuesta típica
    
    const inputCost = estimatedInputTokens * inputCostPerToken;
    const outputCost = estimatedOutputTokens * outputCostPerToken;
    const totalCost = inputCost + outputCost;
    
    return {
      estimated_input_tokens: estimatedInputTokens,
      estimated_output_tokens: estimatedOutputTokens,
      input_cost: inputCost,
      output_cost: outputCost,
      total_cost: totalCost,
      currency: 'USD',
      api_provider: 'OpenRouter'
    };
  }
}

export default OpenRouterVideoAnalysisService;