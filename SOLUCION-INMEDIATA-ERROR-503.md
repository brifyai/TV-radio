# 🚨 SOLUCIÓN INMEDIATA ERROR 503

## 📊 **PROBLEMA:**
```
GET https://imetrics.cl/ 503 (Service Unavailable)
```

## 🛠️ **SOLUCIÓN EN COOLIFY:**

### **PASO 1: Ir a Coolify Dashboard**
1. Seleccionar aplicación TV-radio
2. Settings → Environment Variables

### **PASO 2: Cambiar Variables Problemáticas**

#### **EN PRODUCTION ENVIRONMENT VARIABLES:**
```bash
REACT_APP_USE_COOLIFY_DOMAIN=false    # Cambiar de true a false
PORT=3001                             # Agregar esta variable
```

#### **EN PREVIEW DEPLOYMENTS ENVIRONMENT VARIABLES:**
```bash
CORS_ORIGIN=https://imetrics.cl                                    # Cambiar de dominio Coolify
REACT_APP_API_URL=https://imetrics.cl/api                          # Cambiar API URL
```

### **PASO 3: Reiniciar Aplicación**
1. Click "Restart" en Coolify
2. Esperar 2-3 minutos
3. Monitorear logs

### **PASO 4: Verificar Resultado**
```bash
curl https://imetrics.cl/api/health
curl https://imetrics.cl/
```

## 📋 **RESUMEN DE CAMBIOS:**

| Variable | Valor Actual | Valor Correcto |
|----------|--------------|----------------|
| `REACT_APP_USE_COOLIFY_DOMAIN` | `true` | `false` |
| `PORT` | (no definida) | `3001` |
| `CORS_ORIGIN` (Preview) | `dominio-coolify` | `https://imetrics.cl` |
| `REACT_APP_API_URL` (Preview) | `dominio-coolify` | `https://imetrics.cl/api` |

## 🎯 **RESULTADO ESPERADO:**
```
✅ GET https://imetrics.cl/ 200 (OK)
✅ GET https://imetrics.cl/api/health 200 (OK)
✅ Sin error 503
```

---
**Fecha**: 2025-12-27  
**Estado**: 🔧 LISTO PARA APLICAR EN COOLIFY