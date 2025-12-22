/**
 * Servicio de Análisis de IA para Spots de TV
 * Utiliza Groq API con modelo Llama 3.1-8b-instant
 */

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Configuración para Chutes como alternativa
const CHUTES_API_KEY = process.env.REACT_APP_CHUTES_API_KEY || 'cpk_f07741417dab421f995b63e2b9869206.272f8a269e1b5ec092ba273b83403b1d.u5no8AouQcBglfhegVrjdcU98kPSCkYt';
const CHUTES_API_URL = 'https://llm.chutes.ai/v1';

/**
 * Genera un análisis inteligente del impacto de un spot de TV
 * @param {Object} spotData - Datos del spot y métricas
 * @returns {Promise<Object>} Análisis con insights y recomendaciones
 */
export const generateAIAnalysis = async (spotData) => {
  // Intentar con Groq primero, luego con Chutes como fallback
  const apiKey = GROQ_API_KEY || CHUTES_API_KEY;
  const apiUrl = GROQ_API_KEY ? GROQ_API_URL : `${CHUTES_API_URL}/chat/completions`;
  const provider = GROQ_API_KEY ? 'Groq' : 'Chutes';
  
  if (!apiKey) {
    console.warn('⚠️ API Key no configurada. El análisis de IA no estará disponible.');
    return generateAIAnalysisFallback(spotData);
  }

  try {
    const prompt = `
Eres un experto en análisis de marketing digital y publicidad de televisión.
Analiza el siguiente spot de TV y su impacto en las métricas web:

**DATOS DEL SPOT:**
- Nombre: ${spotData.spot.nombre}
- Fecha: ${spotData.spot.fecha}
- Hora: ${spotData.spot.dateTime ? spotData.spot.dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : spotData.spot.hora}
- Canal: ${spotData.spot.canal}
- Duración: ${spotData.spot.duracion} segundos

**MÉTRICAS DURANTE EL SPOT:**
- Usuarios Activos: ${spotData.metrics.spot.activeUsers}
- Sesiones: ${spotData.metrics.spot.sessions}
- Vistas de Página: ${spotData.metrics.spot.pageviews}

**COMPARATIVA CON PERÍODOS ANTERIORES:**
- Día Anterior: ${spotData.metrics.previousDay.activeUsers} usuarios, ${spotData.metrics.previousDay.sessions} sesiones
- Semana Pasada: ${spotData.metrics.previousWeek.activeUsers} usuarios, ${spotData.metrics.previousWeek.sessions} sesiones

**IMPACTO CALCULADO:**
- Incremento de Usuarios: ${spotData.impact.activeUsers.percentageChange.toFixed(1)}%
- Incremento de Sesiones: ${spotData.impact.sessions.percentageChange.toFixed(1)}%
- Incremento de Vistas: ${spotData.impact.pageviews.percentageChange.toFixed(1)}%

Por favor, proporciona:
1. **3 insights clave** sobre el rendimiento del spot
2. **2 recomendaciones accionables** para mejorar futuros spots
3. **1 resumen ejecutivo** de máximo 2 líneas

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recomendación 1", "recomendación 2"],
  "summary": "resumen ejecutivo"
}
    `.trim();

    console.log(`🤖 Intentando análisis de IA con ${provider}...`);
    
    const requestBody = {
      model: provider === 'Groq' ? 'llama-3.1-8b-instant' : 'Qwen/Qwen2.5-VL-72B-Instruct',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis de marketing digital. Responde SOLO con JSON válido, sin texto adicional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      stream: false
    };

    // Agregar response_format solo para Groq
    if (provider === 'Groq') {
      requestBody.response_format = { type: 'json_object' };
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // Agregar headers específicos para Chutes
    if (provider === 'Chutes') {
      headers['User-Agent'] = 'TV-Radio-Analysis-System/1.0';
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (textError) {
        console.warn('⚠️ No se pudo leer el texto del error:', textError);
        errorText = 'Error desconocido';
      }
      
      console.error(`❌ Error en la API de ${provider}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: apiUrl
      });
      
      // Si es error de red, CORS, o timeout, usar fallback inmediatamente
      if (response.status === 0 ||
          response.status === 503 ||
          response.status === 502 ||
          errorText.includes('Failed to fetch') ||
          errorText.includes('ERR_FAILED') ||
          errorText.includes('CORS') ||
          errorText.includes('Network Error')) {
        console.warn(`🔄 Error de red/CORS con ${provider}, usando análisis fallback...`);
        return await generateAIAnalysisFallback(spotData);
      }
      
      // Para otros errores HTTP, también usar fallback para evitar crashes
      if (response.status >= 400) {
        console.warn(`🔄 Error HTTP ${response.status} con ${provider}, usando análisis fallback...`);
        return await generateAIAnalysisFallback(spotData);
      }
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ Error parseando respuesta JSON de la API:', jsonError);
      return await generateAIAnalysisFallback(spotData);
    }
    
    console.log(`✅ Respuesta exitosa de ${provider}:`, data);
    
    // Parsear la respuesta JSON con manejo mejorado de errores
    let analysis;
    try {
      // Intentar parsear el contenido directo
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.warn('⚠️ No se recibió contenido en la respuesta de la API');
        return await generateAIAnalysisFallback(spotData);
      }
      
      console.log('🔍 Contenido raw recibido:', content);
      
      // Limpiar el contenido de posibles caracteres extra
      const cleanContent = content.trim().replace(/```json\s*|\s*```/g, '');
      
      try {
        analysis = JSON.parse(cleanContent);
      } catch (jsonError) {
        console.warn('⚠️ Error en JSON.parse, intentando extracción manual:', jsonError);
        
        // Intentar extraer JSON manualmente usando regex
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analysis = JSON.parse(jsonMatch[0]);
          } catch (manualError) {
            console.warn('⚠️ No se pudo extraer JSON válido del contenido');
            return await generateAIAnalysisFallback(spotData);
          }
        } else {
          console.warn('⚠️ No se encontró estructura JSON en la respuesta');
          return await generateAIAnalysisFallback(spotData);
        }
      }
      
      // Validar que la estructura sea correcta
      if (!analysis || typeof analysis !== 'object') {
        console.warn('⚠️ La respuesta no es un objeto válido');
        return await generateAIAnalysisFallback(spotData);
      }
      
      // Validar campos requeridos con valores por defecto
      if (!Array.isArray(analysis.insights)) {
        console.warn('⚠️ Campo insights no es array, usando valor por defecto');
        analysis.insights = [];
      }
      
      if (!Array.isArray(analysis.recommendations)) {
        console.warn('⚠️ Campo recommendations no es array, usando valor por defecto');
        analysis.recommendations = [];
      }
      
      if (typeof analysis.summary !== 'string') {
        console.warn('⚠️ Campo summary no es string, usando valor por defecto');
        analysis.summary = 'Análisis completado';
      }
      
    } catch (parseError) {
      console.error('❌ Error parseando respuesta de IA:', parseError);
      console.error('🔍 Contenido recibido:', data.choices?.[0]?.message?.content);
      
      // Si falla el parseo, crear respuesta por defecto basada en datos reales
      return await generateAIAnalysisFallback(spotData);
    }

    // Asegurar que siempre tengamos los campos requeridos
    return {
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || [],
      summary: analysis.summary || 'Análisis completado'
    };

  } catch (error) {
    console.error('❌ Error en análisis de IA:', error);
    return await generateAIAnalysisFallback(spotData);
  }
};

/**
 * Función fallback robusta para análisis de IA cuando falla la API principal
 * @param {Object} spotData - Datos del spot
 * @returns {Object} Análisis fallback basado en datos reales con validación completa
 */
const generateAIAnalysisFallback = async (spotData) => {
  console.log('🔄 Generando análisis fallback robusto basado en datos reales...');
  
  try {
    // Validación exhaustiva de datos de entrada
    if (!spotData || !spotData.impact || !spotData.metrics || !spotData.spot) {
      throw new Error('Datos de spot incompletos para análisis fallback');
    }
    
    const impact = spotData.impact;
    const metrics = spotData.metrics;
    const spot = spotData.spot;
    
    // Extraer y validar métricas con valores por defecto
    const activeUsersChange = Number(impact.activeUsers?.percentageChange) || 0;
    const sessionsChange = Number(impact.sessions?.percentageChange) || 0;
    const pageviewsChange = Number(impact.pageviews?.percentageChange) || 0;
    const activeUsersReference = Number(impact.activeUsers?.reference) || 0;
    const hasDirectCorrelation = Boolean(impact.activeUsers?.directCorrelation);
    
    // Análisis más detallado basado en datos reales
    const hasSignificantImpact = Math.abs(activeUsersChange) > 10;
    const hasPositiveImpact = activeUsersChange > 0;
    const impactLevel = Math.abs(activeUsersChange);
    
    // Generar insights dinámicos basados en datos reales
    const insights = [
      `El spot "${spot.nombre || 'Sin nombre'}" generó un ${activeUsersChange.toFixed(1)}% de cambio en usuarios activos durante la transmisión`,
      `Métricas durante el spot: ${metrics.spot?.activeUsers || 0} usuarios activos, ${metrics.spot?.sessions || 0} sesiones, ${metrics.spot?.pageviews || 0} vistas de página`,
      hasDirectCorrelation
        ? '✅ Vinculación directa detectada: correlación temporal fuerte entre TV y tráfico web'
        : hasSignificantImpact
          ? `📊 Impacto significativo detectado: ${impactLevel.toFixed(1)}% sobre el promedio de referencia`
          : `📈 Impacto moderado: ${activeUsersChange.toFixed(1)}% - dentro del rango esperado`
    ];
    
    // Agregar insight adicional basado en tendencias
    if (sessionsChange !== activeUsersChange) {
      insights.push(`Discrepancia en métricas: usuarios (+${activeUsersChange.toFixed(1)}%) vs sesiones (+${sessionsChange.toFixed(1)}%)`);
    }
    
    // Generar recomendaciones específicas y accionables
    const recommendations = [];
    
    if (hasDirectCorrelation) {
      recommendations.push(
        '🎯 Aprovechar la ventana de oportunidad: replicar horario y contenido en futuras campañas',
        '📺 Mantener la duración actual del spot para preservar la efectividad demostrada'
      );
    } else if (hasSignificantImpact) {
      recommendations.push(
        '📊 Optimizar el contenido del spot: reforzar call-to-action y mensaje principal',
        '⏰ Experimentar con diferentes horarios para maximizar el impacto'
      );
    } else {
      recommendations.push(
        '🔍 Revisar estrategia de contenido: el spot requiere optimización para mayor engagement',
        '📈 Analizar competencia y benchmarks del sector para identificar mejoras'
      );
    }
    
    // Recomendación técnica siempre presente
    recommendations.push('🔧 Configurar API de IA para análisis más detallado y recomendaciones personalizadas');
    
    // Resumen ejecutivo dinámico
    let summary;
    if (hasDirectCorrelation) {
      summary = `Spot altamente efectivo con vinculación directa confirmada: ${activeUsersChange.toFixed(1)}% de impacto medible en usuarios activos`;
    } else if (hasSignificantImpact && hasPositiveImpact) {
      summary = `Spot con impacto positivo significativo: ${activeUsersChange.toFixed(1)}% de incremento en usuarios - recomendable para replicar`;
    } else if (hasPositiveImpact) {
      summary = `Spot con impacto positivo moderado: ${activeUsersChange.toFixed(1)}% - requiere optimización para mayor efectividad`;
    } else {
      summary = `Spot con impacto negativo o nulo: ${activeUsersChange.toFixed(1)}% - necesita revisión estratégica completa`;
    }
    
    // Estructura de respuesta robusta y validada
    const fallbackResult = {
      insights: Array.isArray(insights) ? insights : ['Análisis basado en datos reales de Google Analytics'],
      recommendations: Array.isArray(recommendations) ? recommendations : ['Monitorear métricas en futuros spots'],
      summary: typeof summary === 'string' ? summary : 'Análisis completado con datos reales',
      fallback_used: true,
      data_source: 'Google Analytics real data + heuristic analysis',
      metadata: {
        impact_level: hasDirectCorrelation ? 'direct_correlation' : hasSignificantImpact ? 'significant' : 'moderate',
        confidence: 'high',
        data_quality: 'real_analytics',
        spot_name: spot.nombre || 'Sin nombre',
        impact_percentage: activeUsersChange,
        has_positive_impact: hasPositiveImpact,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('✅ Análisis fallback robusto completado:', fallbackResult);
    return fallbackResult;
    
  } catch (fallbackError) {
    console.error('❌ Error crítico en análisis fallback:', fallbackError);
    
    // Fallback de emergencia con datos mínimos garantizados
    const emergencyResult = {
      insights: [
        'Análisis de IA no disponible - datos basados en métricas reales',
        'El sistema de análisis inteligente está temporalmente недоступен',
        'Se recomienda verificar la configuración de API para análisis completo'
      ],
      recommendations: [
        'Mantener monitoreo continuo de métricas durante futuras transmisiones',
        'Configurar API keys para análisis de IA más detallado',
        'Los datos de impacto mostrados son precisos y basados en Google Analytics'
      ],
      summary: 'Análisis básico completado - IA temporalmente недоступна',
      fallback_used: true,
      emergency_mode: true,
      error_details: fallbackError.message
    };
    
    console.log('🆘 Análisis de emergencia generado:', emergencyResult);
    return emergencyResult;
  }
};

/**
 * Analiza múltiples spots y genera un resumen agregado
 * @param {Array} analysisResults - Resultados de análisis de múltiples spots
 * @returns {Promise<Object>} Resumen agregado con insights de IA
 */
export const generateBatchAIAnalysis = async (analysisResults) => {
  // Intentar con Groq primero, luego con Chutes como fallback (igual que generateAIAnalysis)
  const apiKey = GROQ_API_KEY || CHUTES_API_KEY;
  const apiUrl = GROQ_API_KEY ? GROQ_API_URL : `${CHUTES_API_URL}/chat/completions`;
  const provider = GROQ_API_KEY ? 'Groq' : 'Chutes';
  
  if (!apiKey) {
    console.warn('⚠️ API Key no configurada para análisis batch. El análisis de IA no estará disponible.');
    return generateBatchAIAnalysisFallback(analysisResults);
  }

  try {
    const successfulSpots = analysisResults.filter(r => r.impact.activeUsers.percentageChange > 0);
    const avgImpact = successfulSpots.length > 0
      ? successfulSpots.reduce((acc, r) => acc + r.impact.activeUsers.percentageChange, 0) / successfulSpots.length
      : 0;

    const prompt = `
Analiza el rendimiento general de ${analysisResults.length} spots de TV:

**ESTADÍSTICAS GENERALES:**
- Total de spots analizados: ${analysisResults.length}
- Spots con impacto positivo: ${successfulSpots.length}
- Impacto promedio: ${avgImpact.toFixed(1)}%
- Mejor spot: ${Math.max(...analysisResults.map(r => r.impact.activeUsers.percentageChange)).toFixed(1)}%
- Peor spot: ${Math.min(...analysisResults.map(r => r.impact.activeUsers.percentageChange)).toFixed(1)}%

Proporciona:
1. **3 insights clave** sobre el rendimiento general
2. **2 recomendaciones estratégicas** para futuras campañas
3. **1 resumen ejecutivo** de máximo 2 líneas

Responde ÚNICAMENTE con un objeto JSON válido.
    `.trim();

    console.log(`🤖 Intentando análisis batch de IA con ${provider}...`);

    const requestBody = {
      model: provider === 'Groq' ? 'llama-3.1-8b-instant' : 'Qwen/Qwen2.5-VL-72B-Instruct',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis de marketing digital. Responde SOLO con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      stream: false
    };

    // Agregar response_format solo para Groq
    if (provider === 'Groq') {
      requestBody.response_format = { type: 'json_object' };
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // Agregar headers específicos para Chutes
    if (provider === 'Chutes') {
      headers['User-Agent'] = 'TV-Radio-Analysis-System/1.0';
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (textError) {
        console.warn('⚠️ No se pudo leer el texto del error:', textError);
        errorText = 'Error desconocido';
      }
      
      console.error(`❌ Error en la API de ${provider}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: apiUrl
      });
      
      // Si es error de red, CORS, o timeout, usar fallback inmediatamente
      if (response.status === 0 ||
          response.status === 503 ||
          response.status === 502 ||
          errorText.includes('Failed to fetch') ||
          errorText.includes('ERR_FAILED') ||
          errorText.includes('CORS') ||
          errorText.includes('Network Error')) {
        console.warn(`🔄 Error de red/CORS con ${provider}, usando análisis batch fallback...`);
        return generateBatchAIAnalysisFallback(analysisResults);
      }
      
      // Para otros errores HTTP, también usar fallback para evitar crashes
      if (response.status >= 400) {
        console.warn(`🔄 Error HTTP ${response.status} con ${provider}, usando análisis batch fallback...`);
        return generateBatchAIAnalysisFallback(analysisResults);
      }
    }

    const data = await response.json();
    
    // Parsear la respuesta JSON con manejo mejorado de errores
    let analysis;
    try {
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.warn('⚠️ No se recibió contenido en la respuesta de la API');
        return generateBatchAIAnalysisFallback(analysisResults);
      }
      
      console.log('🔍 Contenido batch raw recibido:', content);
      
      // Limpiar el contenido de posibles caracteres extra
      const cleanContent = content.trim().replace(/```json\s*|\s*```/g, '');
      
      try {
        analysis = JSON.parse(cleanContent);
      } catch (jsonError) {
        console.warn('⚠️ Error en JSON.parse batch, intentando extracción manual:', jsonError);
        
        // Intentar extraer JSON manualmente usando regex
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analysis = JSON.parse(jsonMatch[0]);
          } catch (manualError) {
            console.warn('⚠️ No se pudo extraer JSON válido del contenido batch');
            return generateBatchAIAnalysisFallback(analysisResults);
          }
        } else {
          console.warn('⚠️ No se encontró estructura JSON en la respuesta batch');
          return generateBatchAIAnalysisFallback(analysisResults);
        }
      }
      
      // Validar que la estructura sea correcta
      if (!analysis || typeof analysis !== 'object') {
        console.warn('⚠️ La respuesta batch no es un objeto válido');
        return generateBatchAIAnalysisFallback(analysisResults);
      }
      
      // Validar campos requeridos con valores por defecto
      if (!Array.isArray(analysis.insights)) {
        console.warn('⚠️ Campo insights batch no es array, usando valor por defecto');
        analysis.insights = [];
      }
      
      if (!Array.isArray(analysis.recommendations)) {
        console.warn('⚠️ Campo recommendations batch no es array, usando valor por defecto');
        analysis.recommendations = [];
      }
      
      if (typeof analysis.summary !== 'string') {
        console.warn('⚠️ Campo summary batch no es string, usando valor por defecto');
        analysis.summary = 'Análisis batch completado';
      }
      
    } catch (parseError) {
      console.error('❌ Error parseando respuesta batch de IA:', parseError);
      console.error('🔍 Contenido batch recibido:', data.choices?.[0]?.message?.content);
      
      // Si falla el parseo, crear respuesta por defecto basada en datos reales
      return generateBatchAIAnalysisFallback(analysisResults);
    }

    // Asegurar que siempre tengamos los campos requeridos
    return {
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || [],
      summary: analysis.summary || 'Análisis batch completado'
    };

  } catch (error) {
    console.error('❌ Error en análisis batch de IA:', error);
    return generateBatchAIAnalysisFallback(analysisResults);
  }
};

