# Solución del Error 500 del Proxy de Google Analytics

## ¿Por qué necesitamos un proxy para Google Analytics?

### 1. **Seguridad - Protección de credenciales**
- Las APIs de Google Analytics requieren tokens de acceso OAuth 2.0
- Los tokens no deben exponerse en el frontend (riesgo de seguridad)
- El proxy maneja la autenticación de forma segura en el servidor

### 2. **Arquitectura - Separación de responsabilidades**
- **Frontend**: Solo maneja la UI y datos ya procesados
- **Backend (proxy)**: Maneja autenticación, llamadas a APIs de Google, y procesamiento
- Evita CORS y problemas de dominio cruzado

### 3. **Funcionalidad - Mapeo de datos**
- Convierte formatos de datos entre frontend y Google Analytics API
- Maneja errores y validaciones específicas de Google
- Cache y optimización de requests

## Problemas Identificados en el Error 500

### 1. **Validación de Token Deficiente**
- El token de autorización no se validaba correctamente
- Headers malformados causaban errores silenciosos

### 2. **Manejo de Errores Incompleto**
- No se capturaban todos los tipos de errores
- Falta de información de debugging

### 3. **Validación de Request Body Problemática**
- JSON malformado causaba crashes
- Falta de validación de campos requeridos

### 4. **Mapeo de Dimensiones/Métricas Inconsistente**
- Algunos mapeos podían fallar sin aviso
- Falta de validación de campos válidos

## Soluciones Implementadas

### ✅ 1. **Validación Mejorada de Autenticación**
```javascript
const verifyAuthToken = (headers) => {
  console.log('🔍 DEBUG: Verificando token de autorización...');
  console.log('🔍 DEBUG: Headers recibidos:', Object.keys(headers || {}));
  
  const authHeader = headers.authorization || headers.Authorization;
  
  if (!authHeader) {
    console.log('❌ DEBUG: No se encontró header de autorización');
    throw new Error('Header de autorización no encontrado');
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ DEBUG: Header de autorización no tiene formato Bearer');
    throw new Error('Header de autorización debe tener formato "Bearer <token>"');
  }
  
  const token = authHeader.substring(7);
  console.log('✅ DEBUG: Token extraído, longitud:', token.length);
  
  return token;
};
```

### ✅ 2. **Debug Logging Detallado**
```javascript
console.log('🔍 DEBUG: Nueva solicitud recibida');
console.log('🔍 DEBUG: HTTP Method:', event.httpMethod);
console.log('🔍 DEBUG: Path original:', event.path);
console.log('🔍 DEBUG: Headers disponibles:', Object.keys(event.headers || {}));
```

### ✅ 3. **Validación Robusta de Request Body**
```javascript
// Verificar que event.body existe y no está vacío
if (!event.body || event.body.trim() === '') {
  console.log('❌ DEBUG: Cuerpo de solicitud vacío');
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({
      error: 'Cuerpo de la solicitud requerido',
      details: 'Se requiere enviar métricas, dimensiones y rango de fechas en el cuerpo'
    })
  };
}

// Parsear JSON con manejo de errores
try {
  console.log('🔍 DEBUG: Intentando parsear JSON del cuerpo...');
  requestData = JSON.parse(event.body);
  console.log('✅ DEBUG: JSON parseado exitosamente');
} catch (parseError) {
  console.log('❌ DEBUG: Error al parsear JSON:', parseError.message);
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({
      error: 'JSON inválido en el cuerpo de la solicitud',
      details: `Error de parseo: ${parseError.message}`,
      receivedBody: event.body.substring(0, 200) // Primeros 200 chars para debug
    })
  };
}
```

### ✅ 4. **Validación de Dimensiones y Métricas**
```javascript
// Mapear dimensiones con logging
const apiDimensions = dimensions?.map(dim => {
  const mapped = dimensionMapping[dim] || dim;
  console.log(`🔍 Mapeando dimensión: ${dim} -> ${mapped}`);
  return mapped;
}) || [];

// Validar dimensiones
if (apiDimensions.length === 0) {
  console.log('❌ DEBUG: No se proporcionaron dimensiones válidas');
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({
      error: 'Dimensiones requeridas',
      details: 'Debe proporcionar al menos una dimensión válida',
      availableDimensions: Object.keys(dimensionMapping)
    })
  };
}
```

### ✅ 5. **Health Check Endpoint**
```javascript
// Endpoint de health check para debugging
if (event.httpMethod === 'GET' && path === '/health') {
  console.log('✅ DEBUG: Health check solicitado');
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'unknown'
    })
  };
}
```

