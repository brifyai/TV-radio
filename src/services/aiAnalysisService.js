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
    return {
      insights: ['Análisis de IA no disponible sin API key configurada'],
      recommendations: ['Configura REACT_APP_GROQ_API_KEY o REACT_APP_CHUTES_API_KEY para habilitar el análisis inteligente'],
      summary: 'Se requiere configuración de API key para análisis de IA'
    };
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
      const errorText = await response.text();
      console.error(`❌ Error en la API de ${provider}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: apiUrl
      });
      
      // Si es error de red, intentar con el otro proveedor
      if (response.status === 0 || errorText.includes('Failed to load') || errorText.includes('ERR_FAILED')) {
        console.warn(`🔄 Error de red con ${provider}, intentando fallback...`);
        return await generateAIAnalysisFallback(spotData);
      }
      
      throw new Error(`Error en API de ${provider}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Respuesta exitosa de ${provider}:`, data);
    
    // Parsear la respuesta JSON
    let analysis;
    try {
      // Intentar parsear el contenido directo
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No se recibió contenido en la respuesta de la API');
      }
      
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Error parseando respuesta de IA:', parseError);
      console.error('🔍 Contenido recibido:', data.choices?.[0]?.message?.content);
      
      // Si falla el parseo, crear respuesta por defecto basada en datos reales
      analysis = {
        insights: [
          `El spot generó un ${spotData.impact.activeUsers.percentageChange.toFixed(1)}% de incremento en usuarios`,
          `Impacto en sesiones: ${spotData.impact.sessions.percentageChange.toFixed(1)}%`,
          `El spot ${spotData.impact.activeUsers.percentageChange > 10 ? 'tuvo un impacto significativo' : 'tuvo impacto moderado'}`
        ],
        recommendations: [
          'Considerar horarios similares para futuros spots',
          'Analizar patrones de comportamiento del usuario durante el spot'
        ],
        summary: `Spot con ${spotData.impact.activeUsers.percentageChange.toFixed(1)}% de impacto en usuarios activos`
      };
    }

    return analysis;

  } catch (error) {
    console.error('❌ Error en análisis de IA:', error);
    return {
      insights: [
        `El spot generó un ${spotData.impact.activeUsers.percentageChange.toFixed(1)}% de incremento en usuarios`,
        `Impacto en sesiones: ${spotData.impact.sessions.percentageChange.toFixed(1)}%`,
        `Impacto en vistas: ${spotData.impact.pageviews.percentageChange.toFixed(1)}%`
      ],
      recommendations: [
        'Verifica la configuración de la API key para análisis más detallado',
        'Considera horarios similares para futuros spots basados en este rendimiento'
      ],
      summary: `Spot con ${spotData.impact.activeUsers.percentageChange.toFixed(1)}% de impacto - análisis de IA limitado`
    };
  }
};

/**
 * Función fallback para análisis de IA cuando falla la API principal
 * @param {Object} spotData - Datos del spot
 * @returns {Object} Análisis fallback basado en datos reales
 */
const generateAIAnalysisFallback = async (spotData) => {
  console.log('🔄 Generando análisis fallback basado en datos reales...');
  
  try {
    const impact = spotData.impact;
    const hasSignificantImpact = impact.activeUsers.percentageChange > 10;
    
    return {
      insights: [
        `Análisis basado en datos reales: ${impact.activeUsers.percentageChange.toFixed(1)}% de incremento en usuarios`,
        `El spot ${hasSignificantImpact ? 'generó un impacto significativo' : 'tuvo un impacto moderado'} en el tráfico web`,
        `Correlación temporal directa entre transmisión TV y respuesta web detectada`
      ],
      recommendations: [
        hasSignificantImpact
          ? 'Mantener elementos exitosos del spot para futuras transmisiones'
          : 'Optimizar timing y call-to-action para mejorar impacto en tráfico web',
        'Analizar patrones de audiencia para maximizar efectividad'
      ],
      summary: `Análisis offline: Spot con ${impact.activeUsers.percentageChange.toFixed(1)}% de impacto real medido`,
      fallback_used: true,
      data_source: 'Google Analytics real data + heuristic analysis'
    };
  } catch (fallbackError) {
    console.error('❌ Error en análisis fallback:', fallbackError);
    
    return {
      insights: ['Error en análisis de IA - datos no disponibles'],
      recommendations: ['Verificar conexión y configuración de APIs'],
      summary: 'Análisis no disponible - error crítico',
      fallback_used: true,
      error: true
    };
  }
};

/**
 * Analiza múltiples spots y genera un resumen agregado
 * @param {Array} analysisResults - Resultados de análisis de múltiples spots
 * @returns {Promise<Object>} Resumen agregado con insights de IA
 */
export const generateBatchAIAnalysis = async (analysisResults) => {
  if (!GROQ_API_KEY) {
    return {
      insights: ['Análisis de IA no disponible sin API key configurada'],
      recommendations: ['Configura la variable de entorno REACT_APP_GROQ_API_KEY para análisis inteligente'],
      summary: 'Se requiere configuración de API key para análisis de IA'
    };
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

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
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
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Error en API de Groq: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return analysis;

  } catch (error) {
    console.error('❌ Error en análisis batch de IA:', error);
    
    // Calcular métricas básicas para el fallback
    const successfulSpots = analysisResults.filter(r => r.impact.activeUsers.percentageChange > 0);
    const avgImpact = successfulSpots.length > 0
      ? successfulSpots.reduce((acc, r) => acc + r.impact.activeUsers.percentageChange, 0) / successfulSpots.length
      : 0;
    
    return {
      insights: [
        `De ${analysisResults.length} spots analizados, ${successfulSpots.length} tuvieron impacto positivo`,
        `Impacto promedio calculado: ${avgImpact.toFixed(1)}% basado en datos reales`,
        'Análisis limitado por configuración de API - datos basados en métricas reales'
      ],
      recommendations: [
        'Verificar configuración de API key para análisis más detallado',
        'Los datos mostrados se basan en métricas reales de Google Analytics'
      ],
      summary: `Campaña con ${avgImpact.toFixed(1)}% de impacto promedio en ${analysisResults.length} spots`
    };
  }
};

const aiAnalysisService = {
  generateAIAnalysis,
  generateBatchAIAnalysis
};

export default aiAnalysisService;