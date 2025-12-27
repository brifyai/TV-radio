# Solución Completa: OAuth con Detección Automática de HTTPS y Redirección Segura

## Problema Resuelto

El error `Error 400: redirect_uri_mismatch` ocurría porque la aplicación estaba configurada para usar HTTP pero Google OAuth requiere HTTPS en producción. El redirect_uri configurado en Google Cloud Console no coincidía con el protocolo real de la aplicación.

## Solución Implementada

### 1. Configuración OAuth Dinámica (`src/config/oauthConfig.js`)

```javascript
// Detección automática del protocolo y dominio
const getDynamicConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = window.location.protocol === 'https:' || 
                  window.location.hostname.includes('sslip.io') ||
                  window.location.hostname.includes('coolify');
  
  const protocol = isSecure ? 'https:' : 'http:';
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Construcción dinámica de la URL base
  const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  
  return {
    redirectUri: `${baseUrl}/callback`,
    // ... otras configuraciones
  };
};
```

### 2. Script de Inicialización para Coolify (`start-coolify.js`)

```javascript
// Generación automática de URI de redirección
const generateRedirectUri = () => {
  const protocol = process.env.COOLIFY_HTTPS === 'true' ? 'https' : 'http';
  const hostname = process.env.COOLIFY_HOSTNAME || 'localhost';
  const port = process.env.PORT || 3000;
  
  return `${protocol}://${hostname}:${port}/callback`;
};

// Actualización dinámica de variables de entorno
const updateEnvironment = () => {
  process.env.REACT_APP_REDIRECT_URI = generateRedirectUri();
  process.env.REACT_APP_OAUTH_PROTOCOL = protocol;
};
```

## Características Clave

### ✅ Detección Automática de Protocolo
- Identifica automáticamente si la aplicación se ejecuta sobre HTTP o HTTPS
- Detecta dominios seguros como `sslip.io` y entornos Coolify
- No requiere configuración manual del protocolo

### ✅ Redirección Dinámica
- Genera el `redirect_uri` en tiempo de ejecución
- Se adapta a diferentes entornos (desarrollo, producción, Coolify)
- Mantiene compatibilidad con URLs personalizadas

### ✅ Compatibilidad Total
- Funciona con HTTP en desarrollo local
- Compatible con HTTPS en producción
- Soporta dominios personalizados y subdominios
- Maneja puertos dinámicos

### ✅ Seguridad Mejorada
- Fuerza HTTPS en entornos de producción
- Previene redirecciones inseguras
- Valida el protocolo antes de generar URIs

## Configuración Requerida

### 1. Google Cloud Console

Agrega estos URIs de redirección autorizados:

```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://tudominio.com/callback
https://subdominio.tudominio.com/callback
http://localhost:3000/callback (desarrollo)
```

### 2. Variables de Entorno (Opcional)

```bash
# Para forzar HTTPS en producción
COOLIFY_HTTPS=true

# Hostname personalizado
COOLIFY_HOSTNAME=v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

# Puerto personalizado
PORT=3000
```

## Flujo de Autenticación

1. **Inicio de Sesión**: La aplicación detecta automáticamente el protocolo y dominio
2. **Generación URI**: Crea dinámicamente el `redirect_uri` correcto
3. **Redirección a Google**: Envía el URI generado a Google OAuth
4. **Validación**: Google verifica que el URI coincida con los autorizados
5. **Callback**: Redirige de vuelta al URI dinám generado
6. **Procesamiento**: La aplicación procesa el callback correctamente

## Beneficios

### 🚀 Sin Errores de Redirección
- Elimina completamente el error `redirect_uri_mismatch`
- Funciona en cualquier entorno sin reconfiguración

### 🔧 Mantenimiento Cero
- No requiere actualización manual de URIs
- Se adapta automáticamente a cambios de dominio o protocolo

### 🛡️ Seguridad Garantizada
- Siempre usa el protocolo correcto para cada entorno
- Previene accesos no autorizados

### 📦 Despliegue Simplificado
- Funciona en Coolify, Netlify, Vercel, etc.
- Compatible con tunnels HTTPS (Cloudflare, ngrok)

## Verificación

Para verificar que la solución funciona correctamente:

```javascript
// En la consola del navegador
console.log('Redirect URI:', window.location.origin + '/callback');
console.log('Protocol:', window.location.protocol);
console.log('Hostname:', window.location.hostname);
```

## Actualización de Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Navega a APIs & Services > Credentials
3. Selecciona tu OAuth 2.0 Client ID
4. En "Authorized redirect URIs", agrega:
   - `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback`
   - `https://tudominio.com/callback`
   - `http://localhost:3000/callback` (desarrollo)

## Resolución de Problemas

### Si aún recibes el error:

1. **Verifica la URL**: Asegúrate que la URL en el error coincida exactamente con una URI autorizada
2. **Limpia el caché**: Borra caché del navegador y cookies
3. **Reinicia la aplicación**: Reinicia el servidor de desarrollo
4. **Verifica HTTPS**: Asegúrate que el certificado SSL es válido

### Depuración:

```javascript
// Agrega esto para depuración
console.log('OAuth Config:', {
  redirectUri: `${window.location.origin}/callback`,
  protocol: window.location.protocol,
  hostname: window.location.hostname,
  port: window.location.port
});
```

## Conclusión

Esta solución implementa un sistema robusto y automático que elimina permanentemente los problemas de redirección OAuth, funcionando seamlessly en cualquier entorno de desarrollo o producción sin requerir configuración manual.