### ✅ 6. **Manejo de Errores Específico**
```javascript
catch (error) {
  console.error('❌ Error en el proxy de Netlify:');
  console.error('❌ Tipo de error:', error.constructor.name);
  console.error('❌ Mensaje:', error.message);
  console.error('❌ Stack:', error.stack);
  console.error('❌ Response data:', error.response?.data);
  console.error('❌ Response status:', error.response?.status);
  console.error('❌ Request path:', event.path);
  console.error('❌ Request method:', event.httpMethod);
  
  // Determinar código de estado apropiado
  let status = 500;
  let message = 'Error interno del servidor';
  let details = {};
  
  if (error.response) {
    // Error de la API de Google
    status = error.response.status;
    message = error.response.data?.error?.message || error.response.data?.message || error.message;
    details = {
      googleApiError: error.response.data,
      status: status
    };
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    // Error de red
    status = 503;
    message = 'Servicio no disponible temporalmente';
    details = {
      networkError: error.code,
      message: 'No se puede conectar con Google Analytics API'
    };
  } else if (error.message.includes('Token de autorización')) {
    // Error de autenticación
    status = 401;
    message = 'Token de autorización inválido';
    details = {
      authError: true,
      message: 'Verifica que el token de acceso sea válido'
    };
  } else {
    // Error genérico
    message = error.message || 'Error desconocido';
    details = {
      errorType: error.constructor.name,
      originalError: error.message
    };
  }
  
  return {
    statusCode: status,
    headers,
    body: JSON.stringify({ 
      error: message,
      details: details,
      timestamp: new Date().toISOString(),
      path: event.path,
      method: event.httpMethod
    })
  };
}
```

## Cómo Diagnosticar el Error 500

### 1. **Verificar Health Check**
```bash
curl "https://tvradio2.netlify.app/.netlify/functions/analytics-proxy/health"
```

### 2. **Probar con Token Inválido (para ver manejo de errores)**
```bash
curl -X POST "https://tvradio2.netlify.app/.netlify/functions/analytics-proxy/api/analytics/data/test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token_test" \
  -d '{"metrics": ["activeUsers"], "dimensions": ["date"], "dateRange": {"startDate": "7daysAgo", "endDate": "today"}}'
```

### 3. **Verificar Logs en Netlify**
- Ir a Netlify Dashboard
- Seleccionar el sitio
- Ir a "Functions" tab
- Ver logs en tiempo real

### 4. **Problemas Comunes y Soluciones**

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Token inválido/expirado | Re-autenticarse con Google |
| 400 Bad Request | JSON malformado | Verificar formato del request body |
| 403 Forbidden | Permisos insuficientes | Verificar scopes de la app en Google Cloud |
| 404 Not Found | Property ID inválido | Verificar que el propertyId existe |
| 500 Internal Server Error | Error en el proxy | Revisar logs de Netlify Functions |

## Próximos Pasos

1. **Desplegar las mejoras** en Netlify
2. **Probar con datos reales** de Google Analytics
3. **Monitorear logs** para identificar problemas
4. **Configurar alertas** para errores 500
5. **Implementar cache** para mejorar performance

## Endpoints Disponibles

### GET `/health`
- **Propósito**: Verificar que el proxy está funcionando
- **Autenticación**: No requerida
- **Respuesta**: `{ "status": "OK", "timestamp": "...", "version": "1.0.0" }`

### GET `/api/analytics/accounts`
- **Propósito**: Obtener cuentas de Google Analytics
- **Autenticación**: Bearer token requerido
- **Headers**: `Authorization: Bearer <access_token>`

### GET `/api/analytics/properties/{accountId}`
- **Propósito**: Obtener propiedades de una cuenta
- **Autenticación**: Bearer token requerido
- **Headers**: `Authorization: Bearer <access_token>`

### POST `/api/analytics/data/{propertyId}`
- **Propósito**: Obtener datos de analytics
- **Autenticación**: Bearer token requerido
- **Body**: 
```json
{
  "metrics": ["activeUsers", "sessions"],
  "dimensions": ["date", "country"],
  "dateRange": {
    "startDate": "7daysAgo",
    "endDate": "today"
  }
}
```

## Conclusión

El proxy de Google Analytics ha sido mejorado significativamente con:

- ✅ **Validación robusta** de tokens y requests
- ✅ **Debug logging detallado** para troubleshooting
- ✅ **Manejo de errores específico** con códigos HTTP apropiados
- ✅ **Health check endpoint** para monitoreo
- ✅ **Validación de dimensiones/métricas** para prevenir errores de API
- ✅ **Mejor información de debugging** en respuestas de error

Estas mejoras deberían resolver el error 500 y proporcionar mejor visibilidad sobre cualquier problema futuro.