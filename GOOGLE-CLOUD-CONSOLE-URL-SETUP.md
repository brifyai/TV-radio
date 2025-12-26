# 📋 Configuración Exacta de URLs en Google Cloud Console

## 🎯 Ubicaciones donde agregar las URLs de Coolify

### **1. Orígenes autorizados de JavaScript (Authorized JavaScript origins)**
**Agregar estas URLs:**

```
# URLs existentes (mantener)
http://localhost:3000
https://localhost:3000
https://tvradio2.netlify.app

# ✅ AGREGAR ESTA URL DE COOLIFY:
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### **2. URIs de redireccionamiento autorizados (Authorized redirect URIs)**
**Agregar estas URLs:**

```
# URLs existentes (mantener)
https://uwbxyaszdqwypbebogvw.supabase.co/auth/v1/callback
http://localhost:3000/analytics-callback
https://tvradio2.netlify.app/callback

# ✅ AGREGAR ESTAS URLS DE COOLIFY:
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/analytics-callback
```

## 🔧 Pasos para Configurar:

### **Paso 1: Ir a Google Cloud Console**
1. https://console.cloud.google.com/
2. Ir a **APIs & Services > Credentials**

### **Paso 2: Editar tu OAuth 2.0 Client ID**
1. Hacer clic en tu **Client ID** existente
2. Hacer clic en **"Edit"** (editar)

### **Paso 3: Agregar URLs en "Authorized JavaScript origins"**
En la sección **"Authorized JavaScript origins"**, agregar:
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### **Paso 4: Agregar URLs en "Authorized redirect URIs"**
En la sección **"Authorized redirect URIs"**, agregar:
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/analytics-callback
```

### **Paso 5: Guardar cambios**
1. Hacer clic en **"Save"**
2. Esperar 5-10 minutos para que los cambios se propaguen

## ✅ Configuración Final Completa:

### **Authorized JavaScript origins:**
```
http://localhost:3000
https://localhost:3000
https://tvradio2.netlify.app
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### **Authorized redirect URIs:**
```
https://uwbxyaszdqwypbebogvw.supabase.co/auth/v1/callback
http://localhost:3000/analytics-callback
https://tvradio2.netlify.app/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/analytics-callback
```

## 🚨 Importante:
- **NO eliminar** las URLs existentes
- **SÍ agregar** las URLs de Coolify
- **Esperar 5-10 minutos** después de guardar
- **Probar el OAuth** en Coolify después de la configuración

---

**Estado**: ✅ Instrucciones detalladas proporcionadas
**Acción**: Agregar URLs en Google Cloud Console
