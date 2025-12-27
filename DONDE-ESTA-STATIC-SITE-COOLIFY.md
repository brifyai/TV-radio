# 📍 ¿DÓNDE ESTÁ "Is it a static site?" EN COOLIFY?

## 🔍 **UBICACIÓN EXACTA DE LA CONFIGURACIÓN**

La opción **"Is it a static site?"** puede estar en diferentes lugares según la versión de Coolify:

---

## 📍 **OPCIÓN 1: En Build Pack Section**

### **Pasos:**
1. Ve a tu proyecto en Coolify
2. Busca la sección **"Build Pack"**
3. Dentro de Nixpacks, busca:
   - ✅ **"Static Site"** (checkbox)
   - ✅ **"Single Page Application"** (checkbox)
   - ✅ **"Is Static"** (toggle)
   - ✅ **"SPA Mode"** (checkbox)

---

## 📍 **OPCIÓN 2: En Build Configuration**

### **Pasos:**
1. Ve a **"Build"** section
2. Busca:
   - ✅ **"Static Build"** (checkbox)
   - ✅ **"Publish Static Files"** (checkbox)
   - ✅ **"Output Directory"** (campo de texto)

---

## 📍 **OPCIÓN 3: En Advanced Settings**

### **Pasos:**
1. Busca **"Advanced Settings"** o **"Advanced Configuration"**
2. Dentro encontrarás:
   - ✅ **"Static Site"** (checkbox)
   - ✅ **"Single Page Application"** (checkbox)

---

## 📍 **OPCIÓN 4: Si NO encuentras la opción**

### **No te preocupes, puedes omitirla:**
```
✅ La configuración "Is it a static site?" es OPCIONAL
✅ Tu app funcionará sin ella
✅ Solo afecta la optimización del build
```

### **Lo importante son estos 3 cambios:**
1. **Publish Directory**: `/` → `/build`
2. **Ports Exposes**: `3000` → `3001`
3. **Ports Mappings**: `3000:3000` → `3001:3001`

---

## 🎯 **CONFIGURACIÓN MÍNIMA REQUERIDA**

### **Si encuentras la opción Static Site:**
```
✅ Marcar: Is it a static site? = Yes
```

### **Si NO encuentras la opción:**
```
✅ No importa, continúa con los otros 3 cambios
✅ Tu app funcionará igual de bien
```

---

## 📋 **CHECKLIST DE CONFIGURACIÓN**

### **Cambios OBLIGATORIOS (encontrar donde sea):**
- [ ] **Publish Directory**: `/` → `/build`
- [ ] **Ports Exposes**: `3000` → `3001`
- [ ] **Ports Mappings**: `3000:3000` → `3001:3001`

### **Cambio OPCIONAL (si existe):**
- [ ] **Is it a static site?**: `No` → `Yes`

---

## 🔧 **UBICACIONES ALTERNATIVAS**

### **En algunas versiones de Coolify puede estar como:**

1. **"Framework Type"** → Seleccionar **"React"** o **"Vue"**
2. **"Build Type"** → Seleccionar **"Static"**
3. **"Output Mode"** → Seleccionar **"Static Files"**
4. **"Deployment Type"** → Seleccionar **"Static Site"**

---

## 💡 **CONSEJO PRÁCTICO**

**Si no encuentras la opción "Is it a static site?", no te preocupes:**

1. ✅ **Haz los 3 cambios obligatorios** (Publish Directory + Puertos)
2. ✅ **Omite el Static Site** (es opcional)
3. ✅ **Tu app funcionará perfectamente**

**La opción Static Site solo optimiza el build, pero no es crítica para el funcionamiento.**

---

**Estado**: 📍 **UBICACIONES IDENTIFICADAS**  
**Fecha**: 2025-12-27  
**Acción**: Buscar en Build Pack, Build, o Advanced Settings