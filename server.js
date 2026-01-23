const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://supabase.imetrics.cl", "https://www.googleapis.com", "https://analyticsdata.googleapis.com", "https://analyticsadmin.googleapis.com"],
    },
  },
}));

// Middleware de compresión
app.use(compression());

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://imetrics.cl',
      'https://www.imetrics.cl',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Agregar orígenes desde variables de entorno
    if (process.env.ALLOWED_ORIGINS) {
      const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
      allowedOrigins.push(...envOrigins);
    }

    // Permitir requests sin origen (como apps móviles o curl) o same-origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ALLOW_ALL === 'true') {
      callback(null, true);
    } else {
      // Si no está en la lista explícita, pero queremos ser permisivos en esta configuración
      // Para despliegues nuevos, es mejor permitir el origen si coincide con el dominio de la app
      // O simplemente usar CORS_ALLOW_ALL=true en las variables de entorno
      callback(new Error(`No permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos de React (build)
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath, {
    maxAge: NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true
  }));
} else {
  console.warn('⚠️  Directorio build no encontrado. La aplicación React no está disponible.');
}

// Configuración de Google Analytics API
const GOOGLE_ANALYTICS_API_BASE = 'https://analyticsdata.googleapis.com';
const GOOGLE_ANALYTICS_ADMIN_API_BASE = 'https://analyticsadmin.googleapis.com';

// Middleware para logging de solicitudes
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Middleware para verificar el token de autorización
const verifyAuthToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token de autorización no proporcionado o inválido' 
    });
  }
  
  req.accessToken = authHeader.substring(7);
  next();
};

// Endpoint para obtener cuentas de Google Analytics
app.get('/api/analytics/accounts', verifyAuthToken, async (req, res) => {
  try {
    console.log('🔍 Obteniendo cuentas de Google Analytics...');
    
    const response = await axios.get(
      `${GOOGLE_ANALYTICS_ADMIN_API_BASE}/v1beta/accounts`,
      {
        headers: {
          'Authorization': `Bearer ${req.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Cuentas encontradas: ${response.data.accounts?.length || 0}`);
    
    res.json(response.data.accounts || []);
    
  } catch (error) {
    console.error('❌ Error al obtener cuentas:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    res.status(status).json({ 
      error: message,
      details: error.response?.data
    });
  }
});

// Endpoint para obtener propiedades de una cuenta específica
app.get('/api/analytics/properties/:accountId', verifyAuthToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log(`🔍 Obteniendo propiedades para la cuenta: ${accountId}`);
    
    // Validar que accountId no sea undefined o vacío
    if (!accountId || accountId === 'undefined') {
      return res.status(400).json({
        error: 'ID de cuenta inválido',
        details: 'El accountId no puede ser undefined o vacío'
      });
    }
    
    // Construir el filtro correctamente según la especificación de la API de Google Analytics
    const filter = `parent:accounts/${accountId}`;
    console.log(`🔍 Usando filtro: ${filter}`);
    
    const response = await axios.get(
      `${GOOGLE_ANALYTICS_ADMIN_API_BASE}/v1beta/properties?filter=${encodeURIComponent(filter)}`,
      {
        headers: {
          'Authorization': `Bearer ${req.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Propiedades encontradas: ${response.data.properties?.length || 0}`);
    
    res.json(response.data.properties || []);
    
  } catch (error) {
    console.error('❌ Error al obtener propiedades:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    res.status(status).json({
      error: message,
      details: error.response?.data
    });
  }
});

// Endpoint para obtener datos de analytics de una propiedad
app.post('/api/analytics/data/:propertyId', verifyAuthToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { metrics, dimensions, dateRange } = req.body;
    
    console.log(`🔍 Obteniendo datos de analytics para propiedad: ${propertyId}`);
    console.log(`🔍 Métricas solicitadas:`, metrics);
    console.log(`🔍 Dimensiones solicitadas:`, dimensions);
    console.log(`🔍 Rango de fechas:`, dateRange);
    
    // Mapeo de dimensiones a nombres correctos de GA4 API
    const dimensionMapping = {
      'date': 'date',
      'minute': 'minute',
      'hour': 'hour',
      'dateHour': 'dateHour',
      'dateMinute': 'nthMinute',  // Corregido: dateMinute no existe, usar nthMinute
      'country': 'country',
      'city': 'city',
      'deviceCategory': 'deviceCategory',
      'browser': 'browser',
      'operatingSystem': 'operatingSystem',
      'source': 'source',
      'medium': 'medium',
      'campaign': 'campaign',
      'pagePath': 'pagePath',
      'pageTitle': 'pageTitle',
      'sessionSource': 'sessionSource',
      'sessionMedium': 'sessionMedium',
      'sessionCampaign': 'sessionCampaign',
      'landingPage': 'landingPagePlusQueryString',
      'exitPage': 'exitPagePath',
      'pageLocation': 'pageLocation'
    };
    
    // Mapeo de métricas a nombres correctos de GA4 API
    const metricMapping = {
      'activeUsers': 'activeUsers',
      'sessions': 'sessions',
      'pageviews': 'screenPageViews',
      'bounceRate': 'bounceRate',
      'sessionDuration': 'averageSessionDuration',
      'eventCount': 'eventCount',
      'conversions': 'conversions',
      'users': 'totalUsers',
      'newUsers': 'newUsers',
      'engagementRate': 'engagementRate',
      'engagedSessions': 'engagedSessions',
      'engagementDuration': 'userEngagementDuration'
    };
    
    // Mapear dimensiones a los nombres correctos de la API
    const apiDimensions = dimensions?.map(dim => dimensionMapping[dim] || dim) || [];
    
    // Mapear métricas a los nombres correctos de la API
    const apiMetrics = metrics?.map(metric => metricMapping[metric] || metric) || [];
    
    console.log(`🔍 Dimensiones mapeadas para API:`, apiDimensions);
    console.log(`🔍 Métricas mapeadas para API:`, apiMetrics);
    
    // Construir la solicitud para la API de Google Analytics Data
    const requestBody = {
      metrics: apiMetrics.map(metric => ({ name: metric })),
      dimensions: apiDimensions.map(dimension => ({ name: dimension })),
      dateRanges: [{
        startDate: dateRange?.startDate || '30daysAgo',
        endDate: dateRange?.endDate || 'today'
      }]
    };

    console.log(`🔍 Enviando solicitud a Google Analytics API:`, JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      `${GOOGLE_ANALYTICS_API_BASE}/v1beta/properties/${propertyId}:runReport`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${req.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Datos de analytics obtenidos exitosamente');
    console.log(`🔍 Estructura de respuesta:`, {
      hasRows: !!response.data.rows,
      rowsCount: response.data.rows?.length || 0,
      hasTotals: !!response.data.totals,
      totalsCount: response.data.totals?.length || 0,
      hasMaximums: !!response.data.maximums,
      hasMinimums: !!response.data.minimums,
      hasRowCountTotal: !!response.data.rowCount,
      metadata: response.data.metadata
    });
    
    // Si hay datos, mostrar una muestra
    if (response.data.rows && response.data.rows.length > 0) {
      console.log(`🔍 Muestra de datos (primeras 3 filas):`, response.data.rows.slice(0, 3));
    }
    
    if (response.data.totals && response.data.totals.length > 0) {
      console.log(`🔍 Datos de totales:`, response.data.totals);
    }
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error al obtener datos de analytics:', error.response?.data || error.message);
    console.error('❌ Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      code: error.response?.data?.error?.code,
      message: error.response?.data?.error?.message,
      details: error.response?.data?.error?.details,
      stack: error.stack
    });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    res.status(status).json({
      error: message,
      details: error.response?.data
    });
  }
});

// Endpoint de health check mejorado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    domain: process.env.REACT_APP_PUBLIC_URL || 'https://imetrics.cl',
    version: '2.0.0',
    features: {
      analytics: true,
      staticFiles: fs.existsSync(buildPath),
      cors: true,
      compression: true,
      security: true
    }
  });
});

// Ruta de callback para OAuth (importante para React SPA)
app.get('/callback', (req, res) => {
  if (fs.existsSync(buildPath)) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Aplicación no encontrada' });
  }
});

// Middleware para manejar todas las rutas no encontradas (SPA)
app.use((req, res, next) => {
  // Si es una ruta de API, dejar que maneje el 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Endpoint de API no encontrado',
      path: req.originalUrl
    });
  }
  
  // Para rutas de la aplicación React, servir index.html
  if (fs.existsSync(buildPath)) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.status(404).json({
      error: 'Aplicación no encontrada',
      message: 'Ejecuta npm run build para generar los archivos estáticos'
    });
  }
});

// Middleware de manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Iniciar servidor con información mejorada
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor iMetrics iniciado');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  console.log(`🔗 Dominio: ${process.env.REACT_APP_PUBLIC_URL || 'https://imetrics.cl'}`);
  console.log(`⏰ Hora: ${new Date().toLocaleString()}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET  /api/analytics/accounts - Obtener cuentas`);
  console.log(`   GET  /api/analytics/properties/:accountId - Obtener propiedades`);
  console.log(`   POST /api/analytics/data/:propertyId - Obtener datos de analytics`);
  console.log(`   GET  /api/health - Health check mejorado`);
  console.log(`   GET  /callback - OAuth callback`);
  console.log(`   GET  /* - Rutas SPA (React)`);
  
  // Verificar archivos estáticos
  if (fs.existsSync(buildPath)) {
    console.log('✅ Archivos estáticos de React encontrados');
  } else {
    console.log('⚠️  ADVERTENCIA: No se encontraron archivos estáticos de React');
    console.log('💡 Ejecuta: npm run build');
  }
});

// Manejo graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado gracefully');
    process.exit(0);
  });
});

module.exports = app;