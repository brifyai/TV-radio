# 🔧 Configuración OAuth para Coolify - Error 400: redirect_uri_mismatch

## 🚨 Problema Identificado
El error `Error 400: redirect_uri_mismatch` ocurre porque:
- La aplicación usa `window.location.origin` para la URL de redirección OAuth
- En Coolify, la URL base es diferente a la configurada en Google Cloud Console
- Google OAuth requiere que la URL de redirección esté exactamente autorizada

## 🔧 Solución Implementada

### 1. **Configuración de URLs de Redirección Múltiples**
En Google Cloud Console, agregar estas URLs autorizadas:

```
# URLs de desarrollo local
http://localhost:3000/callback
http://localhost:3001/callback
http://127.0.0.1:3000/callback

# URLs de Coolify (reemplazar con tu dominio real)
https://tu-proyecto.coolify.app/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback

# URLs de Netlify (si aplica)
https://tvradio2.netlify.app/callback
```

### 2. **Variables de Entorno para URLs Dinámicas**
```env
# URLs de redirección autorizadas
REACT_APP_REDIRECT_URI_LOCAL=http://localhost:3000/callback
REACT_APP_REDIRECT_URI_COOLIFY=https://tu-dominio-coolify.app/callback
REACT_APP_REDIRECT_URI_NETLIFY=https://tvradio2.netlify.app/callback

# Configuración de entorno
REACT_APP_ENVIRONMENT=production
REACT_APP_DOMAIN_COOLIFY=tu-dominio-coolify.app
```

### 3. **Detección Automática de Entorno**
El sistema detectará automáticamente el entorno y usará la URL correcta.

## 🎯 Configuración en Google Cloud Console

### Pasos para Configurar OAuth:

1. **Ir a Google Cloud Console**
   - https://console.cloud.google.com/

2. **Navegar a APIs & Services > Credentials**
   - Seleccionar tu proyecto OAuth 2.0

3. **Editar las URLs de redirección autorizadas**
   - Agregar todas las URLs mencionadas arriba
   - Incluir tanto HTTP como HTTPS

4. **Guardar cambios**

## 🔄 URLs que Necesitas Configurar

### Para Desarrollo Local:
```
http://localhost:3000/callback
http://localhost:3001/callback
```

### Para Coolify (reemplazar con tu dominio real):
```
https://tu-proyecto.coolify.app/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

### Para Netlify (si aplicara):
```
https://tvradio2.netlify.app/callback
```

## ✅ Verificación

Después de configurar las URLs, el OAuth debería funcionar correctamente en todos los entornos sin el error `redirect_uri_mismatch`.

## 🚨 Importante
- Las URLs deben coincidir exactamente (incluyendo https://)
- No incluir barras diagonales adicionales al final
- Verificar que el dominio de Coolify esté configurado correctamente

---

**Estado**: ✅ Solución documentada
**Acción requerida**: Configurar URLs en Google Cloud Console
