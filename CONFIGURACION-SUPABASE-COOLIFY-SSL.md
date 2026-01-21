# 🔧 CONFIGURACIÓN SUPABASE Y COOLIFY CON SSL

## 📋 VERIFICACIÓN DE CONFIGURACIÓN ACTUAL

### **Variables de Entorno Requeridas**

Basado en los archivos de configuración, necesitas configurar:

#### **1. Variables de Entorno (.env)**
```bash
# Google Analytics (OAuth)
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_real_aqui

# Supabase
REACT_APP_SUPABASE_URL=tu_supabase_url_real
REACT_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key_real

# URLs de la aplicación (ACTUALIZAR CON HTTPS)
REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
REACT_APP_ENVIRONMENT=production

# URLs de redirección OAuth (ACTUALIZAR CON HTTPS)
REACT_APP_REDIRECT_URI_COOLIFY=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
REACT_APP_USE_COOLIFY_DOMAIN=true
```

#### **2. Configuración del Servidor (server.env)**
```bash
# Configuración del servidor proxy
PORT=3001
NODE_ENV=production

# Configuración de CORS (ACTUALIZAR CON HTTPS)
CORS_ORIGIN=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

## 🔧 CONFIGURACIÓN EN COOLIFY

### **1. Variables de Entorno en Coolify**

En el panel de Coolify, añade estas variables de entorno:

```bash
# Variables del frontend
REACT_APP_GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
REACT_APP_ENVIRONMENT=production
REACT_APP_REDIRECT_URI_COOLIFY=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
REACT_APP_USE_COOLIFY_DOMAIN=true

# Variables del servidor
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### **2. Configuración SSL en Coolify**

#### **Opción A: Usar Cloudflare Tunnel (Recomendado)**
```bash
# En Coolify, configura el dominio personalizado:
Dominio: tvradio.alegria.dev
SSL: Automático via Cloudflare Tunnel
```

#### **Opción B: Certificado SSL Propio**
```bash
# Si Coolify permite certificados personalizados:
Certificado: server.crt
Clave: server.key
Protocolo: HTTPS
Puerto: 443
```

### **3. Configuración de Redirección en Coolify**

Asegúrate que Coolify tenga configuradas las redirecciones:

```bash
# Redirecciones HTTP a HTTPS
http://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io -> https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

# Redirección del callback
/callback -> /callback (mantener ruta)
```

## 🔧 CONFIGURACIÓN EN SUPABASE

### **1. Configuración de Autenticación**

En el panel de Supabase:

```bash
# Authentication > Settings
Site URL: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
Redirect URLs: 
  - https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/**
  - https://tvradio.alegria.dev/**
  - https://localhost:3000/**
```

### **2. Configuración de Proveedores OAuth**

```bash
# Authentication > Providers > Google
Habilitar: ✅
Client ID: 123456789-xxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxxx
Redirect URL: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback
```

### **3. Configuración de CORS**

```bash
# Settings > API
CORS Origins:
  - https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
  - https://tvradio.alegria.dev
  - https://localhost:3000
```

## 🔧 CONFIGURACIÓN EN GOOGLE CLOUD CONSOLE

### **1. OAuth 2.0 Client IDs**

```bash
# Authorized JavaScript origins
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
https://tvradio.alegria.dev
https://localhost:3000
http://localhost:3000

# Authorized redirect URIs
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://tvradio.alegria.dev/callback
https://localhost:3001/callback
```

## 🚀 SCRIPT DE CONFIGURACIÓN AUTOMÁTICA

### **Para Coolify:**
```bash
# 1. Configurar variables de entorno
cat > .env.production << EOF
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_real
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_real
REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
REACT_APP_ENVIRONMENT=production
REACT_APP_REDIRECT_URI_COOLIFY=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
REACT_APP_USE_COOLIFY_DOMAIN=true
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
EOF

# 2. Iniciar túnel SSL
npm run ssl:start
```

### **Para Supabase:**
```bash
# Script de verificación de configuración
node -e "
const config = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  apiUrl: process.env.REACT_APP_API_URL
};

console.log('🔍 Verificando configuración:');
Object.entries(config).forEach(([key, value]) => {
  const status = value && !value.includes('tu_') && !value.includes('aqui') ? '✅' : '❌';
  console.log(status, key, value ? value.substring(0, 50) + '...' : 'undefined');
});
"
```

## 📋 CHECKLIST DE CONFIGURACIÓN

### **✅ Coolify:**
- [ ] Variables de entorno configuradas
- [ ] SSL/TLS habilitado
- [ ] Redirecciones HTTP a HTTPS
- [ ] Dominio personalizado (opcional)
- [ ] Puerto 3001 configurado para backend

### **✅ Supabase:**
- [ ] URL del sitio configurada
- [ ] URLs de redirección configuradas
- [ ] Proveedor Google OAuth habilitado
- [ ] CORS configurado
- [ ] Claves API generadas

### **✅ Google Cloud Console:**
- [ ] Orígenes JavaScript autorizados
- [ ] URIs de redirección autorizados
- [ ] Client ID y Secret generados
- [ ] OAuth 2.0 habilitado

### **✅ Aplicación:**
- [ ] Variables de entorno actualizadas
- [ ] Configuración OAuth actualizada
- [ ] URLs HTTPS configuradas
- [ ] Servidor backend corriendo

## 🔄 FLUJO COMPLETO DE CONFIGURACIÓN

### **Paso 1: Configurar Supabase**
1. Ir a [Supabase Dashboard](https://app.supabase.com/)
2. Crear nuevo proyecto o usar existente
3. Configurar autenticación y OAuth
4. Obtener URL y claves API

### **Paso 2: Configurar Google Cloud Console**
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Configurar OAuth 2.0 Client IDs
3. Añadir URLs autorizadas
4. Obtener Client ID y Secret

### **Paso 3: Configurar Coolify**
1. Añadir variables de entorno
2. Configurar SSL/TLS
3. Configurar redirecciones
4. Desplegar aplicación

### **Paso 4: Verificar Funcionamiento**
1. Iniciar túnel SSL: `npm run ssl:start`
2. Probar URLs HTTPS
3. Verificar OAuth flow
4. Comprobar integración Supabase

## 🚨 ERRORES COMUNES Y SOLUCIONES

### **Error: redirect_uri_mismatch**
```bash
# Solución: Asegurar que la URL exacta esté en Google Cloud Console
URL: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

### **Error: CORS**
```bash
# Solución: Configurar CORS en Supabase y servidor
Origen: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
```

### **Error: SSL Invalid**
```bash
# Solución: Usar Cloudflare Tunnel o certificado válido
npm run ssl:start
```

## 🎯 RESULTADO ESPERADO

Después de esta configuración:
- ✅ OAuth funcionando con HTTPS
- ✅ Supabase integrado correctamente
- ✅ Coolify con SSL válido
- ✅ Aplicación completa en producción