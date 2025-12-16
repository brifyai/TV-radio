# Solución al Error 500 del Proxy de Google Analytics

## Problema Identificado

El error `POST https://tvradio2.netlify.app/.netlify/functions/analytics-proxy 500 (Internal Server Error)` estaba causado por varios problemas en la función del proxy de Netlify:

1. **Endpoint incorrecto**: La función estaba usando una URL incorrecta para obtener propiedades de cuentas
2. **Manejo de errores insuficiente**: Los errores de la API de Google no se manejaban adecuadamente
3. **Variables de entorno faltantes**: Las credenciales de Google OAuth no estaban configuradas

## Soluciones Implementadas

### 1. Corrección del Endpoint de Propiedades

**Archivo**: `netlify/functions/analytics-proxy.js`

Se corrigió el endpoint para obtener propiedades:
```javascript
// Antes (incorrecto)
response = await axios.get(`${baseUrl}/accountSummaries/${accountId}`, { headers });

// Después (correcto)
response = await axios.get(`${baseUrl}/accountSummaries`, { headers });
// Filtrar propiedades por accountId
if (response.data.accountSummaries) {
  const accountData = response.data.accountSummaries.find(acc => acc.account === accountId);
  response.data = {
    propertySummaries: accountData?.propertySummaries || []
  };
}
```

### 2. Mejora del Manejo de Errores

**Archivo**: `netlify/functions/analytics-proxy.js`

Se implementó un manejo de errores más específico:
```javascript
if (error.response?.status) {
  statusCode = error.response.status;
  if (statusCode === 401) {
    errorMessage = 'Authentication failed - invalid or expired token';
  } else if (statusCode === 403) {
    errorMessage = 'Access forbidden - insufficient permissions';
  } else if (statusCode === 404) {
    errorMessage = 'Resource not found';
  } else if (statusCode === 429) {
    errorMessage = 'Rate limit exceeded - please try again later';
  }
}
```

### 3. Mejora de Mensajes de Error en el Servicio

**Archivo**: `src/services/googleAnalyticsService.js`

Se agregaron mensajes de error más descriptivos en español:
```javascript
if (error.response?.status === 401) {
  throw new Error('Error de autenticación: el token de acceso ha expirado o es inválido. Por favor, vuelve a conectar tu cuenta de Google Analytics.');
} else if (error.response?.status === 403) {
  throw new Error('Error de permisos: no tienes acceso a las cuentas de Google Analytics. Verifica los permisos de tu aplicación en Google Cloud Console.');
}
```

## Configuración Requerida

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Google Analytics Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret
REACT_APP_GA4_DISCOVERY_DOC=https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuración en Netlify

Para despliegue en producción, configura estas variables de entorno en el panel de Netlify:

1. Ve a Site settings > Build & deploy > Environment
2. Agrega las variables de entorno anteriores
3. Asegúrate de que las variables comiencen con `REACT_APP_` para que estén disponibles en el frontend

## Pasos para Solucionar el Problema

1. **Configurar Credenciales de Google**:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la API de Google Analytics Data API
   - Crea credenciales OAuth 2.0
   - Configura los URI de redirección autorizados

2. **Actualizar Variables de Entorno**:
   - Copia `.env.example` a `.env`
   - Completa los valores con tus credenciales reales

3. **Probar Localmente**:
   - Reinicia el servidor de desarrollo: `npm start`
   - Verifica que no haya errores de autenticación

4. **Desplegar en Netlify**:
   - Configura las variables de entorno en Netlify
   - Despliega los cambios
   - Verifica que el proxy funcione correctamente

## Verificación

Para verificar que la solución funciona:

1. Abre la consola del navegador
2. Intenta conectar tu cuenta de Google Analytics
3. Verifica que las llamadas al proxy devuelvan código 200
4. Confirma que los datos de Analytics se carguen correctamente

## Depuración

Si el problema persiste:

1. **Verifica los logs de Netlify Functions**:
   - Ve a Netlify > Functions > View logs
   - Busca errores en la función `analytics-proxy`

2. **Verifica las credenciales**:
   - Asegúrate de que el Client ID y Client Secret sean correctos
   - Verifica que los scopes de OAuth incluyan `email` y `profile`

3. **Verifica permisos de la API**:
   - Confirma que la Google Analytics Data API esté habilitada
   - Verifica que el usuario tenga acceso a las propiedades de GA4

## Soporte

Si necesitas ayuda adicional:

1. Revisa la documentación de [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
2. Consulta la documentación de [Netlify Functions](https://docs.netlify.com/edge-functions/overview/)
3. Verifica los errores específicos en la consola del navegador y en los logs de Netlify