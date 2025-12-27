# 🚀 Guía Completa: Servidor Express iMetrics para Dominio Personalizado

## 📋 Resumen

Esta guía documenta la creación completa de un servidor Express optimizado para el dominio `imetrics.cl`, diseñado para resolver los problemas de OAuth y configuración de producción en Coolify.

## 🎯 Objetivos

- ✅ Crear servidor Express robusto para producción
- ✅ Configurar dominio personalizado `imetrics.cl`
- ✅ Resolver problemas de OAuth redirect_uri_mismatch
- ✅ Optimizar para despliegue en Coolify
- ✅ Implementar seguridad y rendimiento

## 📁 Estructura del Proyecto

```
servidor-express-imetrics/
├── package.json              # Dependencias y scripts
├── .env.example             # Plantilla variables de entorno
├── server.js                # Servidor Express principal
├── Dockerfile               # Configuración Docker
├── README.md                # Documentación
└── build/                   # Archivos estáticos de React (generado)
    ├── index.html
    ├── static/
    └── ...
```

## 🔧 Configuración del Servidor

### 1. Dependencias Principales

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### 2. Características del Servidor

#### 🔐 Seguridad
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración restrictiva para dominios autorizados
- **CSP**: Content Security Policy para prevenir XSS
- **Compression**: Reducción de ancho de banda

#### 🌐 Configuración de Dominio
- **Dominio principal**: `https://imetrics.cl`
- **Subdominio**: `https://www.imetrics.cl`
- **Redirección automática** HTTP a HTTPS
- **Soporte SPA** para React Router

#### 🚀 Rendimiento
- **Static files cache**: 1 año en producción
- **Gzip compression**: Reducción de tamaño de respuesta
- **ETag y Last-Modified**: Cache eficiente
- **Graceful shutdown**: Cierre elegante del servidor

## 🔑 Variables de Entorno

### Archivo `.env.example`

```env
# Puerto del servidor
PORT=3000

# Configuración de Supabase
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase

# Configuración de Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id

# Configuración del dominio
REACT_APP_PUBLIC_URL=https://imetrics.cl
REACT_APP_API_URL=https://imetrics.cl/api
REACT_APP_REDIRECT_URI=https://imetrics.cl/callback

# Entorno
NODE_ENV=production

# Configuración de CORS (opcional)
CORS_ORIGIN=https://imetrics.cl,https://www.imetrics.cl
```

## 🌍 Configuración de Dominios

### Google Cloud Console

1. **Acceder**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Navegar**: APIs & Services > Credentials
3. **Seleccionar**: OAuth 2.0 Client ID
4. **Configurar URIs autorizados**:

```
✅ https://imetrics.cl/callback
✅ https://imetrics.cl/
✅ https://www.imetrics.cl/callback
✅ https://www.imetrics.cl/
```

### Supabase Authentication

1. **Acceder**: Proyecto Supabase
2. **Navegar**: Authentication > Settings
3. **Configurar**:

```
Site URL: https://imetrics.cl
Redirect URLs:
- https://imetrics.cl/callback
- https://www.imetrics.cl/callback
```

## 🐳 Configuración Docker

### Dockerfile Optimizado

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
```

## 🚀 Despliegue en Coolify

### 1. Preparar Repositorio

```bash
# Subir a Git
git add servidor-express-imetrics/
git commit -m "Agregar servidor Express para imetrics.cl"
git push origin main
```

### 2. Configurar Aplicación en Coolify

1. **Crear nueva aplicación**
2. **Seleccionar repositorio Git**
3. **Configurar variables de entorno**:

```env
PORT=3000
REACT_APP_SUPABASE_URL=tu-url-supabase
REACT_APP_SUPABASE_ANON_KEY=tu-clave-supabase
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id
REACT_APP_PUBLIC_URL=https://imetrics.cl
REACT_APP_API_URL=https://imetrics.cl/api
REACT_APP_REDIRECT_URI=https://imetrics.cl/callback
NODE_ENV=production
```

### 3. Configurar Dominio

1. **Dominio principal**: `imetrics.cl`
2. **Alias**: `www.imetrics.cl`
3. **SSL**: Habilitar certificado automático
4. **Health Check**: `/api/health`

## 🔧 Código del Servidor

### server.js - Características Principales

```javascript
// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.supabase.co", "https://www.googleapis.com"],
    },
  },
}));

