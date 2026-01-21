# 🌐 CONFIGURACIÓN DOMINIOS AUTORIZADOS DE GOOGLE

## 📋 ¿QUÉ PONER EN "DOMINIOS AUTORIZADOS"?

**Esta sección es para la pantalla de consentimiento de Google** donde aparece el nombre de tu aplicación cuando los usuarios inician sesión.

---

## 🎯 **CONFIGURACIÓN RECOMENDADA**

### **Dominio autorizado 1:** `imetrics.cl`
### **Dominio autorizado 2:** `www.imetrics.cl`

**Los otros campos puedes dejarlos vacíos por ahora.**

---

## 🔍 **¿QUÉ ES ESTA SECCIÓN?**

**Propósito:** 
- Aparece en la pantalla de consentimiento de Google
- Muestra a los usuarios qué dominio está autorizado para solicitar acceso
- Es una capa de seguridad adicional

**Importancia:**
- **Media**: No crítica para el funcionamiento del login
- **Seguridad**: Confirma que eres dueño del dominio
- **Profesionalismo**: Muestra tu dominio real en lugar de URLs temporales

---

## 🔧 **CONFIGURACIÓN COMPLETA**

### **Opción 1: Configuración Mínima (Recomendada)**
```
Dominio autorizado 1: imetrics.cl
Dominio autorizado 2: www.imetrics.cl
Dominio autorizado 3: (dejar vacío)
Dominio autorizado 4: (dejar vacío)
```

### **Opción 2: Configuración Completa (Si tienes más dominios)**
```
Dominio autorizado 1: imetrics.cl
Dominio autorizado 2: www.imetrics.cl
Dominio autorizado 3: api.imetrics.cl (si lo vas a usar)
Dominio autorizado 4: (dejar vacío)
```

---

## 🚨 **¿QUÉ DOMINIOS ELIMINAR?**

**Elimina estos dominios si los tienes:**
- Cualquier dominio con `sslip.io`
- Cualquier dominio con IPs directas
- Dominios de desarrollo como `localhost`
- Subdominios temporales

**Ejemplos que debes eliminar:**
```
❌ v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
❌ 147.93.182.94.sslip.io
❌ localhost
❌ 127.0.0.1
```

---

## 🔄 **VERIFICACIÓN DE DOMINIO**

### **¿Necesitas verificar el dominio?**

**Generalmente NO, si:**
- El dominio es público y accesible
- Tienes control sobre el DNS
- No requiere verificación especial

**Sí, si Google te pide verificar:**
1. Ve a **Google Search Console**
2. Agrega tu dominio `imetrics.cl`
3. Verifica ownership (DNS, HTML file, etc.)
4. Vuelve a Google Cloud Console

---

## 📱 **CÓMO SE VE EN LA PANTALLA DE CONSENTIMIENTO**

**Con la configuración correcta, los usuarios verán:**

```
"imetrics.cl" solicita acceso a:
• Ver tu dirección de correo electrónico
• Ver tu información básica del perfil
```

**En lugar de:**
```
"v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io" solicita acceso...
```

---

## 🛠️ **PASO A PASO PARA CONFIGURAR**

### **Paso 1: Limpiar dominios antiguos**
1. **Elimina** cualquier dominio con `sslip.io`
2. **Elimina** dominios de desarrollo
3. **Elimina** IPs directas

### **Paso 2: Agregar dominios nuevos**
1. **Dominio autorizado 1:** `imetrics.cl`
2. **Dominio autorizado 2:** `www.imetrics.cl`
3. **Deja los demás vacíos** (o agrega `api.imetrics.cl` si lo necesitas)

### **Paso 3: Guardar cambios**
1. **Haz clic en "Save"**
2. **Espera unos minutos** para que se propaguen

---

## 🧪 **VERIFICACIÓN POST-CONFIGURACIÓN**

### **Para verificar que funciona:**
1. **Intenta hacer login con Google**
2. **Observa la pantalla de consentimiento**
3. **Debería mostrar "imetrics.cl"** como el solicitante

### **Si ves errores:**
- **"Domain not authorized"**: Agrega el dominio faltante
- **"Verification required"**: Ve a Google Search Console
- **"Invalid domain"**: Verifica spelling y formato

---

## 📋 **CHECKLIST COMPLETO**

- [ ] **Dominios antiguos eliminados** (sslip.io, localhost, etc.)
- [ ] **Dominio autorizado 1:** `imetrics.cl`
- [ ] **Dominio autorizado 2:** `www.imetrics.cl`
- [ ] **Dominios adicionales** configurados si es necesario
- [ ] **Cambios guardados**
- [ ] **Pantalla de consentimiento verificada**
- [ ] **Login con Google probado**

---

## 🎯 **RESUMEN EJECUTIVO**

### **✅ CONFIGURACIÓN MÍNIMA NECESARIA:**
```
Dominio autorizado 1: imetrics.cl
Dominio autorizado 2: www.imetrics.cl
```

### **❌ LO QUE DEBES EVITAR:**
- Dominios con `sslip.io`
- IPs directas
- Dominios de localhost

### **🎯 BENEFICIOS DE ESTA CONFIGURACIÓN:**
- Pantalla de consentimiento profesional
- Mayor confianza del usuario
- Cumplimiento con políticas de Google
- Mejor experiencia de usuario

---

## 🔄 **ORDEN FINAL DE CONFIGURACIÓN**

**Para completar todo tu OAuth 2.0:**

1. ✅ **Dominios autorizados**: `imetrics.cl`, `www.imetrics.cl`
2. ✅ **JavaScript Origins**: `https://imetrics.cl`, `https://www.imetrics.cl`
3. ✅ **Redirect URIs**: `https://imetrics.cl/callback`, `https://www.imetrics.cl/callback`

**Con estas tres secciones configuradas correctamente, tu OAuth 2.0 será profesional y funcional.** 🚀