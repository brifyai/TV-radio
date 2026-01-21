const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // Cambiado a 3000 para Coolify

// Middlewares
app.use(cors({
  origin: [
    'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io',
    'http://localhost:3000',
    'http://localhost:3000' // Desarrollo local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware para logging mejorado
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`🔍 Origin: ${req.header('origin') || 'No origin'}`);
  console.log(`🔍 Host: ${req.header('host')}`);
  console.log(`🔍 User-Agent: ${req.header('user-agent') || 'No UA'}`);
  next();
});

// Configuración de Google Analytics API
const GOOGLE_ANALYTICS_API_BASE = 'https://analyticsdata.googleapis.com';
const GOOGLE_ANALYTICS_ADMIN_API_BASE = 'https://analyticsadmin.googleapis.com';

// Middleware para verificar el token de autorización
const verifyAuthToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Token no proporcionado o inválido');
    return res.status(401).json({ 
      error: 'Token de autorización no proporcionado o inválido',
      details: 'Formato requerido: Bearer <token>'
    });
  }
  
  req.accessToken = authHeader.substring(7);
  console.log('✅ Token verificado correctamente');
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
        },
        timeout: 30000 // 30 segundos timeout
      }
    );

    console.log(`✅ Cuentas encontradas: ${response.data.accounts?.length || 0}`);
    
    res.json({
      success: true,
      data: response.data.accounts || [],
      count: response.data.accounts?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error al obtener cuentas:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    res.status(status).json({ 
      success: false,
      error: message,
      details: error.response?.data,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para obtener propiedades de una cuenta específica
app.get('/api/analytics/properties/:accountId', verifyAuthToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log(`🔍 Obteniendo propiedades para la cuenta: ${accountId}`);
    
    if (!accountId || accountId === 'undefined') {
      return res.status(400).json({
        success: false,
        error: 'ID de cuenta inválido',
        details: 'El accountId no puede ser undefined o vacío'
      });
    }
    
    const filter = `parent:accounts/${accountId}`;
    console.log(`🔍 Usando filtro: ${filter}`);
    
    const response = await axios.get(
      `${GOOGLE_ANALYTICS_ADMIN_API_BASE}/v1beta/properties?filter=${encodeURIComponent(filter)}`,
      {
        headers: {
          'Authorization': `Bearer ${req.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log(`✅ Propiedades encontradas: ${response.data.properties?.length || 0}`);
    
    res.json({
      success: true,
      data: response.data.properties || [],
      count: response.data.properties?.length || 0,
      accountId: accountId
    });
    
  } catch (error) {
    console.error('❌ Error al obtener propiedades:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    res.status(status).json({
      success: false,
      error: message,
      details: error.response?.data,
      accountId: req.params.accountId,
      timestamp: new Date().toISOString()
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
      'dateMinute': 'nthMinute',
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
    
    // Mapear dimensiones y métricas
    const apiDimensions = dimensions?.map(dim => dimensionMapping[dim] || dim) || [];
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

    console.log(`🔍 Enviando solicitud a Google Analytics API...`);

    const response = await axios.post(
      `${GOOGLE_ANALYTICS_API_BASE}/v1beta/properties/${propertyId}:runReport`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${req.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000 // 45 segundos timeout para datos grandes
      }
    );

    console.log('✅ Datos de analytics obtenidos exitosamente');
    console.log(`🔍 Filas devueltas: ${response.data.rows?.length || 0}`);
    
    res.json({
      success: true,
      data: response.data,
      propertyId: propertyId,
      rowCount: response.data.rows?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error al obtener datos de analytics:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    res.status(status).json({
      success: false,
      error: message,
      details: error.response?.data,
      propertyId: req.params.propertyId,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de health check mejorado
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0-production-fix',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    host: req.header('host'),
    protocol: req.header('x-forwarded-proto') || req.protocol,
    userAgent: req.header('user-agent')
  };
  
  console.log('🔍 Health check solicitado:', healthData);
  res.json(healthData);
});

// Endpoint específico para callback de OAuth
app.get('/callback', (req, res) => {
  console.log('🔍 OAuth callback recibido:', req.query);
  console.log('🔍 Headers:', req.headers);
  
  // Si hay código de autorización, redirigir al frontend
  if (req.query.code) {
    const frontendUrl = `https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/auth/callback?${new URLSearchParams(req.query).toString()}`;
    console.log('🔍 Redirigiendo a frontend:', frontendUrl);
    res.redirect(frontendUrl);
  } else if (req.query.error) {
    console.error('❌ Error en OAuth callback:', req.query.error);
    res.status(400).json({
      error: 'Error en OAuth callback',
      details: req.query,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(400).json({
      error: 'Código de autorización no encontrado',
      query: req.query,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para verificar configuración
app.get('/api/config', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    corsOrigins: [
      'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io',
      'http://localhost:3000'
    ],
    timestamp: new Date().toISOString(),
    version: '2.0.0-production-fix'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  console.log(`❌ Endpoint no encontrado: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores globales mejorado
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  console.error('❌ Stack trace:', error.stack);
  
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    message: error.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor de producción iniciado en puerto ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/config - Ver configuración`);
  console.log(`   GET  /api/analytics/accounts - Obtener cuentas`);
  console.log(`   GET  /api/analytics/properties/:accountId - Obtener propiedades`);
  console.log(`   POST /api/analytics/data/:propertyId - Obtener datos de analytics`);
  console.log(`   GET  /callback - OAuth callback`);
  console.log(`🔗 URL base: ${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}`);
});

// Manejo graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔸 SIGTERM recibido, cerrando servidor graceful...');
  server.close(() => {
    console.log('✅ Servidor cerrado gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔸 SIGINT recibido, cerrando servidor graceful...');
  server.close(() => {
    console.log('✅ Servidor cerrado gracefully');
    process.exit(0);
  });
});

module.exports = app;