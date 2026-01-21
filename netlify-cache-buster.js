#!/usr/bin/env node

/**
 * Script para forzar la limpieza de caché en Netlify
 * Este script actualiza la configuración y fuerza una nueva compilación
 * 
 * Uso: node netlify-cache-buster.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🧹 Forzando limpieza de caché en Netlify...\n');

try {
  // 1. Actualizar el archivo netlify.toml con la configuración de caché
  console.log('📋 Actualizando configuración de Netlify...');
  
  const cacheConfig = `
[build]
  command = "npm run build"
  publish = "build"

# Headers globales con control de caché
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "connect-src 'self' https://uwbxyaszdqwypbebogvw.supabase.co https://api.chutes.ai https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://analytics.googleapis.com https://www.google-analytics.com https://googleapis.com https://accounts.google.com/gsi/client https://apis.google.com https://ssl.gstatic.com https://www.gstatic.com https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.google-analytics.com https://ssl.gstatic.com https://www.gstatic.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src 'self' https://accounts.google.com https://apis.google.com; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com;"
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    # Control de caché - NO almacenar en caché
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"

# Headers específicos para archivos estáticos (CSS, JS, imágenes)
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=3600, must-revalidate"
    # Cache por 1 hora para archivos JS

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=3600, must-revalidate"
    # Cache por 1 hora para archivos CSS

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=86400, must-revalidate"
    # Cache por 24 horas para imágenes

[[headers]]
  for = "/*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=86400, must-revalidate"
    # Cache por 24 horas para imágenes

[[headers]]
  for = "/*.svg"
  [headers.values]
    Cache-Control = "public, max-age=86400, must-revalidate"
    # Cache por 24 horas para SVG

# Headers para funciones serverless - NO CACHE
[[headers]]
  for = "/netlify/functions/*"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate, private"
    Pragma = "no-cache"
    Expires = "0"
    # Prevenir caché de respuestas de API

# Headers específicos para el proxy de analytics
[[headers]]
  for = "/.netlify/functions/analytics-proxy/*"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate, private"
    Pragma = "no-cache"
    Expires = "0"
    Vary = "Authorization"
    # Importante: variar por token de autorización
`;

  fs.writeFileSync('netlify.toml', cacheConfig.trim());
  console.log('✅ Configuración de Netlify actualizada con control de caché');

  // 2. Agregar timestamp al package.json para forzar nueva compilación
  console.log('\n📦 Actualizando versión del proyecto...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const timestamp = new Date().getTime();
  packageJson.version = `1.0.${timestamp}`;
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log(`✅ Nueva versión: ${packageJson.version}`);

  // 3. Crear archivo de trigger para Netlify
  console.log('\n🔄 Creando trigger de reconstrucción...');
  
  const triggerContent = `# Trigger de reconstrucción forzada
# Fecha: ${new Date().toISOString()}
# Razón: Limpieza de caché forzada
TIMESTAMP: ${timestamp}
CACHE_BUST: true
`;
  
  fs.writeFileSync('REBUILD_TRIGGER.txt', triggerContent);
  console.log('✅ Trigger de reconstrucción creado');

  // 4. Limpiar directorios de caché comunes
  console.log('\n🧹 Limpiando directorios de caché locales...');
  
  const cacheDirs = ['.cache', 'node_modules/.cache', '.next', 'build'];
  
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Eliminado: ${dir}`);
      } catch (error) {
        console.log(`⚠️  No se pudo eliminar ${dir}: ${error.message}`);
      }
    } else {
      console.log(`ℹ️  ${dir} no existe, saltando...`);
    }
  });

  console.log('\n🎉 ¡Limpieza de caché completada!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Commit estos cambios: git add . && git commit -m "Fix: Control de caché en Netlify"');
  console.log('2. Push a tu repositorio: git push origin main');
  console.log('3. Netlify detectará los cambios y hará un nuevo despliegue');
  console.log('4. Verifica que los cambios se reflejen en el sitio');
  
  console.log('\n💡 Notas importantes:');
  console.log('- Las funciones serverless ahora tienen headers de "no-cache"');
  console.log('- Los archivos estáticos tienen caché controlado (1-24 horas)');
  console.log('- El proxy de analytics no se almacenará en caché');
  console.log('- Se agregó header "Vary: Authorization" para variar por token');

} catch (error) {
  console.error('❌ Error durante la limpieza de caché:', error.message);
  process.exit(1);
}