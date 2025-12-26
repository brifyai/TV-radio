# 🔧 Configuración de Supabase para Coolify

## 🚨 Problema Identificado:
En Supabase tienes configuradas las URLs de Netlify:
- **Site URL:** https://tvradio2.netlify.app
- **Redirect URLs:** https://tvradio2.netlify.app/callback

Pero el sistema está desplegado en **Coolify**, no en Netlify.

## ✅ Solución: Configurar Supabase para Coolify

### **Paso 1: Ir a Supabase Dashboard**
1. https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Ir a **Settings > Authentication**

### **Paso 2: Actualizar Site URL**
**Cambiar de:**
```
https://tvradio2.netlify.app
```

**A:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### **Paso 3: Actualizar Redirect URLs**
**Eliminar las URLs de Netlify:**
- ❌ https://tvradio2.netlify.app/callback
- ❌ https://tvradio2.netlify.app/**

**Agregar las URLs de Coolify:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/**
```

### **Paso 4: Configuración Final en Supabase**

**Site URL:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

**Redirect URLs:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/**
```

### **Paso 5: Guardar Cambios**
1. Hacer clic en **"Save"**
2. **Esperar 2-3 minutos** para que los cambios se propaguen

## 🔄 Configuración Completa OAuth:

### **1. Google Cloud Console (ya configurado):**
- ✅ Authorized JavaScript origins
- ✅ Authorized redirect URIs

### **2. Supabase (por configurar):**
- ✅ Site URL actualizado
- ✅ Redirect URLs actualizadas

### **3. Sistema (ya configurado):**
- ✅ Detección automática de entorno
- ✅ URLs dinámicas

## ⚠️ Importante:
- **Eliminar completamente** las URLs de Netlify de Supabase
- **Usar únicamente** las URLs de Coolify
- **Esperar 2-3 minutos** después de guardar
- **Probar el login** después de la configuración

## 🎯 Resultado Esperado:
Después de configurar Supabase correctamente:
1. El OAuth funcionará sin errores
2. El login con Google funcionará
3. El sistema de análisis estará completamente operativo

---

**Estado:** ✅ Solución documentada
**Acción:** Configurar URLs de Coolify en Supabase