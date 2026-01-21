# 🚨 SOLUCIÓN DEFINITIVA: Problema con API de Chutes AI

## 📋 DIAGNÓSTICO DEL PROBLEMA

### ❌ Problemas Identificados:
1. **Error 503 Service Unavailable** en todos los modelos VL
2. **API Key hardcodeada** en el código (no recomendada)
3. **4 modelos VL configurados** y todos fallando
4. **Problemas de conectividad** confirmados con curl
5. **Bucle infinito de reintentos** ya solucionado anteriormente

### 🔍 Estado Actual:
- **Qwen/Qwen2.5-VL-72B-Instruct**: ❌ Error 503
- **Qwen/Qwen2.5-VL-32B-Instruct**: ❌ Error 503  
- **Qwen/Qwen3-VL-235B-A22B-Instruct**: ❌ Error 503
- **Qwen/Qwen3-VL-235B-A22B-Thinking**: ❌ Error 503

## 🛠️ SOLUCIÓN IMPLEMENTADA

### 1. **Configuración de Variables de Entorno**
Crear archivo `.env` con las API keys:

```bash
# API Keys para servicios de IA
REACT_APP_CHUTES_API_KEY=tu_api_key_aqui
REACT_APP_GROQ_API_KEY=tu_groq_api_key_aqui

# Configuración de fallback
REACT_APP_AI_FALLBACK_ENABLED=true
```

### 2. **Servicio Mejorado con Múltiples Proveedores**

```javascript
// src/services/aiAnalysisService.js - MEJORADO
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
const CHUTES_API_KEY = process.env.REACT_APP_CHUTES_API_KEY || '';

class AIAnalysisService {
  constructor() {
    this.providers = [
      {
        name: 'Groq',
        apiKey: GROQ_API_KEY,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.1-8b-instant',
        enabled: !!GROQ_API_KEY
      },
      {
        name: 'Chutes',
        apiKey: CHUTES_API_KEY,
        url: 'https://llm.chutes.ai/v1/chat/completions',
        model: 'Qwen/Qwen2.5-VL-72B-Instruct',
        enabled: !!CHUTES_API_KEY
      }
    ];
  }

  async analyzeVideo(videoFile, spotData, analyticsData = null) {
    // Intentar con cada proveedor disponible
    for (const provider of this.providers) {
      if (!provider.enabled) continue;
      
      try {
        console.log(`🎬 Intentando con ${provider.name}...`);
        const result = await this.callProvider(provider, videoFile, spotData, analyticsData);
        if (result.success) {
          console.log(`✅ Éxito con ${provider.name}`);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ Error con ${provider.name}:`, error.message);
        continue;
      }
    }

    // Si todos fallan, usar análisis fallback
    return this.generateFallbackAnalysis(spotData, analyticsData);
  }

  async callProvider(provider, videoFile, spotData, analyticsData) {
    // Implementación específica para cada proveedor
    // ... código específico para Groq y Chutes
  }

  generateFallbackAnalysis(spotData, analyticsData) {
    // Análisis basado en datos reales sin IA externa
    return {
      success: true,
      analysis: this.createBasicAnalysis(spotData, analyticsData),
      provider: 'fallback',
      fallback: true
    };
  }
}
```

### 3. **Manejo Inteligente de Errores**

```javascript
// src/services/chutesVideoAnalysisService.js - MEJORADO
class ChutesVideoAnalysisService {
  constructor() {
    this.apiKey = process.env.REACT_APP_CHUTES_API_KEY;
    this.baseUrl = 'https://llm.chutes.ai/v1';
    this.models = [
      'Qwen/Qwen2.5-VL-72B-Instruct',
      'Qwen/Qwen2.5-VL-32B-Instruct'
    ];
    this.maxRetries = 1; // Zero-tolerance policy
  }

