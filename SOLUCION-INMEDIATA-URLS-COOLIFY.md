# 🚨 SOLUCIÓN INMEDIATA: AGREGAR URLs DE COOLIFY A GOOGLE CLOUD CONSOLE

## 📋 PROBLEMA IDENTIFICADO

**Tu configuración actual en Google Cloud Console:**
- ✅ `https://imetrics.cl/callback`
- ✅ `https://www.imetrics.cl/callback`

**Pero la aplicación está corriendo en:**
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback`

**Por eso el error:** `redirect_uri_mismatch`

## ✅ SOLUCIÓN INMEDIATA

### Paso 1: Agregar URLs de Coolify a Google Cloud Console

En **URIs de redireccionamiento autorizados**, AGREGAR estas URLs:

```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback
```

### Paso 2: Configuración final en Google Cloud Console

**Orígenes autorizados de JavaScript:**
```
https://imetrics.cl
https://www.imetrics.cl
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

**URIs de redireccionamiento autorizados:**
```
https://imetrics.cl/callback
https://www.imetrics.cl/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback
```

## 🎯 RESULTADO ESPERADO

Después de agregar las URLs de Coolify:
- ✅ La aplicación podrá usar OAuth sin error `redirect_uri_mismatch`
- ✅ Funcionará tanto en Coolify como en imetrics.cl
- ✅ Google Analytics se podrá conectar correctamente

## ⚠️ IMPORTANTE

1. **Guardar los cambios** en Google Cloud Console
2. **Esperar 5-10 minutos** para que se propaguen
3. **Probar la conexión** de Google Analytics

---

**🎯 Esta es la solución más directa: agregar las URLs del dominio actual (Coolify) a Google Cloud Console.**