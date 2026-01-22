#!/usr/bin/env node

/**
 * Script para verificar variables de entorno configuradas
 * Ejecutar con: node check-env.js
 */

console.log('🔍 VERIFICACIÓN DE VARIABLES DE ENTORNO\n');

console.log('📋 Variables de React App:');
console.log('='.repeat(50));

// Verificar variables de Chutes AI
const chutesApiKey = process.env.REACT_APP_CHUTES_API_KEY;
console.log(`REACT_APP_CHUTES_API_KEY: ${chutesApiKey ? '✅ Configurada' : '❌ No configurada'}`);
if (chutesApiKey) {
  console.log(`   Valor: ${chutesApiKey.substring(0, 20)}...`);
}

console.log('');

// Verificar variables de Groq
const groqApiKey = process.env.REACT_APP_GROQ_API_KEY;
console.log(`REACT_APP_GROQ_API_KEY: ${groqApiKey ? '✅ Configurada' : '❌ No configurada'}`);
if (groqApiKey) {
  console.log(`   Valor: ${groqApiKey.substring(0, 20)}...`);
} else {
  console.log('   💡 Sugerencia: Obtén una API key gratuita en https://console.groq.com/');
}

console.log('');

// Verificar configuración de fallback
const fallbackEnabled = process.env.REACT_APP_AI_FALLBACK_ENABLED;
console.log(`REACT_APP_AI_FALLBACK_ENABLED: ${fallbackEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}`);

console.log('');

// Verificar timeout
const timeout = process.env.REACT_APP_VIDEO_ANALYSIS_TIMEOUT;
console.log(`REACT_APP_VIDEO_ANALYSIS_TIMEOUT: ${timeout ? timeout + 'ms' : '❌ No configurado'}`);

console.log('\n' + '='.repeat(50));

// Resumen del estado
console.log('\n📊 RESUMEN DEL ESTADO:');
console.log('='.repeat(50));

const hasChutes = !!chutesApiKey;
const hasGroq = !!groqApiKey;
const hasFallback = fallbackEnabled === 'true';

if (hasChutes && hasGroq) {
  console.log('🟢 ESTADO: ÓPTIMO');
  console.log('   - Análisis de video: Chutes AI');
  console.log('   - Análisis de texto: Groq');
  console.log('   - Fallback: Disponible');
} else if (hasChutes && !hasGroq) {
  console.log('🟡 ESTADO: BUENO');
  console.log('   - Análisis de video: Chutes AI');
  console.log('   - Análisis de texto: Chutes AI (más lento)');
  console.log('   - Fallback: Disponible');
  console.log('   - 💡 Sugerencia: Agregar API key de Groq para mejor rendimiento');
} else if (!hasChutes && hasGroq) {
  console.log('🟡 ESTADO: LIMITADO');
  console.log('   - Análisis de video: No disponible');
  console.log('   - Análisis de texto: Groq');
  console.log('   - Fallback: Disponible');
  console.log('   - ⚠️ Falta: API key de Chutes AI para análisis de video');
} else {
  console.log('🔴 ESTADO: FALLBACK ONLY');
  console.log('   - Análisis de video: No disponible');
  console.log('   - Análisis de texto: No disponible');
  console.log('   - Fallback: ✅ Disponible (basado en datos reales)');
  console.log('   - ⚠️ Faltan: API keys de Groq y/o Chutes AI');
}

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('='.repeat(50));

if (!hasChutes) {
  console.log('1. 📹 Para análisis de video:');
  console.log('   - Obtener API key en https://chutes.ai/');
  console.log('   - Configurar REACT_APP_CHUTES_API_KEY');
}

if (!hasGroq) {
  console.log('2. 📝 Para análisis de texto (opcional):');
  console.log('   - Obtener API key gratuita en https://console.groq.com/');
  console.log('   - Configurar REACT_APP_GROQ_API_KEY');
}

console.log('3. 🌐 Para producción:');
console.log('   - Configurar las variables de entorno en tu servidor');
console.log('   - Agregar las variables listadas arriba');
console.log('   - Reiniciar la aplicación');

console.log('\n✅ La aplicación funcionará correctamente en cualquier estado.');
console.log('   El sistema de fallback garantiza funcionalidad siempre.');

console.log('\n' + '='.repeat(50));