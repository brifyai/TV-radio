# 🚀 GUÍA COMPLETA: Configuración en Netlify

## 📋 CONFIGURACIÓN ACTUAL

### ✅ **Archivo `.env` configurado:**
- **Chutes AI API Key**: ✅ Configurada
- **Groq API Key**: ⚠️ Vacía (necesitas obtener una)

## 🌐 CONFIGURACIÓN EN NETLIFY

### **Paso 1: Acceder a Netlify**
1. Ir a https://app.netlify.com/
2. Seleccionar tu proyecto
3. Ir a **Site settings** → **Environment variables**

### **Paso 2: Agregar Variables de Entorno**

#### **Variables Requeridas:**
```
REACT_APP_CHUTES_API_KEY=cpk_f07741417dab421f995b63e2b9869206.272f8a269e1b5ec092ba273b83403b1d.u5no8AouQcBglfhegVrjdcU98kPSCkYt
REACT_APP_GROQ_API_KEY=tu_groq_api_key_aqui
REACT_APP_AI_FALLBACK_ENABLED=true
REACT_APP_VIDEO_ANALYSIS_TIMEOUT=30000
```

#### **Cómo agregar en Netlify:**
1. **Click en "Add a variable"**
2. **Key**: `REACT_APP_CHUTES_API_KEY`
3. **Value**: `cpk_f07741417dab421f995b63e2b9869206.272f8a269e1b5ec092ba273b83403b1d.u5no8AouQcBglfhegVrjdcU98kPSCkYt`
4. **Environment**: `Production, Deploy preview, Development`
5. **Click "Create variable"**

Repetir para cada variable.

### **Paso 3: Obtener API Key de Groq (Opcional pero Recomendado)**

#### **¿Por qué Groq?**
- **Más estable** que Chutes AI
- **Más rápido** para análisis de texto
- **Gratis** hasta 6,000 requests/minuto

#### **Cómo obtener API Key de Groq:**
1. Ir a https://console.groq.com/
2. **Crear cuenta gratuita**
3. **Ir a API Keys**
4. **Click "Create API Key"**
5. **Copiar la key** (formato: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
6. **Agregar en Netlify** como `REACT_APP_GROQ_API_KEY`

### **Paso 4: Rebuild de la Aplicación**
1. **Ir a "Deploys"** en Netlify
2. **Click "Trigger deploy"** → **"Deploy site"**
3. **Esperar** a que termine el build
4. **Verificar** que no hay errores

## 🔧 CONFIGURACIÓN ALTERNATIVA

### **Opción A: Solo con Chutes AI**
Si solo quieres usar Chutes AI:
```
REACT_APP_CHUTES_API_KEY=cpk_f07741417dab421f995b63e2b9869206.272f8a269e1b5ec092ba273b83403b1d.u5no8AouQcBglfhegVrjdcU98kPSCkYt
REACT_APP_AI_FALLBACK_ENABLED=true
```

### **Opción B: Con ambos proveedores (Recomendado)**
```
REACT_APP_CHUTES_API_KEY=cpk_f07741417dab421f995b63e2b9869206.272f8a269e1b5ec092ba273b83403b1d.u5no8AouQcBglfhegVrjdcU98kPSCkYt
REACT_APP_GROQ_API_KEY=gsk_tu_api_key_de_groq
REACT_APP_AI_FALLBACK_ENABLED=true
```

## 📊 FUNCIONAMIENTO

### **Con ambas API Keys:**
- **Análisis de Video**: Chutes AI (modelos VL)
- **Análisis de Texto**: Groq (más rápido)
- **Fallback**: Siempre disponible

### **Solo con Chutes AI:**
- **Análisis de Video**: Chutes AI
- **Análisis de Texto**: Chutes AI (más lento)
- **Fallback**: Siempre disponible

### **Sin API Keys:**
- **Solo Fallback**: Análisis basado en datos reales
- **Sin IA Externa**: Funcionalidad limitada pero estable

## ⚠️ IMPORTANTE

### **Variables de Entorno en React:**
- **Deben empezar con `REACT_APP_`**
- **Netlify las detecta automáticamente**
- **Se incluyen en el build de producción**

### **Seguridad:**
- **API Keys son públicas** en el frontend
- **No usar para datos sensibles**
- **Límites de rate limiting aplican**

## 🧪 TESTING

### **Cómo verificar que funciona:**
1. **Ir a la aplicación** en Netlify
2. **Subir un video** de spot
3. **Click "Analizar Video con IA"**
4. **Verificar progreso** sin errores 503

### **Logs en Netlify:**
- **Ir a "Deploys"** → **Click en deploy**
- **Ver "Function logs"** si hay errores
- **Ver "Build logs"** para errores de build

## 🚨 TROUBLESHOOTING

### **Error: "API key no configurada"**
- Verificar que la variable está en Netlify
- Verificar que empieza con `REACT_APP_`
- Hacer rebuild de la aplicación

### **Error 503 persistente:**
- Chutes AI puede estar sobrecargado
- El sistema usará fallback automáticamente
- Intentar más tarde

### **Build fails:**
- Verificar sintaxis de variables
- No usar comillas en los valores
- Verificar que no hay espacios extra

## ✅ RESULTADO FINAL

### **Configuración Completa:**
- ✅ **Local**: `.env` configurado
- ✅ **Netlify**: Variables de entorno configuradas
- ✅ **Fallback**: Siempre disponible
- ✅ **Robusto**: Manejo de errores implementado

### **Estado de la Aplicación:**
- 🟢 **Análisis de Google Analytics**: Siempre funciona
- 🟢 **Análisis de Video**: Con IA cuando disponible
- 🟢 **Análisis de Texto**: Con IA cuando disponible
- 🟢 **Fallback**: Siempre disponible

---

**🎯 PRÓXIMOS PASOS:**
1. Configurar variables en Netlify
2. Obtener API key de Groq (opcional)
3. Hacer rebuild
4. Probar la aplicación

**⏱️ TIEMPO ESTIMADO**: 10-15 minutos