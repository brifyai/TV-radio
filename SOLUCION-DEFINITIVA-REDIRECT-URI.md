# 🔧 Solución Definitiva para redirect_uri_mismatch

## 🚨 Problema Persistente:
```
Error 400: redirect_uri_mismatch
redirect_uri=http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

## ✅ Solución Definitiva (3 Pasos):

### **PASO 1: Crear Nuevo Client ID (RECOMENDADO)**

**1.1 Ir a Google Cloud Console:**
- https://console.cloud.google.com/
- APIs & Services > Credentials

**1.2 Crear nuevo OAuth 2.0 Client ID:**
- "+ CREATE CREDENTIALS" > "OAuth 2.0 Client ID"
- Application type: "Web application"
- Name: "TV Radio Analysis Coolify FIXED"

**1.3 Configurar URLs EXACTAS:**

**Authorized JavaScript origins:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

**Authorized redirect URIs:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/analytics-callback
```

**1.4 Copiar el nuevo Client ID:**
- Guardar el nuevo Client ID (termina en `.apps.googleusercontent.com`)

### **PASO 2: Actualizar la Aplicación**

**2.1 Crear archivo `.env.coolify`:**
```bash
REACT_APP_GOOGLE_CLIENT_ID=TU_NUEVO_CLIENT_ID_AQUI
REACT_APP_API_URL=/api
```

**2.2 Actualizar en Coolify:**
- Ir a la configuración del proyecto en Coolify
- Agregar variable de entorno: `REACT_APP_GOOGLE_CLIENT_ID`
- Valor: El nuevo Client ID copiado

### **PASO 3: Verificar y Probar**

**3.1 Esperar 5-10 minutos** para que los cambios se propaguen

**3.2 Probar el login:**
- Acceder a: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
- Intentar login con Google
- Debería funcionar sin errores

## 🔍 Verificación Adicional:

### **Si el problema persiste, verificar:**

**A. URLs en Google Cloud Console:**
- ✅ Authorized JavaScript origins: `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io`
- ✅ Authorized redirect URIs: `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback`

**B. Dominios autorizados:**
- ✅ sslip.io
- ✅ uwbxyaszdqwypbebogvw.supabase.co

**C. Client ID en la aplicación:**
- ✅ Debe coincidir exactamente con el nuevo Client ID

## 🆘 Solución de Emergencia:

### **Si nada funciona, usar HTTP:**

**En Google Cloud Console, agregar también:**

**Authorized JavaScript origins:**
```
http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

**Authorized redirect URIs:**
```
http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/analytics-callback
```

## ⚠️ Importante:
- **Usar el nuevo Client ID** (no el anterior)
- **Esperar 5-10 minutos** después de crear el Client ID
- **Verificar** que el Client ID se actualice en Coolify
- **Limpiar caché** del navegador si es necesario

## 🎯 Resultado Esperado:
Después de estos 3 pasos, el error `redirect_uri_mismatch` debería desaparecer completamente y el OAuth funcionar correctamente.

---

**Estado:** ✅ Solución definitiva documentada
**Acción:** Crear nuevo Client ID con URLs exactas