# 🚨 ERROR: undefined variable 'nodejs-20_x'

## ❌ **NUEVO PROBLEMA IDENTIFICADO:**

```
error: undefined variable 'nodejs-20_x'
at /app/.nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:9:
```

**El problema está en la especificación de Node.js en nixpacks.toml - `nodejs-20_x` no es una variable válida en Nix.**

---

## 🔍 **CAUSA DEL ERROR:**

### **Sintaxis Incorrecta:**
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x"]  # ← ESTO ES INCORRECTO
```

### **Sintaxis Correcta:**
```toml
[variables]
NIXPACKS_NODE_VERSION = "20"  # ← ASÍ ES CORRECTO
```

---

## ✅ **SOLUCIÓN INMEDIATA:**

### **Corregir nixpacks.toml:**
```toml
[phases.build]
cmds = ["echo 'Build completed'"]

[phases.start]
cmds = ["node", "server.js"]

[variables]
NIXPACKS_NODE_VERSION = "20"
NODE_ENV = "development"
PORT = "3001"
```

### **Cambios realizados:**
1. **Eliminar** `nixPkgs = ["nodejs-20_x"]` de `[phases.setup]`
2. **Agregar** `NIXPACKS_NODE_VERSION = "20"` en `[variables]`

---

## 🎯 **EXPLICACIÓN DEL ERROR:**

### **Por qué falló:**
- **Nixpacks** genera un archivo Nix automáticamente
- **`nodejs-20_x`** no es una variable válida en Nix
- **NIXPACKS_NODE_VERSION** es la forma correcta de especificar la versión

### **Métodos alternativos:**
```toml
# Opción 1: Especificar versión en variables
[variables]
NIXPACKS_NODE_VERSION = "20"

# Opción 2: Dejar que Nixpacks detecte automáticamente
# (Eliminar nixPkgs completamente)

# Opción 3: Usar package.json engines
# "engines": { "node": "20.x" }
```

---

## 🚀 **ACCIONES REQUERIDAS:**

### **1. Corregir nixpacks.toml:**
```toml
[phases.build]
cmds = ["echo 'Build completed'"]

[phases.start]
cmds = ["node", "server.js"]

[variables]
NIXPACKS_NODE_VERSION = "20"
NODE_ENV = "development"
PORT = "3001"
```

### **2. Hacer commit y push:**
```bash
git add nixpacks.toml
git commit -m "Corregir nixpacks.toml: nodejs-20_x → NIXPACKS_NODE_VERSION=20"
git push origin main
```

### **3. Redesplegar en Coolify:**
- El despliegue debería funcionar correctamente
- Nixpacks usará Node.js 20
- La app se construirá y ejecutará sin errores

---

## 📋 **CHECKLIST DE VERIFICACIÓN:**

- [ ] ✅ nixpacks.toml corregido
- [ ] ✅ Eliminado: `nixPkgs = ["nodejs-20_x"]`
- [ ] ✅ Agregado: `NIXPACKS_NODE_VERSION = "20"`
- [ ] ✅ Git commit y push realizado
- [ ] ✅ Redespliegue en Coolify iniciado

---

## 🎉 **RESULTADO ESPERADO:**

Con la sintaxis corregida:
- ✅ Nixpacks detectará Node.js 20 correctamente
- ✅ Build se ejecutará sin errores de variables undefined
- ✅ La app se desplegará exitosamente
- ✅ El servidor Express iniciará en puerto 3001

---

**Estado**: 🚨 **ERROR IDENTIFICADO Y SOLUCIONADO**  
**Fecha**: 2025-12-27  
**Acción**: Corregir nixpacks.toml y redesplegar