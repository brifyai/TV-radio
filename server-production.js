const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Middlewares
app.use(cors({
  origin: ['https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Configuración de Google Analytics API
const GOOGLE_ANALYTICS_API_BASE = 'https://analyticsdata.googleapis.com';
const GOOGLE_ANALYTICS_ADMIN_API_BASE = 'https://analyticsadmin.googleapis.com';

// Middleware para logging de solicitudes
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`🔍 Origin: ${req.header('origin')}`);
  console.log(`🔍 Host: ${req.header('host')}`);
  console.log(`🔍 Environment: ${NODE_ENV}`);
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
    
    if (!accountId || accountId === 'undefined') {
      return res.status(400).json({
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
    
    const apiDimensions = dimensions?.map(dim => dimensionMapping[dim] || dim) || [];
    const apiMetrics = metrics?.map(metric => metricMapping[metric] || metric) || [];
    
    const requestBody = {
      metrics: apiMetrics.map(metric => ({ name: metric })),
      dimensions: apiDimensions.map(dimension => ({ name: dimension })),
      dateRanges: [{
        startDate: dateRange?.startDate || '30daysAgo',
        endDate: dateRange?.endDate || 'today'
      }]
    };

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
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error al obtener datos de analytics:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    res.status(status).json({
      error: message,
      details: error.response?.data
    });
  }
});

// Endpoint de health check mejorado para producción
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV,
    ssl: true,
    host: req.header('host'),
    protocol: req.header('x-forwarded-proto') || req.protocol,
    mode: 'coolify-production-unified',
    frontend: 'served-from-build',
    backend: 'integrated'
  });
});

// Endpoint específico para callback de OAuth
app.get('/callback', (req, res) => {
  console.log('🔍 OAuth callback recibido:', req.query);
  
  // Si hay código de autorización, redirigir al frontend
  if (req.query.code) {
    const frontendUrl = `${process.env.REACT_APP_API_URL || 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io'}/auth/callback?${new URLSearchParams(req.query).toString()}`;
    console.log('🔍 Redirigiendo a frontend:', frontendUrl);
    res.redirect(frontendUrl);
  } else {
    res.status(400).json({
      error: 'Código de autorización no encontrado',
      query: req.query
    });
  }
});

// Servir archivos estáticos del frontend (build)
app.use(express.static(path.join(__dirname, 'build')));

// Middleware para manejar todas las rutas restantes (SPA)
app.use((req, res, next) => {
  // Si es una ruta de API, continuar
  if (req.path.startsWith('/api/') || req.path === '/callback') {
    return next();
  }
  // Si no, servir el frontend
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Manejo de errores globales
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor producción Coolify iniciado en puerto ${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log(`🔗 URL base: ${process.env.REACT_APP_API_URL || 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io'}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET  /api/analytics/accounts - Obtener cuentas`);
  console.log(`   GET  /api/analytics/properties/:accountId - Obtener propiedades`);
  console.log(`   POST /api/analytics/data/:propertyId - Obtener datos de analytics`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /callback - OAuth callback`);
  console.log(`   GET  /* - Frontend SPA`);
});

module.exports = app;
