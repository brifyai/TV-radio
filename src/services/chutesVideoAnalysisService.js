/**
 * Servicio de análisis de video usando la API de chutes.ai
 * Modelo: Qwen/Qwen2.5-VL-72B-Instruct
 */

const CHUTES_API_KEY = 'cpk_4435ae2bc55e49bd9ad0ea879d240df4.272f8a269e1b5ec092ba273b83403b1d.Ec8wMIBp7FIpbaHcNW5niKXYcXPJ2ksJ';
const CHUTES_API_URL = 'https://llm.chutes.ai/v1';
const MODEL_NAME = 'Qwen/Qwen2.5-VL-72B-Instruct';

class ChutesVideoAnalysisService {
  constructor() {
    this.apiKey = CHUTES_API_KEY;
    this.baseUrl = CHUTES_API_URL;
    this.model = MODEL_NAME;
  }

  /**
   * Analizar un video usando la API de chutes.ai
   * @param {File} videoFile - Archivo de video
   * @param {Object} spotData - Datos del spot (fecha, hora, canal, etc.)
   * @returns {Promise<Object>} Resultado del análisis
   */
  async analyzeVideo(videoFile, spotData) {
    try {
      console.log('🎬 Iniciando análisis de video con chutes.ai...');
      
      // Convertir video a base64
      const videoBase64 = await this.fileToBase64(videoFile);
      
      // Preparar el prompt para análisis de spot TV
      const prompt = this.createSpotAnalysisPrompt(spotData);
      
      // Realizar la llamada a la API
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
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
                  type: 'video_url',
                  video_url: {
                    url: videoBase64
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Error de API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Respuesta inválida de la API');
      }

      const analysisResult = data.choices[0].message.content;
      
      console.log('✅ Análisis de video completado:', analysisResult);
      
      return {
        success: true,
        analysis: analysisResult,
        model: this.model,
        tokensUsed: data.usage?.total_tokens || 0,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error en análisis de video:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Crear prompt especializado para análisis de spots TV
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
   * Convertir archivo a base64
   * @param {File} file - Archivo a convertir
   * @returns {Promise<string>} String base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // Remover el prefijo data:mime;base64, para dejar solo el base64
        const base64 = result.split(',')[1];
        resolve(`data:${file.type};base64,${base64}`);
      };
      reader.onerror = reject;
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
    // Estimación basada en el modelo Qwen2.5-VL-72B-Instruct
    const inputCostPerToken = 0.03 / 1000000; // $0.03 per 1M tokens
    const outputCostPerToken = 0.13 / 1000000; // $0.13 per 1M tokens
    
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
      currency: 'USD'
    };
  }
}

export default ChutesVideoAnalysisService;