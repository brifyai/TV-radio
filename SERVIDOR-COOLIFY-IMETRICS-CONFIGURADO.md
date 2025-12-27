# 🚀 Servidor Express iMetrics para Coolify - Configurado y Listo

## 📋 Resumen

He actualizado el servidor Express existente para que funcione perfectamente con el dominio `imetrics.cl` en Coolify. El servidor ya está configurado con todas las dependencias necesarias y optimizado para producción.

## ✅ Cambios Realizados

### 1. Dependencias Agregadas
Se han agregado las dependencias faltantes al [`package.json`](package.json:1):
- `compression`: Para compresión Gzip
- `helmet`: Para seguridad HTTP

### 2. Servidor Express Mejorado
El [`server.js`](server.js:1) ha sido completamente actualizado con:

#### 🔐 Seguridad y Rendimiento
- **Helmet**: Headers de seguridad configurados
- **Compression**: Reducción de ancho de banda
- **CORS**: Configurado para `imetrics.cl` y `www.imetrics.cl`
- **CSP**: Content Security Policy para prevenir XSS

#### 🌐 Configuración de Dominio
- **Dominio principal**: `https://imetrics.cl`
- **Subdominio**: `https://www.imetrics.cl`
- **Soporte SPA**: Manejo de rutas React Router
- **OAuth Callback**: Ruta `/callback` configurada

#### 📊 Endpoints Disponibles
```
GET  /api/health - Health check mejorado
GET  /api/analytics/accounts - Obtener cuentas
GET  /api/analytics/properties/:accountId - Obtener propiedades
POST /api/analytics/data/:propertyId - Obtener datos de analytics
GET  /callback - OAuth callback para React
GET  /* - Rutas SPA (React)
```

#### 🔧 Variables de Entorno Soportadas
```env
PORT=3001
NODE_ENV=production
REACT_APP_PUBLIC_URL=https://imetrics.cl
REACT_APP_SUPABASE_URL=tu-url-supabase
REACT_APP_SUPABASE_ANON_KEY=tu-clave-supabase
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id
```

## 🏗️ Estructura del Servidor

### Middleware Configurado
1. **Seguridad**: Helmet con CSP personalizado
2. **Compresión**: Gzip para todas las respuestas
3. **CORS**: Restringido a dominios autorizados
4. **Static Files**: Servir archivos build de React
5. **Logging**: Registro de todas las solicitudes

### Manejo de Errores
- **CORS**: Mensajes específicos para orígenes no autorizados
- **404**: Diferenciación entre rutas API y SPA
- **Producción**: Ocultamiento de stack traces en producción

### Graceful Shutdown
- Manejo de señales SIGTERM y SIGINT
- Cierre elegante del servidor
- Limpieza de recursos

## 🚀 Despliegue en Coolify

### 1. Variables de Entorno
Configura estas variables en Coolify:

```env
PORT=3001
NODE_ENV=production
REACT_APP_PUBLIC_URL=https://imetrics.cl
REACT_APP_API_URL=https://imetrics.cl/api
REACT_APP_REDIRECT_URI=https://imetrics.cl/callback
REACT_APP_SUPABASE_URL=tu-url-supabase
REACT_APP_SUPABASE_ANON_KEY=tu-clave-supabase
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id
```

### 2. Configuración de Dominio
- **Dominio principal**: `imetrics.cl`
- **Alias**: `www.imetrics.cl`
- **SSL**: Automático por Coolify

### 3. Health Check
- **Endpoint**: `/api/health`
- **Respuesta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "domain": "https://imetrics.cl",
  "version": "2.0.0",
  "features": {
    "analytics": true,
    "staticFiles": true,
    "cors": true,
    "compression": true,
    "security": true
  }
}
```

## 🔧 Flujo de Funcionamiento

### 1. Solicitud Entrante
```
Usuario → https://imetrics.cl
↓
Coolify (HTTPS/SSL)
↓
Servidor Express (Puerto 3001)
```

### 2. Rutas API
```
/api/* → Endpoints de Analytics
/callback → OAuth callback (React SPA)
/* → Archivos estáticos React (SPA)
```

### 3. Seguridad
```
Helmet Headers → Protección XSS/Clickjacking
CORS → Solo dominios autorizados
CSP → Restricción de recursos
Compression → Reducción de bandwidth
```

## 📦 Build y Despliegue

### 1. Build Local
```bash
npm run build
```

### 2. Verificar Archivos
```bash
ls -la build/
# Debe contener index.html y static/
```

### 3. Iniciar Servidor
```bash
npm run server
# o
node server.js
```

### 4. Verificar Funcionamiento
```bash
curl http://localhost:3001/api/health
```

## 🌍 Configuración OAuth

### Google Cloud Console
Configura estos URIs autorizados:
```
https://imetrics.cl/callback
https://imetrics.cl/
https://www.imetrics.cl/callback
https://www.imetrics.cl/
```

### Supabase Authentication
```
Site URL: https://imetrics.cl
Redirect URLs:
- https://imetrics.cl/callback
- https://www.imetrics.cl/callback
```

## 🔍 Solución de Problemas

### Error 503 Service Unavailable
**Verificar:**
1. `npm run build` ejecutado
2. Directorio `build/` existe
3. Variables de entorno configuradas
4. Servidor corriendo en puerto 3001

### Error OAuth redirect_uri_mismatch
**Verificar:**
1. `REACT_APP_REDIRECT_URI` coincide con Google Cloud
2. URLs configuradas en Supabase
3. Uso de HTTPS en todas las URLs

### Error de CORS
**Verificar:**
1. Origen en lista blanca de CORS
2. Variables de entorno de dominio
3. Configuración en `server.js`

## 📊 Monitoreo

### Logs del Servidor
El servidor muestra información detallada al iniciar:
```
🚀 Servidor iMetrics iniciado
📍 Puerto: 3001
🌍 Ambiente: production
🔗 Dominio: https://imetrics.cl
⏰ Hora: 27/12/2024 15:49:00
✅ Archivos estáticos de React encontrados
```

### Health Check
```bash
curl https://imetrics.cl/api/health
```

## ✅ Estado Actual

- **Servidor**: ✅ Configurado y optimizado
- **Dependencias**: ✅ Agregadas y actualizadas
- **Seguridad**: ✅ Helmet, CORS, CSP configurados
- **Rendimiento**: ✅ Compresión y cache habilitados
- **Dominio**: ✅ Configurado para imetrics.cl
- **OAuth**: ✅ Callback y rutas configuradas
- **Build**: ⏳ En proceso...

## 🚀 Próximos Pasos

1. **Esperar build** actual (en ejecución)
2. **Verificar archivos** build generados
3. **Configurar variables** en Coolify
4. **Desplegar** aplicación
5. **Probar** OAuth y funcionamiento
6. **Configurar** dominio en Google Cloud y Supabase

---

**Estado**: ✅ Servidor configurado y listo para despliegue  
**Versión**: 2.0.0  
**Dominio**: imetrics.cl  
**Puerto**: 3001  
**Entorno**: Producción Coolify