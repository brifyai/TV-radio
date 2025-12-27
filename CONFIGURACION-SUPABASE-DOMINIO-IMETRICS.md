# 🔐 CONFIGURACIÓN SUPABASE PARA DOMINIO imetrics.cl

## 📋 ¿HAY QUE HACER CAMBIOS EN SUPABASE?

**SÍ, ABSOLUTAMENTE.** Ahora que tienes el dominio **imetrics.cl** configurado, necesitas actualizar Supabase para que el login con Google funcione correctamente.

---

## 🎯 **CAMBIOS NECESARIOS EN SUPABASE**

### 🔍 **PASO 1: Acceder a tu proyecto Supabase**

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto iMetrics

### 🔍 **PASO 2: Configurar Authentication**

1. **En el menú lateral**, ve a "**Authentication**"
2. **Haz clic en "**Settings**"**
3. **Busca la sección "Site URL"**

---

## 🛠️ **CONFIGURACIONES ESPECÍFICAS**

### **1. Site URL (URL del Sitio)**

**Cambia esto:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

**Por esto:**
```
https://imetrics.cl
```

### **2. Redirect URLs (URLs de Redirección)**

**Elimina las URLs antiguas y agrega las nuevas:**

```
https://imetrics.cl/callback
https://www.imetrics.cl/callback
https://imetrics.cl/**
https://www.imetrics.cl/**
```

### **3. Additional Redirect URLs (Opcional pero recomendado)**

```
http://localhost:3000/callback  (para desarrollo local)
https://imetrics.cl/auth/callback
https://www.imetrics.cl/auth/callback
```

---

## 📝 **PASO A PASO DETALLADO**

### **PASO 1: Actualizar Site URL**
1. **En "Site URL"**, borra la URL actual
2. **Ingresa**: `https://imetrics.cl`
3. **Haz clic en "Save"**

### **PASO 2: Actualizar Redirect URLs**
1. **En "Redirect URLs"**, elimina todas las URLs antiguas
2. **Agrega estas URLs (una por línea):**
   ```
   https://imetrics.cl/callback
   https://www.imetrics.cl/callback
   https://imetrics.cl/**
   https://www.imetrics.cl/**
   ```
3. **Haz clic en "Save"**

### **PASO 3: Verificar configuración de Google Provider**
1. **Ve a "Authentication" → "Providers"**
2. **Busca "Google" y haz clic en el ícono de configuración**
3. **Verifica que "Enable sign in with Google" esté activado**
4. **Verifica que tu Google Client ID y Secret estén configurados**

---

## 🔧 **VARIABLES DE ENTORNO EN COOLIFY**

Asegúrate que en Coolify tengas estas variables:

```bash
# URL principal de la aplicación
REACT_APP_PUBLIC_URL=https://imetrics.cl

# URL de Supabase (no cambia)
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co

# Clave de Supabase (no cambia)
REACT_APP_SUPABASE_ANON_KEY=tu-clave-anon

# URL de callback para OAuth
REACT_APP_REDIRECT_URI=https://imetrics.cl/callback

# Google Client ID (no cambia)
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id
```

---

## 🧪 **VERIFICACIÓN POST-CONFIGURACIÓN**

### **Paso 1: Guardar y esperar**
1. **Guarda todos los cambios en Supabase**
2. **Espera 1-2 minutos** para que se propaguen los cambios

### **Paso 2: Probar el login**
1. **Abre tu aplicación**: https://imetrics.cl
2. **Intenta hacer login con Google**
3. **Verifica que te redirija correctamente**
4. **Verifica que el login se complete exitosamente**

### **Paso 3: Verificar URLs de callback**
1. **Durante el login**, observa las URLs en el navegador
2. **Deberías ver**: `https://imetrics.cl/callback`
3. **NO deberías ver**: URLs antiguas con sslip.io

---

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Problema 1: "Invalid redirect_uri"**
**Síntoma:** Error de Google durante el login
**Causa:** URL de callback no configurada correctamente
**Solución:** Verifica que `https://imetrics.cl/callback` esté en Supabase Y en Google Cloud Console

### **Problema 2: "Site URL mismatch"**
**Síntoma:** Error de Supabase durante el login
**Causa:** Site URL no coincide con el dominio actual
**Solución:** Actualiza Site URL a `https://imetrics.cl`

### **Problema 3: Login funciona pero redirige mal**
**Síntoma:** Login exitoso pero redirección incorrecta
**Causa:** Variables de entorno en Coolify con URLs antiguas
**Solución:** Actualiza `REACT_APP_PUBLIC_URL` y `REACT_APP_REDIRECT_URI`

---

## 📋 **CHECKLIST COMPLETO DE SUPABASE**

- [ ] Site URL actualizado a `https://imetrics.cl`
- [ ] Redirect URLs antiguas eliminadas
- [ ] Nuevas Redirect URLs agregadas:
  - [ ] `https://imetrics.cl/callback`
  - [ ] `https://www.imetrics.cl/callback`
  - [ ] `https://imetrics.cl/**`
  - [ ] `https://www.imetrics.cl/**`
- [ ] Google Provider configurado y activado
- [ ] Google Client ID y Secret correctos
- [ ] Variables de entorno en Coolify actualizadas
- [ ] Login con Google probado exitosamente

---

## 🔄 **FLUJO COMPLETO DE AUTENTICACIÓN**

**Después de la configuración, el flujo debería ser:**

1. **Usuario hace clic en "Login con Google"**
2. **Redirección a Google** (con `https://imetrics.cl/callback` como redirect_uri)
3. **Usuario autoriza en Google**
4. **Google redirige a**: `https://imetrics.cl/callback?code=...`
5. **Supabase procesa el callback**
6. **Usuario logueado exitosamente en imetrics.cl**

---

## 🎯 **RESUMEN EJECUTIVO**

**✅ Cambios obligatorios en Supabase:**
1. **Site URL**: `https://imetrics.cl`
2. **Redirect URLs**: `https://imetrics.cl/callback` y `https://www.imetrics.cl/callback`
3. **Wildcard URLs**: `https://imetrics.cl/**` y `https://www.imetrics.cl/**`

**⚠️ Si no haces estos cambios:**
- Login con Google no funcionará
- Redirecciones fallarán
- Usuarios no podrán autenticarse

**🔧 Variables de entorno en Coolify que debes actualizar:**
- `REACT_APP_PUBLIC_URL=https://imetrics.cl`
- `REACT_APP_REDIRECT_URI=https://imetrics.cl/callback`

**Una vez que hagas estos cambios, tu login con Google funcionará perfectamente con tu nuevo dominio imetrics.cl.** 🚀