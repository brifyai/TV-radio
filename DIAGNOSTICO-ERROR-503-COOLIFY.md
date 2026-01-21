# 🚨 DIAGNÓSTICO ERROR 503 - Coolify

## 📊 **SÍNTOMAS:**
```
GET https://imetrics.cl/ 503 (Service Unavailable)
GET https://imetrics.cl/favicon.ico 503 (Service Unavailable)
```

## 🔍 **POSIBLES CAUSAS:**

### **1. 🟡 SERVIDOR INICIANDO**
- El contenedor está arrancando pero aún no está listo
- Tiempo de inicio más largo de lo esperado
- **Solución**: Esperar o verificar logs

### **2. 🟡 PROBLEMA DE PUERTO**
- El servidor escucha en puerto incorrecto
- Coolify mapea puerto diferente
- **Solución**: Verificar configuración de puertos

### **3. 🟡 CONTENEDOR REINICIANDO**
- El contenedor se está reiniciando constantemente
- Error en el proceso de inicio
- **Solución**: Revisar logs del contenedor

### **4. 🟡 PROBLEMA DE RED**
- Cloudflare no puede alcanzar el servidor
- DNS mal configurado
- **Solución**: Verificar DNS y conectividad

### **5. 🟡 BUILD FALLÓ SILENCIOSAMENTE**
- El build se completó pero hay errores de runtime
- Dependencias faltantes en runtime
- **Solución**: Verificar logs de build y runtime

## 🛠️ **COMANDOS DE DIAGNÓSTICO:**

### **1. Verificar Estado del Contenedor:**
```bash
# En Coolify Dashboard
- Ir a la aplicación
- Click en "Logs"
- Buscar errores de runtime
```

### **2. Verificar Health Check:**
```bash
curl -v https://imetrics.cl/api/health
# Debería retornar 200 OK
```

### **3. Verificar Conectividad:**
```bash
# Verificar que el servidor responde
curl -I https://imetrics.cl/
# Debería retornar HTTP/1.1 200 OK o 503 (no timeout)
```

### **4. Verificar DNS:**
```bash
nslookup imetrics.cl
# Debería apuntar a la IP de Coolify
```

## 🔧 **SOLUCIONES INMEDIATAS:**

### **Solución 1: Reiniciar Aplicación**
1. Ir a Coolify Dashboard
2. Seleccionar aplicación
3. Click "Restart"
4. Esperar 2-3 minutos
5. Verificar logs

### **Solución 2: Verificar Variables de Entorno**
```bash
# En Coolify, verificar que estén configuradas:
PORT=3001
NODE_ENV=production
REACT_APP_PUBLIC_URL=https://imetrics.cl
```

### **Solución 3: Verificar Dockerfile**
```dockerfile
# Asegurar que el servidor escuche en el puerto correcto
EXPOSE 3001
CMD ["node", "server.js"]
```

### **Solución 4: Verificar server.js**
```javascript
// En server.js, asegurar que escuche en el puerto correcto
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
});
```

## 📋 **CHECKLIST DE VERIFICACIÓN:**

- [ ] ✅ Contenedor está "Running" (no "Restarting")
- [ ] ✅ Logs no muestran errores críticos
- [ ] ✅ Puerto 3001 está mapeado correctamente
- [ ] ✅ Variables de entorno están configuradas
- [ ] ✅ DNS apunta a Coolify
- [ ] ✅ Health check responde

## 🎯 **PRÓXIMOS PASOS:**

1. **Verificar logs del contenedor** en Coolify
2. **Reiniciar la aplicación** si es necesario
3. **Verificar configuración de puertos**
4. **Probar health check** manual
5. **Documentar la solución** encontrada

---
**Fecha**: 2025-12-27  
**Estado**: 🔍 INVESTIGANDO ERROR 503