
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check mejorado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Express production server',
    port: PORT,
    domain: process.env.COOLIFY_DOMAIN || 'localhost'
  });
});

// Endpoint de callback OAuth
app.post('/api/oauth/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Código de autorización requerido' });
    }
    
    // Lógica para intercambiar el código por tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback'
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    
    res.json({
      success: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      }
    });
  } catch (error) {
    console.error('Error en OAuth callback:', error);
    res.status(500).json({ error: 'Error al procesar OAuth callback' });
  }
});

// Endpoints de Google Analytics API
app.get('/api/analytics/accounts', async (req, res) => {
  try {
    // Lógica para obtener cuentas de Analytics
    res.json({ accounts: [] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
