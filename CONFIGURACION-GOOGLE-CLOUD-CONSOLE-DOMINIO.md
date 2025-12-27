# 🔐 CONFIGURACIÓN GOOGLE CLOUD CONSOLE PARA DOMINIO imetrics.cl

## 📋 ¿QUÉ CAMBIOS HACER EN GOOGLE CLOUD CONSOLE?

**SÍ, NECESITAS ACTUALIZAR GOOGLE CLOUD CONSOLE** para que el OAuth 2.0 funcione con tu nuevo dominio **imetrics.cl**.

---

## 🎯 **CAMBIOS OBLIGATORIOS EN GOOGLE CLOUD CONSOLE**

### **1. Authorized Redirect URIs (URIs de Redirección Autorizadas)**

**Elimina las URLs antiguas y agrega las nuevas:**

**URLs ANTIGUAS que debes eliminar:**
```
http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

**URLs NUEVAS que debes agregar:**
```
https://imetrics.cl/callback
https://www.imetrics.cl/callback
```

---

## 🔧 **PASO A PASO DETALLADO**

### **PASO 1: Acceder a Google Cloud Console**
1. Ve a: https://console.cloud.google.com
2. Inicia sesión con tu cuenta de Google
3. **Selecciona tu proyecto** iMetrics (el que tiene las credenciales OAuth)

### **PASO 2: Navegar a Credenciales**
1. **En el menú hamburguesa (☰)**, ve a "**APIs & Services**"
2. **Haz clic en "**Credentials**"
3. **Busca tu "OAuth 2.0 Client ID"** para la aplicación web

### **PASO 3: Editar OAuth 2.0 Client ID**
1. **Haz clic en el lápiz (editar)** junto a tu OAuth Client ID
2. **Busca la sección "Authorized redirect URIs"**

### **PASO 4: Actualizar Redirect URIs**
1. **Elimina todas las URLs antiguas** que contengan:
   - `v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io`
   - Cualquier URL con `sslip.io`

2. **Agrega las nuevas URLs** haciendo clic en "**+ ADD URI**":
   ```
   https://imetrics.cl/callback
   https://www.imetrics.cl/callback
   ```

3. **Haz clic en "Save"** al final de la página

---

## 🔄 **VERIFICACIÓN DE CONFIGURACIÓN**

### **PASO 5: Verificar que todo esté correcto**
Después de guardar, deberías ver:

```
Authorized redirect URIs:
✅ https://imetrics.cl/callback
✅ https://www.imetrics.cl/callback
```

**NO deberías ver ninguna URL con:**
- ❌ `sslip.io`
- ❌ `http://` (solo HTTPS)
- ❌ IPs directas

---

## 🚨 **IMPORTANTE: CONSIDERACIONES ADICIONALES**

### **JavaScript Origins (Orígenes JavaScript)**
Si tienes configurados orígenes JavaScript, también debes actualizarlos:

**Elimina:**
```
http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

**Agrega:**
```
https://imetrics.cl
https://www.imetrics.cl
```

### **Authorized Domains (Dominios Autorizados)**
Si esta sección existe, asegúrate de tener:
```
imetrics.cl
www.imetrics.cl
```

---

## 🧪 **VERIFICACIÓN POST-CONFIGURACIÓN**

### **Paso 6: Probar la configuración**
1. **Espera 2-5 minutos** después de guardar los cambios
2. **Abre tu aplicación**: https://imetrics.cl
3. **Intenta hacer login con Google**
4. **Observa la URL de redirección** en el navegador

**URL esperada durante el login:**
```
https://accounts.google.com/oauth/authorize?client_id=TU_CLIENT_ID&redirect_uri=https://imetrics.cl/callback&...
```

### **Paso 7: Verificar errores comunes**

**Si ves "redirect_uri_mismatch":**
- Verifica que la URL en Google Cloud Console coincida exactamente
- Sin slash al final: `https://imetrics.cl/callback`
- Con HTTPS, no HTTP

**Si ves "unauthorized_client":**
- Verifica que estés usando el Client ID correcto
- Revisa que el Client Secret sea el correcto

---

## 📋 **CHECKLIST COMPLETO DE GOOGLE CLOUD CONSOLE**

- [ ] Accedido a Google Cloud Console
- [ ] Proyecto iMetrics seleccionado
- [ ] Navegado a APIs & Services → Credentials
- [ ] OAuth 2.0 Client ID localizado
- [ ] URLs antiguas con sslip.io eliminadas
- [ ] Nuevas URLs agregadas:
  - [ ] `https://imetrics.cl/callback`
  - [ ] `https://www.imetrics.cl/callback`
- [ ] JavaScript origins actualizados (si aplica)
- [ ] Authorized domains actualizados (si aplica)
- [ ] Cambios guardados exitosamente
- [ ] Login con Google probado
- [ ] Sin errores de redirect_uri_mismatch

---

## 🔄 **FLUJO COMPLETO DE OAUTH 2.0**

**Después de la configuración, el flujo será:**

1. **Usuario hace clic en "Login con Google"** en https://imetrics.cl
2. **Aplicación redirige a Google** con:
   ```
   redirect_uri=https://imetrics.cl/callback
   ```
3. **Google valida que el redirect_uri esté autorizado** ✅
4. **Usuario autoriza en Google**
5. **Google redirige a**: `https://imetrics.cl/callback?code=...`
6. **Supabase procesa el código** y obtiene tokens
7. **Usuario logueado exitosamente**

---

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Problema 1: "redirect_uri_mismatch"**
**Causa:** URL en Google no coincide con la que usa la aplicación
**Solución:** Verifica que sea exactamente `https://imetrics.cl/callback`

### **Problema 2: "invalid_client"**
**Causa:** Client ID o Client Secret incorrectos
**Solución:** Verifica las credenciales en Coolify/variables de entorno

### **Problema 3: "access_denied"**
**Causa:** Usuario denegó el permiso o configuración incorrecta
**Solución:** Verifica scopes y configuración de consent screen

---

## 🎯 **RESUMEN EJECUTIVO**

**✅ CAMBIOS OBLIGATORIOS EN GOOGLE CLOUD CONSOLE:**
1. **Authorized Redirect URIs**: `https://imetrics.cl/callback`
2. **Authorized Redirect URIs**: `https://www.imetrics.cl/callback`
3. **JavaScript Origins**: `https://imetrics.cl` (si aplica)
4. **Eliminar todas las URLs con sslip.io**

**⚠️ SI NO HACES ESTOS CAMBIOS:**
- Login con Google fallará con "redirect_uri_mismatch"
- Usuarios no podrán autenticarse
- Error 400: redirect_uri_mismatch

**🔧 ORDEN DE CONFIGURACIÓN RECOMENDADO:**
1. **Primero**: Google Cloud Console
2. **Segundo**: Supabase
3. **Tercero**: Variables de entorno en Coolify
4. **Final**: Probar login completo

**Con estos cambios, tu OAuth 2.0 con Google funcionará perfectamente con imetrics.cl.** 🚀