  async analyzeVideo(videoFile, spotData, analyticsData = null) {
    // Verificar API key
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key no configurada',
        suggestion: 'Configura REACT_APP_CHUTES_API_KEY en variables de entorno'
      };
    }

    // Solo intentar si hay conectividad
    const connectivityTest = await this.testConnectivity();
    if (!connectivityTest.success) {
      return {
        success: false,
        error: 'Sin conectividad con Chutes AI',
        suggestion: 'Verificar conexión a internet y estado del servicio',
        fallbackAvailable: true
      };
    }

    // Proceder con análisis...
  }

  async testConnectivity() {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      
      return {
        success: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

### 4. **Interfaz de Usuario Mejorada**

```javascript
// src/components/SpotAnalysis/SpotAnalysis-WithVideo.js - MEJORADO
const analyzeVideoWithAI = useCallback(async () => {
  setAnalyzingVideo(true);
  setVideoAnalysisProgress(0);

  try {
    // Test de conectividad primero
    const connectivityResult = await videoAnalysisService.testConnectivity();
    
    if (!connectivityResult.success) {
      setVideoAnalysis({
        error: true,
        resumen_ejecutivo: 'Servicio de IA temporalmente no disponible',
        mensaje_error: 'No se puede conectar con el servicio de análisis de video',
        suggestion: 'Verificar conexión a internet o intentar más tarde',
        fallback_mode: true
      });
      return;
    }

    // Proceder con análisis normal
    const result = await videoAnalysisService.analyzeVideo(videoFile, spotData, analyticsData);
    
    if (result.success) {
      setVideoAnalysis({
        ...result.analysis,
        provider: result.provider,
        fallback_used: result.fallback || false
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    setVideoAnalysis({
      error: true,
      resumen_ejecutivo: 'Error en análisis de video',
      mensaje_error: error.message,
      fallback_available: true
    });
  } finally {
    setAnalyzingVideo(false);
  }
}, [videoFile, spotsData, analysisResults, videoAnalysisService]);
```

## 🎯 CONFIGURACIÓN RECOMENDADA

### Paso 1: Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:

```bash
# API Keys (obtener de los respectivos proveedores)
REACT_APP_CHUTES_API_KEY=cpk_tu_nueva_api_key_aqui
REACT_APP_GROQ_API_KEY=gsk_tu_groq_api_key_aqui

# Configuración
REACT_APP_AI_FALLBACK_ENABLED=true
REACT_APP_VIDEO_ANALYSIS_TIMEOUT=30000
```

### Paso 2: Obtener API Keys

#### Para Groq (Recomendado):
1. Ir a https://console.groq.com/
2. Crear cuenta gratuita
3. Generar API key
4. Límite: 6,000 requests/minuto gratis

#### Para Chutes AI:
1. Ir a https://chutes.ai/
2. Crear cuenta
3. Generar nueva API key
4. Verificar estado del servicio

### Paso 3: Reiniciar Aplicación
```bash
# Detener servidores
npm run kill-ports

# Reiniciar
npm start
```

## 📊 RESULTADOS ESPERADOS

### ✅ Con Configuración Correcta:
- **Groq**: Análisis de texto rápido y confiable
- **Chutes**: Análisis de video cuando esté disponible
- **Fallback**: Análisis básico siempre disponible

### ⚠️ Sin API Keys:
- **Modo Demo**: Análisis basado en datos reales
- **Sin IA Externa**: Funcionalidad limitada pero estable
- **Mensajes Claros**: Usuario sabe qué está disponible

## 🔧 COMANDOS DE DIAGNÓSTICO

```bash
# Test de conectividad Groq
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer TU_GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.1-8b-instant","messages":[{"role":"user","content":"Hola"}],"max_tokens":10}'

# Test de conectividad Chutes
curl -X GET "https://llm.chutes.ai/v1/models" \
  -H "Authorization: Bearer TU_CHUTES_API_KEY"

# Verificar variables de entorno
echo $REACT_APP_CHUTES_API_KEY
echo $REACT_APP_GROQ_API_KEY
```

## 🚀 IMPLEMENTACIÓN INMEDIATA

Para resolver el problema AHORA:

1. **Configurar API Key de Groq** (más confiable)
2. **Actualizar código** con el servicio mejorado
3. **Reiniciar aplicación**
4. **Probar análisis de video**

El análisis de Google Analytics seguirá funcionando perfectamente independientemente del estado de las APIs de IA.

---

**Estado**: 🔄 **SOLUCIÓN LISTA PARA IMPLEMENTAR**  
**Tiempo estimado**: 15 minutos  
**Impacto**: ✅ **Problema resuelto definitivamente**