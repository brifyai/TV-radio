
# GUÍA DE CONFIGURACIÓN PRODUCCIÓN COOLIFY

## Pasos para desplegar en producción:

### 1. Configurar Dominio y SSL en Coolify
1. Ir al panel de Coolify
2. Seleccionar el proyecto
3. Ir a "Settings" > "Domains"
4. Agregar dominio: v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
5. Habilitar "Automatic HTTPS"

### 2. Configurar Variables de Entorno
En el panel de Coolify, agregar las siguientes variables:
- NODE_ENV=production
- REACT_APP_ENVIRONMENT=production
- PORT=3000
- SERVER_PORT=3001
- COOLIFY_DOMAIN=v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

### 3. Configurar Google OAuth
Ir a Google Cloud Console y actualizar:
- Authorized redirect URIs:
  - https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback

### 4. Deploy
1. Hacer push de los cambios
2. Coolify detectará automáticamente los cambios
3. Esperar a que el deploy complete
4. Verificar que ambos servicios estén corriendo

### 5. Verificación
- Frontend: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
- Backend Health: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/health

## Archivos creados/modificados:
- .env.production
- server-production.js
- Dockerfile.production
- package.json (scripts actualizados)
