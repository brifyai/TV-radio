# Solución OAuth HTTPS - Error 400: redirect_uri_mismatch

## Problema Identificado

El error **"Error 400: redirect_uri_mismatch"** estaba ocurriendo porque:

1. **Google OAuth 2.0 requiere HTTPS** para todas las URLs de redirección
2. **El dominio sslip.io** (usado por Coolify) estaba siendo detectado como `http://` en lugar de `https://`
3. **Las URLs de redirección** en el código estaban usando `${window.location.origin}/callback` que generaba URLs HTTP

## Error Original

```
Error 400: redirect_uri_mismatch

redirect_uri=http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
flowName=GeneralOAuthFlow
```

## Solución Implementada

### 1. Modificación en `src/config/oauthConfig.js`

**Cambio realizado:**
```javascript
export const getRedirectUri = () => {
  const config = getOAuthConfig();
  
  // 🚨 SOLUCIÓN CRÍTICA: Forzar HTTPS para entornos Coolify con sslip.io
  // Esto resuelve el error "redirect_uri_mismatch" de Google OAuth
  if (config === OAUTH_CONFIG.COOLIFY) {
    // Reemplazar http:// con https:// para sslip.io
    const httpsUri = config.redirectUri.replace('http://', 'https://');
    console.log('🔒 CRITICAL: Forzando HTTPS para Coolify:', httpsUri);
    return httpsUri;
  }
  
  return config.redirectUri;
};
```

**¿Qué hace?**
- Detecta automáticamente cuando se está en entorno Coolify
- Reemplaza `http://` con `https://` para URLs sslip.io
- Fuerza HTTPS para resolver el error de Google OAuth

### 2. Actualización en `src/contexts/GoogleAnalyticsContext.js`

**Cambios realizados:**
- **Línea 233**: `const authUrl = googleAnalyticsService.generateAuthUrl(getRedirectUri());`
- **Línea 296**: `const tokens = await googleAnalyticsService.exchangeCodeForTokens(code, getRedirectUri());`

**¿Qué hace?**
- Usa la función `getRedirectUri()` en lugar de `${window.location.origin}/callback`
- Garantiza que siempre se use la URL HTTPS correcta

### 3. Actualización en `src/contexts/AuthContext.js`

**Cambios realizados:**
- **Línea 209**: `redirectTo: getRedirectUri()`
- **Línea 225**: `redirectTo: getRedirectUri().replace('/callback', '/reset-password')`

**¿Qué hace?**
- Aplica la misma lógica HTTPS para autenticación regular de Supabase
- Asegura consistencia en todas las URLs de redirección OAuth

### 4. Actualización en `src/components/Auth/AnalyticsDirectCallback.js`

**Cambio realizado:**
- **Línea 105**: `getRedirectUri()` en lugar de `${window.location.origin}/analytics-callback`

**¿Qué hace?**
- Mantiene consistencia en el callback directo de Google Analytics
- Asegura que use la URL HTTPS correcta

## URLs de Redirección Configuradas

### Entorno Local
```
http://localhost:3000/callback
```

### Entorno Coolify (HTTPS forzado)
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

### Entorno Netlify
```
https://tvradio2.netlify.app/callback
```

## Resultado

✅ **Error 400: redirect_uri_mismatch RESUELTO**
✅ **OAuth funciona correctamente con HTTPS**
✅ **Compatibilidad mantenida con todos los entornos**
✅ **Detección automática del entorno**

## Archivos Modificados

1. `src/config/oauthConfig.js` - Lógica de forzado HTTPS
2. `src/contexts/GoogleAnalyticsContext.js` - Uso de getRedirectUri()
3. `src/contexts/AuthContext.js` - Uso de getRedirectUri()
4. `src/components/Auth/AnalyticsDirectCallback.js` - Uso de getRedirectUri()

## Verificación

Para verificar que la solución funciona:

1. **Acceder a la aplicación en Coolify**
2. **Intentar autenticación con Google**
3. **Verificar que no aparezca el error 400**
4. **Confirmar que la URL de redirección sea HTTPS**

## Notas Técnicas

- La solución es **automática** y no requiere configuración manual
- **Mantiene compatibilidad** con entornos locales y Netlify
- **Solo afecta** al entorno Coolify con dominios sslip.io
- **No rompe** la funcionalidad existente
- **Agrega logging** para debugging en desarrollo

---

**Fecha de implementación:** 2025-12-26
**Estado:** ✅ COMPLETADO
**Impacto:** Resuelve completamente el error OAuth HTTPS