// Configuración CORS restrictiva
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://imetrics.cl',
      'https://www.imetrics.cl',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    domain: process.env.REACT_APP_PUBLIC_URL || 'https://imetrics.cl'
  });
});

// Manejo de rutas SPA
app.get('*', (req, res) => {
  if (fs.existsSync(buildPath)) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.status(404).json({ 
      error: 'Aplicación no encontrada',
      message: 'Ejecuta npm run build para generar los archivos estáticos'
    });
  }
});
```

## 🛠️ Flujo de Instalación

### 1. Clonar y Configurar

```bash
# Entrar al directorio del servidor
cd servidor-express-imetrics

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

### 2. Construir Aplicación React

```bash
# Desde el directorio principal
npm run build

# Copiar archivos build al servidor
cp -r build/ servidor-express-imetrics/
```

### 3. Probar Localmente

```bash
# Iniciar servidor
npm start

# Verificar
curl http://localhost:3000/api/health
```

### 4. Desplegar en Producción

```bash
# Subir a Git
git add .
git commit -m "Servidor listo para producción"
git push origin main

# Desplegar en Coolify (via web UI)
```

## 🔍 Solución de Problemas

### Error 503 Service Unavailable

**Causas Comunes:**
- Servidor no iniciado
- Variables de entorno incorrectas
- Directorio build no encontrado

**Soluciones:**
```bash
# Verificar servidor
ps aux | grep node

# Revisar logs
pm2 logs  # o docker logs <container>

# Verificar build
ls -la build/

# Reiniciar servidor
npm restart
```

### Error OAuth redirect_uri_mismatch

**Causas Comunes:**
- URLs no coinciden con Google Cloud Console
- Variables de entorno incorrectas
- Falta HTTPS

**Soluciones:**
1. Verificar `REACT_APP_REDIRECT_URI` en `.env`
2. Confirmar URLs en Google Cloud Console
3. Asegurar uso de HTTPS en todas las URLs

### Error de CORS

**Causas Comunes:**
- Origen no autorizado
- Configuración incorrecta

**Soluciones:**
1. Verificar configuración CORS en `server.js`
2. Confirmar origen en lista blanca
3. Revisar variables de entorno

## 📊 Monitoreo y Logs

### Health Check

```bash
# Endpoint de salud
curl https://imetrics.cl/api/health

# Respuesta esperada
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "domain": "https://imetrics.cl"
}
```

### Logs del Servidor

```bash
# Ver logs en tiempo real
tail -f /var/log/imetrics.log

# Logs de errores
grep ERROR /var/log/imetrics.log

# Estadísticas de acceso
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c
```

## 🔐 Consideraciones de Seguridad

### Headers de Seguridad

- **X-Frame-Options**: Protección contra clickjacking
- **X-Content-Type-Options**: Prevención MIME sniffing
- **X-XSS-Protection**: Filtro XSS
- **Strict-Transport-Security**: Forzar HTTPS

### Variables Sensibles

- Nunca commitear `.env`
- Usar secrets de Coolify para valores sensibles
- Rotar claves periódicamente

## 📈 Optimización de Rendimiento

### Cache Estático

```javascript
// Cache de 1 año para archivos estáticos
app.use(express.static(buildPath, {
  maxAge: NODE_ENV === 'production' ? '1y' : '0',
  etag: true,
  lastModified: true
}));
```

### Compresión Gzip

```javascript
// Reducción de tamaño de respuesta
app.use(compression());
```

## 🚀 Próximos Pasos

1. **Monitoreo**: Implementar sistema de monitoreo
2. **CI/CD**: Automatizar despliegues
3. **Backup**: Estrategia de respaldo
4. **Escalabilidad**: Configuración de balanceo de carga

## 📞 Soporte

Para problemas o consultas:
1. Revisar logs del servidor
2. Verificar configuración de variables de entorno
3. Confirmar configuración de dominios
4. Consultar documentación de [Coolify](https://coolify.io/docs)

---

**Estado**: ✅ Completo  
**Versión**: 1.0.0  
**Última actualización**: 27/12/2024  
**Dominio**: imetrics.cl