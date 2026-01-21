# 🚨 ACCIÓN INMEDIATA - ERROR 503 PERSISTENTE

## 📊 **PROBLEMA CONFIRMADO:**
```
GET https://imetrics.cl/ 503 (Service Unavailable)
```

## 🔍 **VERIFICACIÓN INMEDIATA EN COOLIFY:**

### **PASO 1: Verificar Estado del Contenedor**
1. **Ir a Coolify Dashboard**
2. **Seleccionar aplicación TV-radio**
3. **Verificar estado del contenedor:**
   - ✅ **Running** = OK
   - 🔄 **Restarting** = PROBLEMA (se reinicia constantemente)
   - ❌ **Stopped** = PROBLEMA (no inicia)

### **PASO 2: Revisar Logs del Contenedor**
1. **Click en "Logs"**
2. **Buscar estos errores específicos:**
   ```
   ❌ "Cannot find module 'express'"
   ❌ "Port already in use"
   ❌ "npm run build failed"
   ❌ "Segmentation fault"
   ❌ "Command not found"
   ❌ "Server listening on port"
   ```

### **PASO 3: Verificar Variables de Entorno Críticas**
**EN COOLIFY → Settings → Environment Variables:**

#### **VERIFICAR QUE ESTÉN CONFIGURADAS:**
```bash
PORT=3001                              ✅ REQUERIDO
NODE_VERSION=20                        ✅ REQUERIDO
NODE_ENV=production                    ✅ REQUERIDO
CORS_ORIGIN=https://imetrics.cl        ✅ REQUERIDO
REACT_APP_USE_COOLIFY_DOMAIN=false     ✅ REQUERIDO
```

#### **SI FALTA ALGUNA VARIABLE:**
1. **Agregar la variable faltante**
2. **Click "Save"**
3. **Reiniciar aplicación**

### **PASO 4: Verificar Build en Logs**
**Buscar en logs:**
```
✅ "npm ci --only=production" 
✅ "npm ci --only=dev"
✅ "npm run build"
✅ "Build completed successfully"
```

**Si el build falló:**
- Verificar que `react-scripts` esté en dependencies
- Verificar errores de TypeScript/ESLint

### **PASO 5: Verificar Servidor en Logs**
**Buscar en logs:**
```
✅ "🚀 Servidor iMetrics iniciado"
✅ "📍 Puerto: 3001"
✅ "Server listening on port 3001"
```

**Si el servidor no inicia:**
- Verificar que `server.js` existe
- Verificar que Express está instalado

## 🛠️ **SOLUCIONES INMEDIATAS:**

### **SI EL CONTENEDOR SE REINICIA CONSTANTEMENTE:**
1. **Verificar variables de entorno**
2. **Verificar que `server.js` existe**
3. **Verificar permisos de archivos**

### **SI EL BUILD FALLÓ:**
1. **Verificar `react-scripts` en dependencies**
2. **Reconstruir: `npm ci && npm run build`**

### **SI HAY ERRORES DE MÓDULOS:**
1. **Verificar Dockerfile**
2. **Asegurar que `npm ci` se ejecuta**

### **SI EL PUERTO NO RESPONDE:**
1. **Verificar `EXPOSE 3001` en Dockerfile**
2. **Verificar `PORT=3001` en variables**
3. **Verificar `app.listen(PORT, '0.0.0.0')` en server.js**

## 📋 **ACCIÓN REQUERIDA:**

**AHORA MISMO:**
1. **Ir a Coolify Dashboard**
2. **Verificar estado del contenedor**
3. **Revisar logs para errores**
4. **Aplicar correcciones necesarias**
5. **Reiniciar aplicación**

## 🎯 **RESULTADO ESPERADO:**
```
✅ Contenedor "Running" estable
✅ Sin errores en logs
✅ GET https://imetrics.cl/ 200 (OK)
✅ GET https://imetrics.cl/api/health 200 (OK)
```

---
**Fecha**: 2025-12-27  
**Estado**: 🚨 ACCIÓN INMEDIATA REQUERIDA
**Prioridad**: CRÍTICA