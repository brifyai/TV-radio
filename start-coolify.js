#!/usr/bin/env node

/**
 * Script de inicio para Coolify
 * Inicia tanto el backend como el frontend
 * Solo el frontend es visible externamente (puerto 80/443)
 * Backend corre internamente en puerto 3001
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando aplicación para Coolify...');
console.log('=====================================');

// Iniciar servidor backend (interno)
const backend = spawn('node', ['server-coolify.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Esperar un momento para que el backend inicie
setTimeout(() => {
  // Iniciar servidor frontend (visible externamente)
  const frontend = spawn('npx', ['serve', '-s', 'build', '-l', '3000'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  console.log('✅ Backend iniciado internamente en puerto 3001');
  console.log('✅ Frontend iniciado en puerto 3000 (visible externamente via HTTPS)');
  console.log('=====================================');
  console.log('🌐 Aplicación corriendo en producción');
  console.log('📡 Acceso externo: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io');
}, 2000);

// Manejar cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidores...');
  backend.kill('SIGTERM');
  process.exit(0);
});