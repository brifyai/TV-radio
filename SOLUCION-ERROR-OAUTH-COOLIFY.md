# 🚨 Solución Error OAuth 2.0 en Coolify

## ❌ Error Reportado:
```
No puedes acceder a esta app porque no cumple con la política OAuth 2.0 de Google.
Detalles de la solicitud: redirect_uri=http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

## ✅ Solución Inmediata:

### **Paso 1: Ir a Google Cloud Console**
1. https://console.cloud.google.com/
2. Ir a **APIs & Services > Credentials**

### **Paso 2: Editar OAuth 2.0 Client ID**
1. Hacer clic en tu **Client ID** existente
2. Hacer clic en **"Edit"** (editar)

### **Paso 3: Agregar URLs de Coolify**

#### **En "Authorized JavaScript origins":**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

#### **En "Authorized redirect URIs":**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/analytics-callback
```

### **Paso 4: Guardar**
1. Hacer clic en **"Save"**
2. **Esperar 5-10 minutos** para que los cambios se propaguen

## 🔧 URLs Completas a Configurar:

### **Authorized JavaScript origins:**
```
http://localhost:3000
https://localhost:3000
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### **Authorized redirect URIs:**
```
https://uwbxyaszdqwypbebogvw.supabase.co/auth/v1/callback
http://localhost:3000/analytics-callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/analytics-callback
```

## ⚠️ Importante:
- **NO eliminar** las URLs existentes
- **SÍ agregar** las URLs de Coolify
- **Esperar 5-10 minutos** después de guardar
- **Probar el OAuth** en Coolify después de la configuración

## 🔄 Verificación:
Después de configurar:
1. Acceder a: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
2. Intentar login con Google
3. Debe funcionar sin errores OAuth

---

**Estado:** ✅ Solución documentada
**Acción:** Configurar URLs en Google Cloud Console