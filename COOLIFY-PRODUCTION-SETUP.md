# 🚀 CONFIGURACIÓN PRODUCCIÓN COOLIFY - GUÍA COMPLETA

## 📋 Análisis de Variables de Entorno Actuales

### ✅ Variables Configuradas Correctamente:
```
FORCE_HTTPS=true
HTTPS_ONLY=true
NODE_ENV=production
REACT_APP_GOOGLE_CLIENT_ID=[CONFIGURED_IN_COOLIFY]
REACT_APP_GOOGLE_CLIENT_SECRET=[CONFIGURED_IN_COOLIFY]
REACT_APP_SUPABASE_URL=https://uwbxyaszdqwypbebogvw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🔧 Configuración Requerida para Producción Coolify:

## 🎯 Arquitectura Netlify vs Coolify

### Netlify (Anterior):
- **Frontend**: Servido por Netlify CDN
- **Backend**: Servidor separado en otro servicio
- **OAuth**: URLs diferentes para frontend/backend

### Coolify (Actual):
- **Frontend + Backend**: Servidor unificado
- **Dominio único**: `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io`
- **OAuth**: Mismo dominio para frontend y backend

## 🔧 Configuración Necesaria para Coolify

### 1. Variables de Entorno Faltantes:

Agregar estas variables en Coolify:

```bash
# Backend API URL
REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

# OAuth Callback URL
REACT_APP_REDIRECT_URI_COOLIFY=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback

# Server Port
PORT=3001

# Server Configuration
SERVER_MODE=production
SSL_ENABLED=true
```

### 2. Configuración del Servidor Unificado:

#### Modificar `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server-coolify-https.js",
    "build": "react-scripts build",
    "heroku-postbuild": "npm run build"
  }
}
```

#### Actualizar `server-coolify-https.js` para producción:
```javascript
// Configuración de producción
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'build')));

// Health check mejorado
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV,
    ssl: true,
    host: req.header('host'),
    protocol: req.header('x-forwarded-proto') || req.protocol,
    mode: 'coolify-production'
  });
});
```

### 3. Configuración OAuth para Producción:

#### Actualizar Google Cloud Console:

**Authorized redirect URIs:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

**Authorized JavaScript origins:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### 4. Configuración Build en Coolify:

#### Build Command:
```bash
npm install
npm run build
```

#### Start Command:
```bash
npm start
```

#### Health Check Path:
```bash
/api/health
```

## 🚀 Implementación Paso a Paso

### Paso 1: Actualizar Variables de Entorno

En Coolify, agregar:

```bash
REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
REACT_APP_REDIRECT_URI_COOLIFY=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
PORT=3001
SERVER_MODE=production
SSL_ENABLED=true
```

### Paso 2: Actualizar Configuración OAuth

```javascript
// src/config/oauthConfig.js
export const OAUTH_CONFIG = {
  COOLIFY: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_COOLIFY || 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    sslValid: true, // En producción con SSL válido
    status: 'PRODUCTION_READY'
  }
};
```

### Paso 3: Configurar Servidor Unificado

Crear `server-production.js`:
```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API routes (existentes)
app.use('/api', require('./api/routes'));

// OAuth callback
app.get('/callback', (req, res) => {
  if (req.query.code) {
    const frontendUrl = `${process.env.REACT_APP_API_URL}/auth/callback?${new URLSearchParams(req.query).toString()}`;
    res.redirect(frontendUrl);
  } else {
    res.status(400).json({ error: 'Código no encontrado' });
  }
});

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'build')));

// Todas las demás rutas al frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor producción Coolify iniciado en puerto ${PORT}`);
  console.log(`🌐 URL: ${process.env.REACT_APP_API_URL}`);
});
```

### Paso 4: Actualizar package.json

```json
{
  "scripts": {
    "start": "node server-production.js",
    "build": "react-scripts build",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "10.x"
  }
}
```

## 🔍 Verificación Producción

### Health Check:
```bash
curl https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/health
```

### OAuth Test:
```bash
curl "https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback?code=test"
```

## ⚠️ Problemas Críticos a Resolver

### 1. SSL Certificado:
- **Problema**: Certificado auto-firmado no confiable
- **Solución**: Configurar Let's Encrypt en Coolify o usar Cloudflare Tunnel

### 2. Servidor Unificado:
- **Problema**: Frontend y backend deben correr en el mismo servidor
- **Solución**: Implementar servidor unificado que sirva ambos

### 3. Variables de Entorno:
- **Problema**: Faltan variables específicas para producción
- **Solución**: Agregar variables faltantes en Coolify

## 🎯 Solución Recomendada

### Opción 1: Servidor Unificado Coolify
1. Configurar servidor unificado
2. Agregar variables de entorno
3. Resolver SSL con Let's Encrypt

### Opción 2: Cloudflare Tunnel (Recomendado)
1. Mantener servidor unificado local
2. Usar Cloudflare Tunnel para SSL
3. Dominio personalizado profesional

## 📋 Checklist Producción Coolify

- [ ] Agregar variables de entorno faltantes
- [ ] Configurar servidor unificado
- [ ] Actualizar Google Cloud Console
- [ ] Resolver certificado SSL
- [ ] Probar OAuth completo
- [ ] Verificar API endpoints
- [ ] Testear flujo completo

## 🚀 Comandos para Implementación

```bash
# 1. Actualizar variables en Coolify (panel web)

# 2. Hacer deploy con nueva configuración
git add .
git commit -m "Configuración producción Coolify"
git push

# 3. Verificar funcionamiento
curl https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/health
```

La configuración actual de variables está casi completa. Solo falta ajustar la arquitectura para servidor unificado y resolver el SSL para producción.