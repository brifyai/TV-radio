const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Coolify Backend Server',
    port: PORT,
    domain: process.env.COOLIFY_DOMAIN || 'localhost',
    version: '2.0.0'
  });
});

// Middleware para verificar token de autorización
const verifyAuthToken = (req, res, next) => {
  console.log('🔍 DEBUG: Verificando token de autorización...');
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('❌ DEBUG: No se encontró header de autorización');
    return res.status(401).json({
      error: 'Header de autorización no encontrado',
      message: 'Se requiere header Authorization: Bearer <token>'
    });
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ DEBUG: Header de autorización no tiene formato Bearer');
    return res.status(401).json({
      error: 'Header de autorización inválido',
      message: 'Header debe tener formato "Bearer <token>"'
    });
  }
  
  const token = authHeader.substring(7);
  req.accessToken = token;
  console.log('✅ DEBUG: Token verificado, longitud:', token.length);
  
  next();
};

// Endpoint para obtener cuentas
app.get('/api/analytics/accounts', verifyAuthToken, async (req, res) => {
  try {
    console.log('🔍 Obteniendo cuentas de Google Analytics...');
    
    const response = await google.analyticsadmin('v1beta').accounts.list({
      auth: new google.auth.OAuth2().setCredentials({
        access_token: req.accessToken
      })
    });
    
    console.log(`✅ Cuentas encontradas: ${response.data.accounts?.length || 0}`);
    
    res.json(response.data.accounts || []);
  } catch (error) {
    console.error('❌ Error al obtener cuentas:', error.message);
    res.status(500).json({
      error: 'Error al obtener cuentas',
      details: error.message
    });
  }
});

// Endpoint para obtener propiedades de una cuenta
app.get('/api/analytics/properties/:accountId', verifyAuthToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log(`🔍 Obteniendo propiedades para la cuenta: ${accountId}`);
    
    const response = await google.analyticsadmin('v1beta').properties.list({
      filter: `parent:accounts/${accountId}`,
      auth: new google.auth.OAuth2().setCredentials({
        access_token: req.accessToken
      })
    });
    
    console.log(`✅ Propiedades encontradas: ${response.data.properties?.length || 0}`);
    
    res.json(response.data.properties || []);
  } catch (error) {
    console.error('❌ Error al obtener propiedades:', error.message);
    res.status(500).json({
      error: 'Error al obtener propiedades',
      details: error.message
    });
  }
});

// Endpoint para obtener datos de analytics
app.post('/api/analytics/data/:propertyId', verifyAuthToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { metrics, dimensions, dateRange } = req.body;
    
    console.log(`🔍 Obteniendo datos de analytics para propiedad: ${propertyId}`);
    
    const analyticsData = google.analyticsdata('v1beta');
    
    const requestBody = {
      metrics: metrics.map(metric => ({ name: metric })),
      dimensions: dimensions.map(dimension => ({ name: dimension })),
      dateRanges: [{
        startDate: dateRange?.startDate || '30daysAgo',
        endDate: dateRange?.endDate || 'today'
      }]
    };
    
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody,
      auth: new google.auth.OAuth2().setCredentials({
        access_token: req.accessToken
      })
    });
    
    console.log('✅ Datos de analytics obtenidos exitosamente');
    
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error al obtener datos de analytics:', error.message);
    res.status(500).json({
      error: 'Error al obtener datos de analytics',
      details: error.message
    });
  }
});

// OAuth callback endpoint
app.post('/oauth/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Código de autorización requerido' });
    }
    
    console.log('🔐 Procesando OAuth callback en servidor Coolify');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback'
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Tokens obtenidos exitosamente');
    
    res.json({
      success: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      }
    });
  } catch (error) {
    console.error('❌ Error en OAuth callback:', error);
    res.status(500).json({ error: 'Error al procesar OAuth callback: ' + error.message });
  }
});

// Middleware para manejar rutas no encontradas (DEBE estar al final)
// NOTA: Este middleware solo se ejecuta si ninguna ruta anterior coincidió
app.use((req, res) => {
  console.log('🔍 DEBUG: Middleware 404 ejecutado para:', req.path);
  
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /api/analytics/accounts',
      'GET /api/analytics/properties/{accountId}',
      'POST /api/analytics/data/{propertyId}',
      'POST /oauth/callback'
    ]
  });
});

// Iniciar servidor backend
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 SERVIDOR BACKEND COOLIFY INICIADO');
  console.log('===================================');
  console.log(`🌐 Puerto backend: ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API endpoints: http://localhost:${PORT}/api/`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏷️  Dominio: ${process.env.COOLIFY_DOMAIN || 'localhost'}`);
  console.log('===================================');
});

module.exports = app;