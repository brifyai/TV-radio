# 🔧 Configuración del Backend Proxy para Google Analytics en Coolify

## 🚨 Problema Identificado:
El sistema está configurado para usar **Netlify Functions** en producción, pero está desplegado en **Coolify**.

**Línea problemática en `googleAnalyticsService.js`:**
```javascript
const API_BASE_URL = isProduction
  ? '/.netlify/functions/analytics-proxy'  // ❌ Netlify Functions
  : (process.env.REACT_APP_API_URL || 'http://localhost:3001');
```

## ✅ Solución: Configurar Backend Proxy para Coolify

### **Opción 1: Modificar googleAnalyticsService.js (Recomendado)**

**Cambiar la línea 11-13 de:**
```javascript
const API_BASE_URL = isProduction
  ? '/.netlify/functions/analytics-proxy'  // Función de Netlify en producción (siempre)
  : (process.env.REACT_APP_API_URL || 'http://localhost:3001');
```

**A:**
```javascript
const API_BASE_URL = isProduction
  ? (process.env.REACT_APP_API_URL || '/api')  // ✅ Usar API local en producción
  : (process.env.REACT_APP_API_URL || 'http://localhost:3001');
```

### **Opción 2: Configurar Variable de Entorno**

**En el archivo `.env.coolify` o variables de entorno de Coolify:**
```
REACT_APP_API_URL=/api
```

### **Opción 3: Detección Automática de Entorno**

**Reemplazar la configuración completa:**
```javascript
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Detectar Coolify
  if (hostname.includes('sslip.io') || hostname.includes('coolify.app')) {
    return '/api';
  }
  
  // Detectar Netlify
  if (hostname.includes('netlify.app')) {
    return '/.netlify/functions/analytics-proxy';
  }
  
  // Desarrollo local
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();
```

## 🔧 Configuración del Servidor Backend en Coolify

### **1. Verificar que el servidor Express esté configurado:**

**En `server.js`:**
- ✅ Puerto: 3001 (configurable via `PORT` env var)
- ✅ Endpoints: `/api/analytics/*`
- ✅ CORS configurado
- ✅ Proxy de Google Analytics funcionando

### **2. Configurar Coolify para usar el servidor backend:**

**Opciones de deployment:**

#### **Opción A: Aplicación Monolítica (Frontend + Backend)**
- Configurar Coolify para servir tanto React como Express
- Usar proxy reverso para dirigir `/api/*` al servidor Express

#### **Opción B: Servicios Separados**
- Frontend React en un servicio
- Backend Express en otro servicio
- Configurar comunicación entre servicios

#### **Opción C: Contenedor con Multi-stage Build**
```dockerfile
# Multi-stage build en Dockerfile
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18 as server
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY server.js .
EXPOSE 3001
CMD ["node", "server.js"]
```

## 📋 Pasos para Implementar:

### **1. Modificar googleAnalyticsService.js**
```bash
# Cambiar línea 11-13
```

### **2. Configurar Coolify**
- Asegurar que el servidor Express esté corriendo
- Configurar variables de entorno
- Verificar que `/api/*` esté disponible

### **3. Testing**
```bash
# Verificar endpoints
curl https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/health
curl https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/analytics/accounts
```

## 🔍 Verificación:

### **Endpoints que deben funcionar:**
- `GET /api/health` - Health check
- `GET /api/analytics/accounts` - Obtener cuentas
- `GET /api/analytics/properties/:accountId` - Obtener propiedades
- `POST /api/analytics/data/:propertyId` - Obtener datos

### **Logs esperados en Coolify:**
```
🚀 Servidor proxy de Google Analytics iniciado en puerto 3001
📊 Endpoints disponibles:
   GET  /api/analytics/accounts - Obtener cuentas
   GET  /api/analytics/properties/:accountId - Obtener propiedades
   POST /api/analytics/data/:propertyId - Obtener datos de analytics
   GET  /api/health - Health check
🔗 URL base: http://localhost:3001
```

## ⚠️ Importante:
- **Eliminar** la dependencia de Netlify Functions en producción
- **Usar** el servidor Express (`server.js`) para Coolify
- **Configurar** correctamente el proxy reverso en Coolify
- **Verificar** que los endpoints estén accesibles

---

**Estado:** ✅ Solución documentada
**Acción:** Modificar configuración del API base URL