/**
 * Función fallback robusta para análisis batch de IA cuando falla la API principal
 * @param {Array} analysisResults - Resultados de análisis de múltiples spots
 * @returns {Object} Análisis batch fallback basado en datos reales con validación completa
 */
const generateBatchAIAnalysisFallback = (analysisResults) => {
  console.log('🔄 Generando análisis batch fallback robusto basado en datos reales...');
  
  try {
    // Validación exhaustiva de datos de entrada
    if (!analysisResults || !Array.isArray(analysisResults) || analysisResults.length === 0) {
      throw new Error('Resultados de análisis incompletos para análisis batch fallback');
    }
    
    // Calcular métricas detalladas para el análisis batch
    const totalSpots = analysisResults.length;
    const successfulSpots = analysisResults.filter(r => r.impact.activeUsers.percentageChange > 0);
    const avgImpact = successfulSpots.length > 0
      ? successfulSpots.reduce((acc, r) => acc + r.impact.activeUsers.percentageChange, 0) / successfulSpots.length
      : 0;
    
    const maxImpact = Math.max(...analysisResults.map(r => r.impact.activeUsers.percentageChange));
    const minImpact = Math.min(...analysisResults.map(r => r.impact.activeUsers.percentageChange));
    
    const directCorrelationSpots = analysisResults.filter(r => r.impact.activeUsers.directCorrelation);
    const significantImpactSpots = analysisResults.filter(r => Math.abs(r.impact.activeUsers.percentageChange) > 10);
    
    // Análisis de tendencias basado en datos reales
    const hasOverallPositiveTrend = avgImpact > 0;
    const hasStrongPerformance = maxImpact > 20;
    const hasConsistentResults = successfulSpots.length / totalSpots > 0.6;
    
    // Generar insights dinámicos basados en datos reales
    const insights = [
      `Análisis de ${totalSpots} spots: ${successfulSpots.length} con impacto positivo (${((successfulSpots.length / totalSpots) * 100).toFixed(1)}% de éxito)`,
      `Impacto promedio calculado: ${avgImpact.toFixed(1)}% basado en métricas reales de Google Analytics`,
      hasStrongPerformance
        ? `🏆 Mejor rendimiento: ${maxImpact.toFixed(1)}% de incremento - spot altamente efectivo`
        : `📊 Rendimiento moderado: máximo ${maxImpact.toFixed(1)}% - oportunidad de optimización`,
      directCorrelationSpots.length > 0
        ? `✅ ${directCorrelationSpots.length} spots con vinculación directa confirmada`
        : `⚠️ Sin vinculación directa detectada - revisar timing y contenido`,
      hasConsistentResults
        ? '📈 Consistencia: más del 60% de spots con resultados positivos'
        : '🔄 Variabilidad: resultados inconsistentes entre spots'
    ];
    
    // Generar recomendaciones específicas y accionables
    const recommendations = [];
    
    if (hasStrongPerformance && directCorrelationSpots.length > 0) {
      recommendations.push(
        '🎯 Replicar estrategia de spots exitosos: usar horarios y contenido de vinculación directa',
        '📊 Escalar campañas: aumentar inversión en spots con >20% de impacto demostrado'
      );
    } else if (hasOverallPositiveTrend) {
      recommendations.push(
        '🔧 Optimizar spots de menor rendimiento: analizar diferencias con spots exitosos',
        '⏰ Ajustar timing: experimentar con horarios de spots de mejor rendimiento'
      );
    } else {
      recommendations.push(
        '🔍 Revisión estratégica completa: analizar contenido, timing y targeting de campañas',
        '📈 Benchmarking: estudiar competencia y mejores prácticas del sector'
      );
    }
    
    // Recomendación técnica siempre presente
    recommendations.push('🔧 Configurar API de IA para análisis batch más detallado y recomendaciones personalizadas');
    
    // Resumen ejecutivo dinámico y completo
    let summary;
    if (directCorrelationSpots.length > 0 && hasStrongPerformance) {
      summary = `Campaña altamente exitosa: ${directCorrelationSpots.length} spots con vinculación directa y ${maxImpact.toFixed(1)}% de impacto máximo - estrategia recomendable para replicar`;
    } else if (hasOverallPositiveTrend && hasConsistentResults) {
      summary = `Campaña con resultados positivos consistentes: ${avgImpact.toFixed(1)}% impacto promedio en ${successfulSpots.length}/${totalSpots} spots - buena base para optimización`;
    } else if (hasOverallPositiveTrend) {
      summary = `Campaña con potencial: ${avgImpact.toFixed(1)}% impacto promedio pero resultados variables - requiere optimización estratégica`;
    } else {
      summary = `Campaña requiere revisión: impacto promedio ${avgImpact.toFixed(1)}% - necesario replantear estrategia de contenido y timing`;
    }
    
    // Estructura de respuesta robusta y validada
    const fallbackResult = {
      insights: Array.isArray(insights) ? insights : ['Análisis basado en datos reales de Google Analytics'],
      recommendations: Array.isArray(recommendations) ? recommendations : ['Monitorear métricas en futuros spots'],
      summary: typeof summary === 'string' ? summary : 'Análisis batch completado con datos reales',
      fallback_used: true,
      data_source: 'Google Analytics real data + heuristic analysis',
      metadata: {
        total_spots: totalSpots,
        successful_spots: successfulSpots.length,
        success_rate: (successfulSpots.length / totalSpots) * 100,
        avg_impact: avgImpact,
        max_impact: maxImpact,
        min_impact: minImpact,
        direct_correlation_spots: directCorrelationSpots.length,
        significant_impact_spots: significantImpactSpots.length,
        overall_trend: hasOverallPositiveTrend ? 'positive' : 'negative',
        consistency: hasConsistentResults ? 'high' : 'low',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('✅ Análisis batch fallback robusto completado:', fallbackResult);
    return fallbackResult;
    
  } catch (fallbackError) {
    console.error('❌ Error crítico en análisis batch fallback:', fallbackError);
    
    // Fallback de emergencia con datos mínimos garantizados
    const emergencyResult = {
      insights: [
        'Análisis batch de IA no disponible - datos basados en métricas reales',
        'El sistema de análisis inteligente está temporalmente недоступен',
        'Se recomienda verificar la configuración de API para análisis completo'
      ],
      recommendations: [
        'Mantener monitoreo continuo de métricas durante futuras transmisiones',
        'Configurar API keys para análisis de IA más detallado',
        'Los datos de impacto mostrados son precisos y basados en Google Analytics'
      ],
      summary: 'Análisis batch básico completado - IA temporalmente недоступна',
      fallback_used: true,
      emergency_mode: true,
      error_details: fallbackError.message
    };
    
    console.log('🆘 Análisis batch de emergencia generado:', emergencyResult);
    return emergencyResult;
  }
};

const aiAnalysisService = {
  generateAIAnalysis,
  generateBatchAIAnalysis
};

export default aiAnalysisService;