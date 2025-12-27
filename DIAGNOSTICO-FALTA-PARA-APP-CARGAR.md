# 🔍 DIAGNÓSTICO: ¿QUÉ FALTA PARA QUE LA APP CARGUE EN IMETRICS.CL?

## 🎯 Problemas Identificados que Impiden Cargar la App

### **1. ❌ Configuración Nixpacks Inválida**
```toml
# nixpacks.toml - LÍNEA 2 (PROBLEMA)
nixPkgs = ["...", "nodejs-20_x"]  # ← "..." es inválido
```
**Problema**: Nixpacks no puede procesar esta configuración  
**Solución**: Cambiar a `nixPkgs = ["nodejs-20_x"]`

### **2. ❌ Build de React en Producción**
```toml
# nixpacks.toml - LÍNEA 5 (PROBLEMA)
cmds = ["npm run build"]  # ← Esto causa errores en Coolify
```
**Problema**: Intenta hacer build de React en el contenedor  
**Solución**: Eliminar esta línea, el build debe hacerse localmente

### **3. ❌ Variables de Entorno Incorrectas**
```bash
# .env.coolify - LÍNEA 16 (PROBLEMA)
REACT_APP_API_URL=http://localhost:3001  # ← URL local, no producción
```
**Problema**: La app intenta conectar a localhost en producción  
**Solución**: Cambiar a `https://imetrics.cl`

### **4. ❌ URLs OAuth No Configuradas para imetrics.cl**
```bash
# .env.coolify - LÍNEAS 20-22 (PROBLEMA)
REACT_APP_REDIRECT_URI_LOCAL=http://localhost:3000/callback
REACT_APP_REDIRECT_URI_COOLIFY=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
REACT_APP_REDIRECT_URI_NETLIFY=https://tvradio2.netlify.app/callback
# ← Falta: REACT_APP_REDIRECT_URI_DOMAIN para imetrics.cl
```
**Problema**: No hay URL de redirección configurada para el dominio propio  
**Solución**: Agregar `REACT_APP_REDIRECT_URI_DOMAIN=https://imetrics.cl/callback`

### **5. ❌ Falta Build de React**
**Problema**: El servidor Express busca archivos en `/build` pero no existen  
**Solución**: Hacer build local y subir los archivos

---

## ✅ SOLUCIONES APLICAR

### **Paso 1: Corregir nixpacks.toml**
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x"]  # ← Eliminar "..."

[phases.build]
cmds = ["echo 'Build phase completed'"]  # ← Omitir npm run build

[start]
cmd = "node server.js"

[variables]
NODE_ENV = "development"
PORT = "3001"
```

### **Paso 2: Actualizar Variables de Entorno**
```bash
# .env.coolify - ACTUALIZAR
REACT_APP_API_URL=https://imetrics.cl  # ← URL de producción
REACT_APP_REDIRECT_URI_DOMAIN=https://imetrics.cl/callback  # ← NUEVA
REACT_APP_PUBLIC_URL=https://imetrics.cl  # ← NUEVA
```

### **Paso 3: Hacer Build de React**
```bash
# En local, ANTES de subir a Coolify
npm run build
```
Esto crea la carpeta `/build` con los archivos estáticos.

### **Paso 4: Verificar Configuración OAuth**
En Google Cloud Console, agregar:
```
https://imetrics.cl/callback
```

---

## 🔧 CONFIGURACIÓN FINAL CORRECTA

### **nixpacks.toml**
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x"]

[phases.build]
cmds = ["echo 'Build completed'"]

[start]
cmd = "node server.js"

[variables]
NODE_ENV = "development"
PORT = "3001"
```

### **.env.coolify**
```bash
# Google Analytics
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_real
REACT_APP_MEASUREMENT_ID=G-XXXXXXXXXX

# Supabase
REACT_APP_SUPABASE_URL=tu_supabase_url_real
REACT_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key_real

# URLs de producción
REACT_APP_API_URL=https://imetrics.cl
REACT_APP_PUBLIC_URL=https://imetrics.cl
REACT_APP_REDIRECT_URI_DOMAIN=https://imetrics.cl/callback

# OAuth URLs
REACT_APP_REDIRECT_URI_LOCAL=http://localhost:3000/callback
REACT_APP_REDIRECT_URI_COOLIFY=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
REACT_APP_REDIRECT_URI_NETLIFY=https://tvradio2.netlify.app/callback
```

---

## 🚀 FLUJO DE DESPLIEGUE CORRECTO

### **1. Local (Desarrollo)**
```bash
npm run build  # ← Crear carpeta /build
git add .
git commit -m "Build de React para producción"
git push origin main
```

### **2. Coolify (Producción)**
```bash
# Coolify detecta el push y:
1. Instala Node.js 20.18.x
2. Ejecuta: echo 'Build completed'
3. Inicia servidor: node server.js
4. Sirve archivos desde /build
5. Expone puerto 3001 → https://imetrics.cl
```

### **3. Verificación**
```bash
# Probar que funciona:
curl https://imetrics.cl/api/health
# Debe retornar: {"status": "ok", ...}

# Probar que carga la app:
curl https://imetrics.cl
# Debe retornar el HTML de React
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### **Antes del Despliegue:**
- [ ] ✅ nixpacks.toml corregido (sin "...")
- [ ] ✅ npm run build ejecutado localmente
- [ ] ✅ Carpeta /build creada con archivos
- [ ] ✅ Variables de entorno actualizadas
- [ ] ✅ URLs OAuth configuradas en Google Console

### **Después del Despliegue:**
- [ ] ✅ https://imetrics.cl carga la aplicación
- [ ] ✅ https://imetrics.cl/api/health responde
- [ ] ✅ OAuth funciona sin errores
- [ ] ✅ Google Analytics se conecta correctamente

---

## 🎯 RESUMEN DE LO QUE FALTA

**Los 5 problemas principales que impiden que la app cargue:**

1. **Configuración Nixpacks inválida** ("..." en nixPkgs)
2. **Build de React en producción** (debe hacerse localmente)
3. **API_URL apuntando a localhost** (debe ser imetrics.cl)
4. **Falta URL OAuth para dominio propio** (agregar redirect_uri)
5. **No existe carpeta /build** (hacer build local)

**Una vez corregidos estos 5 puntos, la app cargará correctamente en https://imetrics.cl**

---

**Estado**: ✅ Diagnóstico completo  
**Fecha**: 2025-12-27  
**Prioridad**: CRÍTICA - Aplicar inmediatamente