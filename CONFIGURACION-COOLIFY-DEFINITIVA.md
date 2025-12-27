# 🔧 CONFIGURACIÓN DEFINITIVA EN COOLIFY

## ⚠️ **PROBLEMAS DETECTADOS EN LA CONFIGURACIÓN ACTUAL**

Veo que hay **varios errores** en la configuración de Coolify que impiden que la app funcione correctamente:

---

## ❌ **ERRORES EN LA CONFIGURACIÓN ACTUAL:**

### **1. Puerto Incorrecto**
```
❌ Current: Ports Exposes = 3000
❌ Current: Ports Mappings = 3000:3000
✅ Should be: Ports Exposes = 3001
✅ Should be: Ports Mappings = 3001:3001
```
**Problema**: El servidor Express corre en puerto 3001, no 3000

### **2. Publish Directory Incorrecto**
```
❌ Current: Publish Directory = /
✅ Should be: Publish Directory = /build
```
**Problema**: Los archivos estáticos están en `/build`, no en `/`

### **3. Static Site Configuración**
```
❌ Current: Is it a static site? = No
✅ Should be: Is it a static site? = Yes
```
**Problema**: Es una SPA (Single Page Application)

---

## ✅ **CONFIGURACIÓN CORRECTA PARA COOLIFY:**

### **General Configuration:**
```
Name: brifyai-tv-radio
Description: TV and Radio Analytics Platform
Build Pack: Nixpacks ✅ (Correcto)
```

### **Domains:**
```
Domains: http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
Generate Domain: (Mantener el actual)
Direction: Allow www & non-www ✅ (Correcto)
```

### **Build Configuration:**
```
Install Command: (Dejar vacío - Nixpacks lo detecta automáticamente)
Build Command: (Dejar vacío - Nixpacks lo detecta automáticamente)
Start Command: (Dejar vacío - Nixpacks lo detecta automáticamente)
Base Directory: / ✅ (Correcto)
Publish Directory: /build ❌ CAMBIAR A ESTO
```

### **Network Configuration:**
```
Ports Exposes: 3001 ❌ CAMBIAR DE 3000 A 3001
Ports Mappings: 3001:3001 ❌ CAMBIAR DE 3000:3000 A 3001:3001
Network Aliases: (Dejar vacío)
```

### **Custom Docker Options:**
```
--cap-add SYS_ADMIN --device=/dev/fuse --security-opt apparmor:unconfined --ulimit nofile=1024:1024 --tmpfs /run:rw,noexec,nosuid,size=65536k --hostname=myapp
```
**Mantener como está** ✅

---

## 🎯 **PASOS PARA CORREGIR EN COOLIFY:**

### **Paso 1: Cambiar Publish Directory**
1. Ir a **Build** section
2. Cambiar **Publish Directory** de `/` a `/build`
3. Guardar cambios

### **Paso 2: Cambiar Puertos**
1. Ir a **Network** section
2. Cambiar **Ports Exposes** de `3000` a `3001`
3. Cambiar **Ports Mappings** de `3000:3000` a `3001:3001`
4. Guardar cambios

### **Paso 3: Configurar como Static Site**
1. En **Build Pack** section
2. Marcar **"Is it a static site?"** como **Yes**
3. Guardar cambios

---

## 📋 **CONFIGURACIÓN FINAL CORRECTA:**

```
✅ Build Pack: Nixpacks
✅ Is it a static site?: Yes
✅ Publish Directory: /build
✅ Ports Exposes: 3001
✅ Ports Mappings: 3001:3001
✅ Base Directory: /
✅ Direction: Allow www & non-www
```

---

## 🚀 **RESULTADO ESPERADO:**

Con esta configuración correcta:

1. **Nixpacks** detecta automáticamente que es una Node.js app
2. **Publish Directory** sirve archivos desde `/build`
3. **Puerto 3001** coincide con el servidor Express
4. **Static Site** configuración optimiza para SPA
5. **Coolify** expone correctamente el puerto 3001

---

## ⚡ **ACCIÓN INMEDIATA REQUERIDA:**

**Cambiar estos 3 valores en Coolify:**
1. **Publish Directory**: `/` → `/build`
2. **Ports Exposes**: `3000` → `3001`
3. **Ports Mappings**: `3000:3000` → `3001:3001`
4. **Is it a static site?**: `No` → `Yes`

**Una vez corregidos estos valores, la app debería funcionar correctamente.**

---

**Estado**: ⚠️ **CONFIGURACIÓN COOLIFY REQUIERE CORRECCIÓN**  
**Fecha**: 2025-12-27  
**Prioridad**: CRÍTICA - Aplicar inmediatamente