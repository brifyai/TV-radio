# 🚨 Solución Error redirect_uri_mismatch

## ❌ Error Reportado:
```
Error 400: redirect_uri_mismatch
redirect_uri=http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

## 🔍 Diagnóstico del Problema:

### **Posibles Causas:**
1. **Tiempo de propagación:** Google puede tardar hasta 30 minutos
2. **Client ID incorrecto:** Usando un Client ID diferente al configurado
3. **URL exacta:** Caracteres especiales o formato incorrecto
4. **Múltiples Client IDs:** Confusión entre diferentes configuraciones

## ✅ Soluciones Inmediatas:

### **Solución 1: Verificar Client ID Exacto**

**En Google Cloud Console:**
1. Ir a **APIs & Services > Credentials**
2. **Verificar que estás editando el Client ID correcto**
3. **Copiar el Client ID exacto** (debería terminar en `.apps.googleusercontent.com`)

**En tu aplicación:**
```javascript
// Verificar que el Client ID coincida exactamente
console.log('Client ID configurado:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
```

### **Solución 2: URLs Exactas en Google Cloud Console**

**Authorized JavaScript origins (exactamente así):**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

**Authorized redirect URIs (exactamente así):**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

### **Solución 3: Esperar Propagación**

**Si acabas de hacer cambios:**
- **Esperar 15-30 minutos** para que Google propague los cambios
- **Reintentar el login** después del tiempo de espera

### **Solución 4: Crear Nuevo Client ID**

**Si nada funciona, crear uno nuevo:**

1. **Google Cloud Console > APIs & Services > Credentials**
2. **"+ CREATE CREDENTIALS" > "OAuth 2.0 Client ID"**
3. **Application type:** "Web application"
4. **Name:** "TV Radio Analysis Coolify Fixed"
5. **Authorized JavaScript origins:**
   ```
   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
   ```
6. **Authorized redirect URIs:**
   ```
   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
   ```
7. **Guardar y usar el nuevo Client ID**

### **Solución 5: Verificar Configuración de la Aplicación**

**En el código, verificar que la URL se genere correctamente:**

```javascript
// En googleAnalyticsService.js, línea ~72
const redirectUri = getRedirectUri(); // Debería ser: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback

// Debug: verificar qué URL se está enviando
console.log('Redirect URI generado:', redirectUri);
```

## 🔧 Verificación Paso a Paso:

### **Paso 1: Verificar URLs en Google Cloud Console**
- ✅ Authorized JavaScript origins: `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io`
- ✅ Authorized redirect URIs: `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback`

### **Paso 2: Verificar Client ID**
- ✅ Copiar el Client ID exacto de Google Cloud Console
- ✅ Verificar que coincida con `REACT_APP_GOOGLE_CLIENT_ID`

### **Paso 3: Verificar en el Navegador**
1. **F12 > Console**
2. **Buscar el mensaje:** "Redirect URI generado:"
3. **Verificar que coincida exactamente** con lo registrado

### **Paso 4: Esperar y Reintentar**
- ✅ Esperar 15-30 minutos después de cambios
- ✅ Limpiar caché del navegador
- ✅ Reintentar login

## ⚠️ Importante:
- **NO usar** URLs con `http://` (solo `https://`)
- **NO usar** URLs con `www.` (solo el dominio directo)
- **Verificar** que no haya espacios o caracteres especiales
- **Confirmar** que el Client ID sea el correcto

## 🎯 Resultado Esperado:
Después de aplicar estas soluciones, el error `redirect_uri_mismatch` debería desaparecer y el OAuth funcionar correctamente.

---

**Estado:** ✅ Solución documentada
**Acción:** Verificar Client ID y URLs exactas en Google Cloud Console