const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Función para copiar el archivo .env del servidor
function copyServerEnv() {
  const sourcePath = path.join(__dirname, 'server.env');
  const destPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log('✅ Archivo .env del servidor copiado exitosamente');
  } else {
    console.log('❌ No se encontró el archivo server.env');
  }
}

// Función para instalar dependencias del servidor
function installServerDependencies() {
  console.log('📦 Instalando dependencias del servidor...');
  
  exec('npm install', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error al instalar dependencias:', error);
      return;
    }
    
    console.log('✅ Dependencias instaladas exitosamente');
    console.log(stdout);
    
    // Iniciar el servidor
    startServer();
  });
}

// Función para iniciar el servidor
function startServer() {
  console.log('🚀 Iniciando servidor proxy...');
  
  const serverProcess = exec('node server.js', { cwd: __dirname });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Servidor detenido con código ${code}`);
  });
  
  // Manejar la terminación del proceso
  process.on('SIGINT', () => {
    console.log('🛑 Deteniendo servidor...');
    serverProcess.kill();
    process.exit(0);
  });
}

// Función principal
function main() {
  console.log('🔧 Configurando servidor proxy de Google Analytics...');
  
  // Verificar si existe el package.json del servidor
  if (!fs.existsSync(path.join(__dirname, 'server-package.json'))) {
    console.error('❌ No se encontró el archivo server-package.json');
    process.exit(1);
  }
  
  // Copiar el archivo .env del servidor
  copyServerEnv();
  
  // Renombrar el server-package.json a package.json si no existe
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    fs.copyFileSync(
      path.join(__dirname, 'server-package.json'),
      path.join(__dirname, 'package.json')
    );
    console.log('✅ package.json del servidor configurado');
  }
  
  // Instalar dependencias e iniciar servidor
  installServerDependencies();
}

// Ejecutar función principal
main();