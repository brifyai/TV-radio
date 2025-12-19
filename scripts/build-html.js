#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Leer variables de entorno
const env = {
  REACT_APP_GA_MEASUREMENT_ID: process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'
};

// Archivos HTML a procesar
const htmlFiles = [
  'public/index.html',
  'public/index-seo-complete.html',
  'public/index-seo-final.html',
  'public/index-seo-optimized.html'
];

// Procesar cada archivo
htmlFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Procesando ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar variables de entorno
    Object.keys(env).forEach(key => {
      const placeholder = `%${key}%`;
      content = content.replace(new RegExp(placeholder, 'g'), env[key]);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} actualizado con GA_MEASUREMENT_ID: ${env.REACT_APP_GA_MEASUREMENT_ID}`);
  } else {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
  }
});

console.log('🎉 Build HTML completado');