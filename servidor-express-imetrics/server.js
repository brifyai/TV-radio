const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');

// Configuración de variables de entorno
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
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
      connectSrc: ["'self'", "https://api.supabase.co", "https://www.googleapis.com"],
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
    
    // Permitir solicitudes sin origin (como apps móviles)
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

app.use(cors(corsOptions));

// Parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath, {
    maxAge: NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true
  }));
} else {
  console.warn('⚠️  Directorio build no encontrado. Ejecuta npm run build primero.');
}

// API Routes (si las necesitas)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    domain: process.env.REACT_APP_PUBLIC_URL || 'https://imetrics.cl'
  });
});

// Ruta de callback para OAuth
app.get('/callback', (req, res) => {
  if (fs.existsSync(path.join(buildPath, 'index.html'))) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Aplicación no encontrada' });
  }
});

// Manejar todas las rutas para SPA
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

// Middleware de manejo de errores
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

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor iMetrics iniciado');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  console.log(`🔗 Dominio: ${process.env.REACT_APP_PUBLIC_URL || 'https://imetrics.cl'}`);
  console.log(`⏰ Hora: ${new Date().toLocaleString()}`);
  
  // Verificar archivos estáticos
  if (fs.existsSync(buildPath)) {
    console.log('✅ Archivos estáticos encontrados');
  } else {
    console.log('⚠️  ADVERTENCIA: No se encontraron archivos estáticos');
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