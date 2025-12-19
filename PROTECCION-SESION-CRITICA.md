# 🔒 PROTECCIÓN CRÍTICA - SESIÓN DE USUARIO

## ⚠️ ADVERTENCIA IMPORTANTE

**ESTA FUNCIONALIDAD ES CRÍTICA Y NO DEBE SER MODIFICADA NUNCA**

### **Problema Resuelto:**
- Cuando un usuario inicia sesión con `camiloalegriabarra@gmail.com` y conecta Google Analytics con `camilo@origencomunicaciones.cl`, la sesión original se mantenía intacta
- La solución impide que Supabase OAuth modifique la sesión del usuario principal

### **Archivos PROTEGIDOS - NO MODIFICAR:**

#### **1. src/contexts/AuthContext.js** 
- Líneas 50-70: Protección contra cambios de sesión durante OAuth
- Líneas 120-140: Listener que previene cambios no autorizados
- **NO TOCAR NUNCA**

#### **2. src/contexts/GoogleAnalyticsContext.js**
- Líneas 230-250: Detección y prevención de cambios de usuario
- Líneas 277-300: Manejo de errores con protección de sesión
- **NO TOCAR NUNCA**

#### **3. src/services/googleAnalyticsService.js**
- Función `retryWithBackoff`: Manejo robusto de errores
- Método `exchangeCodeForTokens**: Sin intervención de Supabase
- **NO TOCAR NUNCA**

#### **4. src/components/Auth/Callback.js**
- Líneas 50-80: Detección de flujo OAuth de Analytics
- **NO TOCAR NUNCA**

### **Reglas de ORO:**

1. **NUNCA** usar `supabase.auth.signInWithOAuth()` para Google Analytics
2. **SIEMPRE** usar OAuth directo sin intervención de Supabase
3. **NUNCA** modificar la sesión principal durante el flujo de Analytics
4. **SIEMPRE** preservar el email del usuario original

### **Señales de Alerta:**
Si ves algún cambio en estos archivos, REVISA INMEDIATAMENTE:
- Cualquier llamada a `signInWithOAuth` para Google
- Modificación de `session.user.email` 
- Eliminación de sessionStorage checks
- Cambios en los listeners de AuthContext

### **Test de Verificación OBLIGATORIO:**
1. Iniciar sesión con `camiloalegriabarra@gmail.com`
2. Conectar Google Analytics con `camilo@origencomunicaciones.cl`
3. Verificar que la sesión siga siendo `camiloalegriabarra@gmail.com`

**SI ESTE TEST FALLA, LA APLICACIÓN ESTÁ ROTA**

---

**Creado:** 2025-12-19  
**Propósito:** Protección permanente contra regresiones  
**Prioridad:** CRÍTICA