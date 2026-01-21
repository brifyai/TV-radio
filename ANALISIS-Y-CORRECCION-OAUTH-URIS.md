# Análisis y Corrección de URIs OAuth en Google Cloud Console

## Estado Actual de las URIs

### ✅ Orígenes Autorizados de JavaScript (BIEN CONFIGURADOS)

**URIs Actuales:**
1. ✅ `http://localhost:3000` - Desarrollo local
2. ✅ `https://localhost:3000` - Desarrollo local con HTTPS
3. ✅ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io` - Producción Coolify
4. ✅ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io:3000` - Producción con puerto
5. ❓ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io:8080` - No necesario
6. ❓ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io:4173` - No necesario

### ❌ URIs de Redireccionamiento Autorizados (NECESITAN CORRECCIÓN)

**URIs Actuales:**
1. ✅ `https://uwbxyaszdqwypbebogvw.supabase.co/auth/v1/callback` - Supabase (Mantener)
2. ❌ `http://localhost:3000/analytics-callback` - Incorrecto, debe ser `/callback`
3. ✅ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback` - Correcto
4. ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback` - No necesario
5. ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/oauth/callback` - No necesario
6. ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/google/callback` - No necesario
7. ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/` - No necesario
8. ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/login` - No necesario
9. ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/login` - No necesario

## Configuración Recomendada

### 🎯 Orígenes Autorizados de JavaScript (MANTENER Y LIMPIAR)

**URIs Necesarias:**
1. `http://localhost:3000` - Desarrollo local HTTP
2. `https://localhost:3000` - Desarrollo local HTTPS (opcional)
3. `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io` - Producción

**URIs a Eliminar:**
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io:3000`
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io:8080`
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io:4173`

### 🎯 URIs de Redireccionamiento Autorizados (CORREGIR)

**URIs Necesarias:**
1. `https://uwbxyaszdqwypbebogvw.supabase.co/auth/v1/callback` - Supabase
2. `http://localhost:3000/callback` - Desarrollo local
3. `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback` - Producción

**URIs a Eliminar:**
- ❌ `http://localhost:3000/analytics-callback` (ruta incorrecta)
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback`
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/oauth/callback`
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/google/callback`
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/`
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/login`
- ❌ `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/login`

## Problemas Identificados

### 1. **Rutas de Callback Incorrectas**
- La aplicación usa `/callback` pero tienes `/analytics-callback`
- Esto causa `redirect_uri_mismatch`

### 2. **URIs Innecesarias**
- Demasiadas URIs de redireccionamiento que no se usan
- Pueden causar confusión y conflictos

### 3. **Puertos Adicionales**
- Los puertos `:3000`, `:8080`, `:4173` no son necesarios en producción
- El frontend se sirve en el puerto estándar (443 para HTTPS)

## Acciones Recomendadas

### Paso 1: Limpiar Orígenes Autorizados JavaScript

**Mantener:**
- `http://localhost:3000`
- `https://localhost:3000` (opcional)
- `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io`

**Eliminar:**
- Todos los que terminan en `:3000`, `:8080`, `:4173`

### Paso 2: Corregir URIs de Redireccionamiento

**Mantener:**
- `https://uwbxyaszdqwypbebogvw.supabase.co/auth/v1/callback`
- `http://localhost:3000/callback`
- `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback`

**Eliminar:**
- Todas las demás URIs que no sean las 3 anteriores

### Paso 3: Verificar Configuración en la Aplicación

La configuración actual en [`src/config/oauthConfig.js`](src/config/oauthConfig.js) es correcta:

```javascript
// Para desarrollo
LOCAL: {
  redirectUri: 'http://localhost:3000/callback'
}

// Para producción
COOLIFY: {
  redirectUri: 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback'
}
```

## Configuración Final Recomendada

### Orígenes Autorizados JavaScript (3 URIs)
```
1. http://localhost:3000
2. https://localhost:3000
3. https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### URIs de Redireccionamiento Autorizados (3 URIs)
```
1. https://uwbxyaszdqwypbebogvw.supabase.co/auth/v1/callback
2. http://localhost:3000/callback
3. https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

## Beneficios de la Corrección

✅ **Sin Errores de Redirect URI**: Las URLs coincidirán exactamente
✅ **Configuración Limpia**: Sin URIs innecesarias
✅ **Mejor Seguridad**: Menos superficies de ataque
✅ **Mantenimiento Sencillo**: Configuración mínima y clara

## Verificación Post-Cambios

Después de hacer los cambios:

1. **Prueba en Desarrollo**: 
   - Ve a `http://localhost:3000`
   - Intenta conectar Google Analytics
   - Debería funcionar sin errores

2. **Prueba en Producción**:
   - Ve a `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io`
   - Intenta conectar Google Analytics
   - Debería funcionar sin errores

3. **Revisa la Consola**:
   - No deberías ver errores de `redirect_uri_mismatch`
   - Los mensajes de debug deberían mostrar las URLs correctas

## Resumen

**URIs a Eliminar: 8**
**URIs a Mantener: 6**
**URIs a Corregir: 1** (`/analytics-callback` → `/callback`)

Con esta configuración limpia, el flujo OAuth debería funcionar perfectamente en ambos entornos sin errores de redirección.