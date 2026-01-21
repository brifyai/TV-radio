# 🚨 DIAGNÓSTICO PROFUNDO ERROR 503

## 📊 **PROBLEMA PERSISTENTE:**
```
GET https://imetrics.cl/ 503 (Service Unavailable)
```

## 🔍 **VERIFICACIONES INMEDIATAS EN COOLIFY:**

### **PASO 1: Verificar Estado del Contenedor**
1. **Ir a Coolify Dashboard**
2. **Seleccionar aplicación TV-radio**
3. **Verificar estado:**
   - ✅ **Running** = Contenedor funcionando
   - 🔄 **Restarting** = PROBLEMA (se reinicia constantemente)
   - ❌ **Stopped** = PROBLEMA (no inicia)

### **PASO 2: Revisar Logs del Contenedor**
1. **Click en "Logs"**
2. **Buscar errores específicos:**
   ```
   ❌ "Cannot find module 'express'"
   ❌ "Port already in use"
   ❌ "npm run build failed"
   ❌ "Segmentation fault"
   ❌ "Out of memory"
   ❌ "Command not found"
   ```

### **PASO 3: Verificar Variables de Entorno**
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

### **PASO 4: Verificar Build**
1. **En Logs, buscar:**
   ```
   ✅ "npm ci --only=production" 
   ✅ "npm ci --only=dev"
   ✅ "npm run build"
   ✅ "Build completed successfully"
   ```

2. **Si el build falló:**
   - Verificar que `react-scripts` esté en dependencies
   - Verificar que no hay errores de TypeScript/ESLint
   - Reconstruir manualmente

### **PASO 5: Verificar Servidor**
1. **En Logs, buscar:**
   ```
   ✅ "🚀 Servidor iMetrics iniciado"
   ✅ "📍 Puerto: 3001"
   ✅ "Server listening on port 3001"
   ```

2. **Si el servidor no inicia:**
   - Verificar que `server.js` existe
   - Verificar que Express está instalado
   - Verificar permisos de archivos

## 🛠️ **SOLUCIONES POR TIPO DE ERROR:**

### **SI EL CONTENEDOR SE REINICIA CONSTANTEMENTE:**
**Causa**: Error en el proceso de inicio
**Solución**:
1. Verificar que `server.js` existe y es válido
2. Verificar que todas las dependencias están instaladas
3. Verificar permisos de archivos

### **SI EL BUILD FALLÓ:**
**Causa**: `npm run build` no se completó
**Solución**:
1. Verificar que `react-scripts` está en dependencies
2. Verificar que no hay errores de TypeScript/ESLint
3. Reconstruir manualmente: `npm ci && npm run build`

### **SI HAY ERRORES DE MÓDULOS:**
**Causa**: Dependencias no instaladas correctamente
**Solución**:
1. Verificar Dockerfile
2. Asegurar que `npm ci` se ejecuta
3. Verificar que `express` está en dependencies

### **SI EL PUERTO NO RESPONDE:**
**Causa**: Servidor no escucha en el puerto correcto
**Solución**:
1. Verificar `EXPOSE 3001` en Dockerfile
2. Verificar `PORT=3001` en variables de entorno
3. Verificar `app.listen(PORT, '0.0.0.0')` en server.js

## 📋 **CHECKLIST DE VERIFICACIÓN:**

- [ ] ✅ Contenedor está "Running" (no "Restarting")
- [ ] ✅ Logs no muestran errores críticos
- [ ] ✅ Variables de entorno configuradas correctamente
- [ ] ✅ Puerto 3001 mapeado correctamente
- [ ] ✅ Build se completó exitosamente
- [ ] ✅ Servidor inició en puerto 3001
- [ ] ✅ Health check responde: `curl https://imetrics.cl/api/health`

## 🔧 **COMANDOS DE DIAGNÓSTICO MANUAL:**

```bash
# Verificar estado del contenedor
curl -v https://imetrics.cl/api/health

# Verificar que responde
curl -I https://imetrics.cl/

# Verificar logs en Coolify
# Dashboard → TV-radio → Logs
```

## 🎯 **RESULTADO ESPERADO:**

**Después de aplicar las correcciones:**
```
✅ GET https://imetrics.cl/ 200 (OK)
✅ GET https://imetrics.cl/api/health 200 (OK)
✅ Contenedor "Running" estable
✅ Sin errores en logs
```

---
**Fecha**: 2025-12-27  
**Estado**: 🔍 DIAGNÓSTICO PROFUNDO EN CURSO
**Prioridad**: CRÍTICA - Aplicación no disponible