# 🎬 Guía de Configuración: YouTube Data API v3 + Google Gemini AI

## 📋 Resumen
Esta guía te ayudará a configurar las APIs necesarias para el análisis automático de videos de YouTube con inteligencia artificial.

## 🔑 1. YouTube Data API v3

### Paso 1: Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la facturación (necesaria para usar las APIs)

### Paso 2: Habilitar la API
1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "YouTube Data API v3"
3. Haz clic en "Habilitar"

### Paso 3: Crear credenciales
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la clave generada

### Paso 4: Configurar restricciones (recomendado)
1. Haz clic en el nombre de la clave
2. En "Restricciones de aplicación", selecciona "Sitios web"
3. Agrega tu dominio: `https://tvradio2.netlify.app`
4. En "Restricciones de API", selecciona solo "YouTube Data API v3"

## 🤖 2. Google Gemini AI API

### Paso 1: Habilitar la API
1. En Google Cloud Console, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Generative Language API" o "Gemini API"
3. Haz clic en "Habilitar"

### Paso 2: Obtener clave de API
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la clave generada

### Paso 3: Configurar restricciones
1. Haz clic en el nombre de la clave
2. En "Restricciones de aplicación", selecciona "Sitios web"
3. Agrega tu dominio: `https://tvradio2.netlify.app`
4. En "Restricciones de API", selecciona solo "Generative Language API"

## ⚙️ 3. Configuración en Netlify

### Variables de entorno necesarias:
```
REACT_APP_YOUTUBE_API_KEY=tu_clave_youtube_aqui
REACT_APP_GEMINI_API_KEY=tu_clave_gemini_aqui
```

### Cómo agregarlas:
1. Ve a tu panel de Netlify
2. Selecciona tu sitio: `tvradio2`
3. Ve a "Site settings" > "Environment variables"
4. Haz clic en "Add a variable"
5. Agrega cada variable con su valor correspondiente

## 🧪 4. Prueba de funcionamiento

### URL de prueba:
```
https://tvradio2.netlify.app/spot-analysis
```

### Qué deberías ver:
1. **Campo de YouTube**: "Video del Spot con IA (YouTube)"
2. **Fondo rosa/gradiente**: Indicador de la nueva funcionalidad
3. **Análisis automático**: Al ingresar una URL válida

### URLs de prueba válidas:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`
- `https://www.youtube.com/embed/dQw4w9WgXcQ`

## 📊 5. Funcionalidades implementadas

### ✅ YouTube Data API v3:
- ✅ Extracción automática de metadata
- ✅ Título, descripción, miniaturas
- ✅ Estadísticas (vistas, likes, comentarios)
- ✅ Duración y fecha de publicación
- ✅ Tags y categorización

### ✅ Google Gemini AI:
- ✅ Análisis de contenido publicitario
- ✅ Evaluación de efectividad (1-10)
- ✅ Correlación TV-Web automática
- ✅ Insights y recomendaciones
- ✅ Racional de impacto

### ✅ Integración completa:
- ✅ Análisis automático al ingresar URL
- ✅ Correlación con métricas de Analytics
- ✅ Dashboard interactivo con gráficos
- ✅ Exportación de resultados

## 🚨 6. Solución de problemas comunes

### Error: "API key no configurada"
- Verifica que las variables de entorno estén correctamente configuradas en Netlify
- Asegúrate de que los nombres coincidan exactamente

### Error: "Video no encontrado"
- Verifica que el video sea público en YouTube
- Comprueba que la URL esté bien escrita

### Error: "Límite de cuota excedido"
- YouTube Data API v3 tiene límite gratuito de 10,000 unidades por día
- Google Gemini AI tiene límite gratuito de 60 solicitudes por minuto

## 📈 7. Monitoreo y métricas

### En Google Cloud Console:
1. Ve a "APIs y servicios" > "Dashboard"
2. Monitorea el uso de ambas APIs
3. Verifica los límites y cuotas

### Métricas importantes:
- ✅ Solicitudes por minuto
- ✅ Errores de API
- ✅ Tiempo de respuesta
- ✅ Cuota diaria utilizada

## 🎯 8. Optimización de costos

### YouTube Data API v3:
- Cada solicitud de video = 1 unidad
- Límite gratuito: 10,000 unidades/día
- Costo después del límite: $0.005 por unidad

### Google Gemini AI:
- Cada análisis = 1 solicitud
- Límite gratuito: 60 solicitudes/minuto
- Costo después del límite: $0.0005 por 1K caracteres

### Recomendaciones:
- ✅ Implementar caché de resultados
- ✅ Limitar análisis por usuario
- ✅ Monitorear uso diario
- ✅ Configurar alertas de presupuesto

## 📞 Soporte

Si encuentras problemas:
1. Verifica los logs en la consola del navegador (F12)
2. Revisa la configuración de las APIs en Google Cloud
3. Confirma que las variables de entorno estén correctas en Netlify
4. Prueba con URLs de YouTube públicas y válidas

¡Listo! Tu sistema de análisis de YouTube con IA está configurado y funcionando. 🚀