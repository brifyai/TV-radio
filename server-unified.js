const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// API Router - Definir rutas ANTES de archivos estáticos
const apiRouter = express.Router();

// Health check principal
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Unified Express Server',
    port: PORT,
    domain: process.env.COOLIFY_DOMAIN || 'localhost',
    mode: 'unified'
  });
});

// OAuth callback endpoint
apiRouter.post('/oauth/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Código de autorización requerido' });
    }
    
    console.log('🔐 Procesando OAuth callback en servidor unificado');
    
    // Lógica para intercambiar el código por tokens
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

// Analytics accounts endpoint
apiRouter.get('/analytics/accounts', async (req, res) => {
  try {
    console.log('📊 Obteniendo cuentas de Analytics');
    // Lógica para obtener cuentas de Analytics
    res.json({ 
      success: true,
      accounts: [],
      message: 'Endpoint funcionando correctamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener cuentas:', error);
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
});

// Montar router de API
app.use('/api', apiRouter);

// Manejar todas las rutas del frontend (SPA) - ANTES de archivos estáticos
app.use((req, res, next) => {
  // Si es una ruta API, continuar al siguiente middleware
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Para todas las demás rutas, servir el index.html del SPA
  console.log('🔄 Sirviendo SPA para ruta:', req.path);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Servir archivos estáticos del frontend (build) - DESPUÉS del middleware SPA
app.use(express.static(path.join(__dirname, 'build')));

// Iniciar servidor unificado
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 SERVIDOR UNIFICADO INICIADO');
  console.log('================================');
  console.log(`🌐 Puerto principal: ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API endpoints: http://localhost:${PORT}/api/`);
  console.log(`🖥️  Frontend: http://localhost:${PORT}/`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏷️  Dominio: ${process.env.COOLIFY_DOMAIN || 'localhost'}`);
  console.log('================================');
});

module.exports = app;