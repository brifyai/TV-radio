# Solución Error 503 Service Unavailable en Callback OAuth

## 🚨 Problema Identificado

El flujo OAuth está funcionando correctamente hasta el callback, pero la aplicación devuelve **Error 503 Service Unavailable** cuando Google redirige de vuelta a:

```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback?code=...
```

## 🔍 Análisis de los Logs

### ✅ Lo que funciona correctamente:
1. **Detección de entorno**: `✅ Entorno detectado: COOLIFY`
2. **Configuración OAuth**: URL HTTPS correcta para Coolify
3. **Redirección a Google**: Funciona perfectamente
4. **Autenticación Google**: Usuario completa el flujo exitosamente
5. **Callback URL**: Google redirige con el código correctamente

### ❌ El problema:
- **Error 503**: La aplicación no está disponible cuando Google intenta redirigir al callback
- **WebSocket fallidos**: `ws://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io:3000/ws`
- **Protocolo mixto**: La app usa HTTP pero el callback es HTTPS

## 🎯 Causas del Error 503

### 1. **Aplicación no Desplegada Correctamente**
El error 503 indica que el servidor no está disponible o está caído.

### 2. **Protocolo HTTP vs HTTPS**
```
🔒 CRITICAL: window.location.origin: http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
🔒 CRITICAL: window.location.protocol: http:
```
La aplicación se está sirviendo en HTTP pero el callback es HTTPS.

### 3. **WebSocket en Puerto Incorrecto**
Los WebSocket intentan conectar al puerto 3000 pero la aplicación podría estar en otro puerto.

## 🔧 Soluciones

### Opción 1: Verificar Estado del Despliegue

**En Coolify:**
1. Ve al dashboard de tu aplicación
2. Verifica que el despliegue esté **Running**
3. Revisa los logs del contenedor
4. Confirma que no haya errores de build

### Opción 2: Forzar HTTPS en la Aplicación

La aplicación debe servirse exclusivamente por HTTPS.

**Variables de entorno en Coolify:**
```
FORCE_HTTPS=true
HTTPS_ONLY=true
NODE_ENV=production
```

### Opción 3: Configurar Nginx/Proxy para HTTPS

Si usas un proxy reverso, asegúrate que:

```nginx
server {
    listen 443 ssl;
    server_name v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io;
    
    # Forzar HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
    
    # Proxy a la aplicación
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Opción 4: Configurar Callback URL Correcta

Dado que la aplicación está en HTTP, actualiza el callback:

**En Google Cloud Console:**
```
http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

O mejor aún, configura la aplicación para usar HTTPS.

### Opción 5: Verificar Configuración del Servidor

**Revisa en Coolify:**
1. **Health Check**: ¿Responde `https://tudominio/api/health`?
2. **Puertos**: ¿Está mapeado correctamente el puerto 3000?
3. **SSL**: ¿Está configurado el certificado SSL?

## 🚀 Acciones Inmediatas

### 1. Verificar Estado Actual
```bash
# Health check
curl https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/health

# Verificar si responde
curl -I https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/
```

### 2. Revisar Logs en Coolify
- Ve a la aplicación en Coolify
- Revisa "Logs" o "Console"
- Busca errores durante el tiempo del callback

### 3. Verificar Configuración SSL
- Asegúrate que el certificado SSL esté activo
- Verifica que el dominio resuelva correctamente

## 📋 Diagnóstico Paso a Paso

### Paso 1: Verificar Disponibilidad
```bash
# Test básico de conectividad
curl -v https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/

# Test health endpoint
curl -v https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/health
```

### Paso 2: Verificar Logs del Callback
En Coolify, busca logs alrededor del tiempo cuando intentaste el OAuth.

### Paso 3: Configurar HTTPS
Asegúrate que la aplicación se sirva siempre por HTTPS.

## 🔍 Posibles Problemas Específicos

### 1. **Contenedor Caído**
El contenedor podría haberse caído después del despliegue.

### 2. **Error de Inicio**
La aplicación podría estar fallando al iniciar.

### 3. **Problema de Red**
La red de Coolify podría tener problemas.

### 4. **Configuración de Puerto**
El puerto podría no estar correctamente expuesto.

## 🎯 Solución Recomendada

### 1. **Inmediato**: Verificar Estado
```bash
curl https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/health
```

### 2. **Si no responde**: Rebuild en Coolify
- Ve a la aplicación
- Click "Redeploy"
- Espera a que termine
- Intenta el OAuth nuevamente

### 3. **Si responde pero con HTTP**: Configurar HTTPS
- Agrega variables de entorno para forzar HTTPS
- O actualiza el callback URL en Google Console a HTTP

## 📊 Esperado vs Real

### ✅ Esperado:
```
🔒 CRITICAL: window.location.origin: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
🔒 CRITICAL: window.location.protocol: https:
```

### ❌ Real:
```
🔒 CRITICAL: window.location.origin: http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
🔒 CRITICAL: window.location.protocol: http:
```

## 🔄 Prueba Rápida

1. **Abre el dominio directamente**:
   ```
   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
   ```

2. **Si carga**: El problema es solo el callback
3. **Si no carga**: La aplicación está caída

## 📝 Checklist de Verificación

- [ ] La aplicación está corriendo en Coolify
- [ ] El dominio resuelve correctamente
- [ ] SSL está configurado y activo
- [ ] El health endpoint responde
- [ ] Los logs no muestran errores críticos
- [ ] El callback URL coincide con el protocolo real

## 🚨 Si nada funciona:

1. **Rebuild completo** en Coolify
2. **Verificar variables de entorno**
3. **Contactar soporte de Coolify** si es un problema de plataforma

El flujo OAuth está funcionando, solo falta que la aplicación esté disponible para recibir el callback.