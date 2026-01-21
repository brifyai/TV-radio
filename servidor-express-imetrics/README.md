# Servidor Express iMetrics

Servidor Express optimizado para despliegue en producción con dominio personalizado `imetrics.cl`.

## Características

- ✅ Servidor Express con HTTPS y redirección automática
- ✅ Configuración CORS para dominio personalizado
- ✅ Manejo de rutas SPA (Single Page Application)
- ✅ Variables de entorno para producción
- ✅ Compatible con Coolify y otros servicios de hosting
- ✅ Configuración OAuth optimizada para `imetrics.cl`

## Configuración Rápida

### 1. Instalar dependencias
```bash
cd servidor-express-imetrics
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```env
PORT=3000
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-clave-anonima
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id
REACT_APP_PUBLIC_URL=https://imetrics.cl
REACT_APP_API_URL=https://imetrics.cl/api
REACT_APP_REDIRECT_URI=https://imetrics.cl/callback
NODE_ENV=production
```

### 3. Construir la aplicación React
```bash
# Desde el directorio principal del proyecto
npm run build
```

### 4. Iniciar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Configuración de Dominio

### Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Navega a APIs & Services > Credentials
3. Edita tu OAuth 2.0 Client ID
4. Agrega los siguientes URIs autorizados:

```
https://imetrics.cl/callback
https://imetrics.cl/
https://www.imetrics.cl/callback
https://www.imetrics.cl/
```

### Supabase
1. Ve a tu proyecto Supabase
2. Navega a Authentication > Settings
3. Configura Site URL:
```
https://imetrics.cl
```
4. Configura Redirect URLs:
```
https://imetrics.cl/callback
https://www.imetrics.cl/callback
```

## Despliegue en Coolify

### 1. Subir los archivos
Sube el contenido de `servidor-express-imetrics/` a tu repositorio Git.

### 2. Configurar variables de entorno en Coolify
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

### 3. Configurar dominio en Coolify
1. Ve a tu aplicación en Coolify
2. Configura el dominio: `imetrics.cl`
3. Agrega también: `www.imetrics.cl`
4. Habilita HTTPS automático

## Estructura del Proyecto

```
servidor-express-imetrics/
├── package.json              # Dependencias y scripts
├── .env.example             # Plantilla de variables de entorno
├── server.js                # Servidor Express principal
├── README.md                # Esta documentación
└── build/                   # Archivos construidos de React (generado por npm run build)
    ├── index.html
    ├── static/
    └── ...
```

## Scripts Disponibles

```bash
npm start        # Inicia servidor en producción
npm run dev      # Inicia servidor en desarrollo con hot reload
npm test         # Ejecuta tests
```

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `REACT_APP_SUPABASE_URL` | URL de tu proyecto Supabase | `https://abc123.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `123456789-abc123.apps.googleusercontent.com` |
| `REACT_APP_PUBLIC_URL` | URL pública de la aplicación | `https://imetrics.cl` |
| `REACT_APP_API_URL` | URL base de la API | `https://imetrics.cl/api` |
| `REACT_APP_REDIRECT_URI` | URI de redirección OAuth | `https://imetrics.cl/callback` |
| `NODE_ENV` | Entorno de ejecución | `production` |

## Solución de Problemas

### Error 503 Service Unavailable
1. Verifica que el servidor esté corriendo: `ps aux | grep node`
2. Revisa los logs: `pm2 logs` o `docker logs <container>`
3. Verifica las variables de entorno
4. Confirma la configuración del dominio

### Error de OAuth redirect_uri_mismatch
1. Verifica que `REACT_APP_REDIRECT_URI` coincida con Google Cloud Console
2. Confirma que el dominio esté configurado correctamente en Supabase
3. Asegúrate de usar HTTPS en todas las URLs

### Error de CORS
1. Verifica la configuración de CORS en `server.js`
2. Confirma que el origen esté en la lista blanca
3. Revisa las variables de entorno de dominio

## Soporte

Para problemas o preguntas:
1. Revisa los logs del servidor
2. Verifica la configuración de variables de entorno
3. Confirma la configuración de dominios en Google Cloud y Supabase
4. Consulta la documentación de [Coolify](https://coolify.io/docs)

## Licencia

Proyecto privado de iMetrics.cl