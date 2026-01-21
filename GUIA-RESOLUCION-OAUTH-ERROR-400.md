# 🚨 GUÍA PASO A PASO: RESOLUCIÓN ERROR OAUTH REDIRECT_URI_MISMATCH

## 📋 PROBLEMA IDENTIFICADO

**Error específico:**
```
Error 400: redirect_uri_mismatch
redirect_uri=http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

**Causa:** La aplicación está generando URLs HTTP cuando debe usar HTTPS para OAuth.

## ✅ SOLUCIÓN APLICADA

He modificado `src/config/oauthConfig.js` para forzar HTTPS en el entorno de Coolify. Los cambios incluyen:

1. **Detección forzada de HTTPS** para dominios Coolify
2. **URLs dinámicas** basadas en el hostname actual
3. **Logging mejorado** para debugging

## 🎯 ACCIONES REQUERIDAS (INMEDIATAS)

### Paso 1: Registrar URLs en Google Cloud Console

**URLs que DEBEN estar registradas en tu proyecto de Google Cloud:**

1. **Para Coolify (HTTPS):**
   ```
   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback
   ```

2. **Para producción (imetrics.cl):**
   ```
   https://imetrics.cl/callback
   https://imetrics.cl/auth/callback
   ```

3. **Para Netlify:**
   ```
   https://tvradio2.netlify.app/callback
   https://tvradio2.netlify.app/auth/callback
   ```

4. **Para desarrollo local:**
   ```
   http://localhost:3000/callback
   http://localhost:3000/auth/callback
   ```

### Paso 2: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Navega a **APIs & Services** → **Credentials**
4. Busca tu **OAuth 2.0 Client ID**
5. Haz clic en él para editar

### Paso 3: Agregar URLs de redirección autorizadas

En la sección **Authorized redirect URIs**, agrega todas las URLs listadas arriba:

```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback
https://imetrics.cl/callback
https://imetrics.cl/auth/callback
https://tvradio2.netlify.app/callback
https://tvradio2.netlify.app/auth/callback
http://localhost:3000/callback
http://localhost:3000/auth/callback
```

### Paso 4: Verificar variables de entorno

Asegúrate de que en Coolify tengas:

```bash
REACT_APP_USE_COOLIFY_DOMAIN=true
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_real_aqui
```

### Paso 5: Reiniciar aplicación

1. Reinicia la aplicación en Coolify
2. O ejecuta `npm start` en desarrollo local

## 🔍 VERIFICACIÓN

### Logs esperados en consola del navegador:

```
🔍 Detectando entorno OAuth: {hostname: "v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io", protocol: "https:"}
⚠️ Entorno detectado: COOLIFY (DESARROLLO - FORZANDO HTTPS)
🔒 FORZANDO HTTPS para OAuth en Coolify
🔒 URL HTTPS forzada: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

### URL de redirección final esperada:
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

## ⚠️ IMPORTANTE

1. **HTTPS es obligatorio** para OAuth en producción
2. **Todas las URLs deben estar registradas** en Google Cloud Console
3. **El Client ID debe ser válido** (no los ejemplos placeholder)
4. **Variables de entorno correctas** en Coolify

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos:
- ✅ No más error `redirect_uri_mismatch`
- ✅ OAuth funciona correctamente
- ✅ Google Analytics se puede conectar
- ✅ Aplicación detecta correctamente el entorno

## 🚨 SI PERSISTE EL ERROR

Si después de seguir estos pasos el error persiste:

1. **Verifica que el Client ID sea real** (no `tu_client_id_aqui`)
2. **Confirma que todas las URLs estén registradas** en Google Cloud Console
3. **Revisa los logs de la consola** para ver la URL exacta que se está generando
4. **Asegúrate de que `REACT_APP_USE_COOLIFY_DOMAIN=true`** en Coolify

## 📞 SOPORTE

Si necesitas ayuda adicional:
1. Revisa los logs de la consola del navegador
2. Confirma que las URLs estén exactamente como se especifica
3. Verifica que el proyecto de Google Cloud esté activo