# Guía de Configuración: Google Gemini API y YouTube API

Esta guía te ayudará a configurar las APIs necesarias para el análisis de videos de YouTube con inteligencia artificial.

## 🎯 Objetivo
Reemplazar la funcionalidad de "Video del Spot (Opcional)" por un sistema que:
- Permita insertar URLs de YouTube
- Analice el contenido con Google Gemini AI
- Genere un racional publicitario profesional
- Correlacione con los datos de Google Analytics

## 📋 Requisitos Previos

1. **Cuenta de Google Cloud Platform**
2. **Proyecto de Google Cloud**
3. **Habilitar las APIs necesarias**
4. **Credenciales de API**

---

## 🔑 1. Configurar Google Gemini API

### Paso 1: Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la facturación (necesaria para usar la API)

### Paso 2: Habilitar la API de Gemini
1. Ve a "APIs y servicios" > "Biblioteca"
2. Busca "Vertex AI API" o "Generative Language API"
3. Haz clic en "Habilitar"

### Paso 3: Crear Credenciales
1. Ve a "APIs y servicios" > "Credenciales"
2. Crea una nueva clave de API
3. Restringe la clave a tu dominio (seguridad)
4. Copia la clave de API

---

## 📺 2. Configurar YouTube Data API

### Paso 1: Habilitar la API
1. En Google Cloud Console, ve a "Biblioteca de APIs"
2. Busca "YouTube Data API v3"
3. Haz clic en "Habilitar"

### Paso 2: Crear Credenciales
1. Ve a "Credenciales"
2. Crea una nueva clave de API (puede ser la misma o diferente a Gemini)
3. Restringe la clave según sea necesario

---

## 📝 3. Configurar Variables de Entorno

### Archivo `.env`
Crea un archivo `.env` en la raíz del proyecto con:

```bash
# Google Gemini API
REACT_APP_GEMINI_API_KEY=tu_clave_de_gemini_aqui

# YouTube Data API  
REACT_APP_YOUTUBE_API_KEY=tu_clave_de_youtube_aqui

# Otras configuraciones existentes
REACT_APP_GA_MEASUREMENT_ID=tu_measurement_id
REACT_APP_SUPABASE_URL=tu_url_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key
```

### Seguridad Importante
⚠️ **NUNCA** subas el archivo `.env` a GitHub
⚠️ **SIEMPRE** usa `.env.example` como plantilla

---

## 🧪 4. Probar la Configuración

### Verificar Gemini API
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hola, ¿cómo estás?"
      }]
    }]
  }'
```

### Verificar YouTube API
```bash
curl "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=TU_API_KEY"
```

---

## 🚀 5. Características del Nuevo Sistema

### ✅ Análisis de YouTube con IA
- **Extracción automática** de datos del video (título, descripción, duración, vistas)
- **Análisis experto** con Google Gemini como publicista profesional
- **Racional detallado** sobre efectividad del contenido
- **Correlación** con métricas de Google Analytics

### 📊 Información Analizada
- Efectividad del mensaje publicitario
- Claridad del llamado a la acción (CTA)
- Calidad técnica de producción
- Segmento demográfico objetivo
- Correlación con impacto web medido

### 🎯 Recomendaciones IA
- Optimizaciones específicas de contenido
- Sugerencias de timing y horarios
- Elementos a mantener vs. cambiar
- Adaptación para diferentes plataformas

---

## 🔧 6. Solución de Problemas

### Error: "API key not valid"
- Verifica que la API esté habilitada
- Revisa las restricciones de la clave
- Asegúrate de usar la clave correcta para cada servicio

### Error: "Quota exceeded"
- Revisa tu cuota en Google Cloud Console
- Considera actualizar a un plan de pago
- Implementa límites de uso en la aplicación

### Error: "Video not found"
- Verifica que el video sea público
- Asegúrate de que la URL sea válida
- Prueba con videos de canales verificados

---

## 📈 7. Mejores Prácticas

### Optimización de Costos
- Implementa caché para análisis repetidos
- Usa límites de caracteres en prompts
- Agrupa análisis cuando sea posible

### Seguridad
- Implementa rate limiting
- Valida URLs antes de procesar
- Usa HTTPS siempre
- Implementa manejo de errores robusto

### Rendimiento
- Usa debouncing en el input de URL
- Implementa lazy loading para componentes
- Considera usar web workers para análisis pesados

---

## 🎉 ¡Listo!

Con esta configuración, tu aplicación ahora puede:
1. ✅ Aceptar URLs de YouTube en lugar de subir videos
2. ✅ Analizar el contenido con Google Gemini AI
3. ✅ Generar análisis profesionales de publicidad
4. ✅ Correlacionar con datos de Google Analytics
5. ✅ Proporcionar recomendaciones accionables

**¿Preguntas?** Consulta la documentación oficial de [Google AI](https://ai.google.dev/) y [YouTube API](https://developers.google.com/youtube/v3).