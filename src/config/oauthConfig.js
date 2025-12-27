/**
 * Configuración de URLs de redirección OAuth para múltiples entornos
 * SOLUCIÓN DEFINITIVA SSL - Usar Netlify como producción principal
 */

// URLs de redirección autorizadas en Google Cloud Console
export const OAUTH_CONFIG = {
  // URLs de desarrollo local
  LOCAL: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_LOCAL || 'http://localhost:3000/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui',
    sslValid: false,
    environment: 'development'
  },
  
  // URLs de Netlify - PRODUCCIÓN PRINCIPAL (SSL VÁLIDO)
  NETLIFY: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_NETLIFY || 'https://tvradio2.netlify.app/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui',
    sslValid: true, // ✅ SSL VÁLIDO Y CONFIABLE
    status: 'ACTIVE',
    environment: 'production',
    primary: true // 🎯 PRODUCCIÓN PRINCIPAL
  },
  
  // URLs de Coolify - DESARROLLO/TESTING (SSL PROBLEMÁTICO)
  COOLIFY: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_COOLIFY || 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui',
    sslValid: false, // ❌ SSL INVÁLIDO - ERR_CERT_AUTHORITY_INVALID
    status: 'DEVELOPMENT_ONLY',
    environment: 'development',
    warning: 'SSL Certificate Invalid - Use for development only'
  }
};

/**
 * Detecta automáticamente el entorno actual y retorna la configuración OAuth correspondiente
 * SOLUCIÓN DEFINITIVA SSL - Netlify como producción principal
 */
export const getOAuthConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('🔍 Detectando entorno OAuth:', { hostname, protocol });
  
  // 🎯 PRIORIDAD 1: Netlify (Producción principal con SSL válido)
  if (hostname.includes('netlify.app') || hostname.includes('netlify')) {
    console.log('✅ Entorno detectado: NETLIFY (PRODUCCIÓN PRINCIPAL - SSL VÁLIDO)');
    return OAUTH_CONFIG.NETLIFY;
  }
  
  // ⚠️ PRIORIDAD 2: Coolify (Desarrollo/testing - SSL problemático)
  if (hostname.includes('coolify.app') ||
      hostname.includes('sslip.io') ||
      process.env.REACT_APP_USE_COOLIFY_DOMAIN === 'true') {
    console.log('⚠️ Entorno detectado: COOLIFY (DESARROLLO - SSL PROBLEMÁTICO)');
    console.warn('⚠️ ADVERTENCIA: SSL Certificate Invalid - Use for development only');
    return OAUTH_CONFIG.COOLIFY;
  }
  
  // 🔧 PRIORIDAD 3: Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    console.log('✅ Entorno detectado: LOCAL (DESARROLLO)');
    return OAUTH_CONFIG.LOCAL;
  }
  
  // Fallback: usar configuración de producción (Netlify)
  console.log('⚠️ Entorno no reconocido, usando configuración NETLIFY por defecto');
  return OAUTH_CONFIG.NETLIFY;
};

/**
 * Genera la URL de redirección OAuth correcta para el entorno actual
 * SOLUCIÓN DEFINITIVA SSL - Priorizar Netlify (SSL válido)
 */
export const getRedirectUri = () => {
  const config = getOAuthConfig();
  
  // 🎯 PRIORIDAD 1: Netlify (SSL válido y confiable)
  if (config === OAUTH_CONFIG.NETLIFY) {
    console.log('🔒 ✅ PRODUCCIÓN: Usando URL Netlify con SSL válido:', config.redirectUri);
    console.log('🔒 ✅ ESTADO SSL: VÁLIDO - Sin advertencias de seguridad');
    return config.redirectUri;
  }
  
  // ⚠️ PRIORIDAD 2: Coolify (SSL problemático - solo desarrollo)
  if (config === OAUTH_CONFIG.COOLIFY) {
    console.warn('⚠️ DESARROLLO: Usando URL Coolify con SSL problemático:', config.redirectUri);
    console.warn('⚠️ ESTADO SSL: INVÁLIDO - ERR_CERT_AUTHORITY_INVALID');
    console.warn('⚠️ ADVERTENCIA: Requiere hacer clic en "Continuar" múltiples veces');
    console.warn('⚠️ RECOMENDACIÓN: Use Netlify para producción');
    return config.redirectUri;
  }
  
  // 🔧 PRIORIDAD 3: Local development
  console.log('🔒 INFO: Usando configuración LOCAL:', config.redirectUri);
  return config.redirectUri;
};

/**
 * Obtiene el Client ID de Google OAuth para el entorno actual
 */
export const getGoogleClientId = () => {
  const config = getOAuthConfig();
  return config.clientId;
};

/**
 * Valida si la URL de redirección actual está autorizada
 * SOLUCIÓN DEFINITIVA SSL - Validación mejorada
 */
export const validateRedirectUri = () => {
  const config = getOAuthConfig();
  const expectedUri = config.redirectUri;
  const currentOrigin = window.location.origin;
  const currentUri = `${currentOrigin}/callback`;
  
  // Para Netlify y Coolify, validar contra la URL configurada
  if (config === OAUTH_CONFIG.NETLIFY || config === OAUTH_CONFIG.COOLIFY) {
    const isValid = expectedUri === currentUri;
    console.log('🔍 Validando redirect_uri:', {
      environment: config.environment,
      current: currentUri,
      expected: expectedUri,
      isValid,
      sslValid: config.sslValid
    });
    return isValid;
  }
  
  // Para local, permitir flexibilidad
  const isValid = currentUri.includes('localhost') || currentUri === expectedUri;
  console.log('🔍 Validando redirect_uri (LOCAL):', {
    current: currentUri,
    expected: expectedUri,
    isValid
  });
  
  return isValid;
};

/**
 * Muestra una advertencia si el redirect_uri no está autorizado
 * SOLUCIÓN DEFINITIVA SSL - Advertencias mejoradas
 */
export const showRedirectUriWarning = () => {
  const config = getOAuthConfig();
  
  if (!validateRedirectUri()) {
    console.error('❌ ERROR: redirect_uri no autorizado para este entorno');
    console.error('❌ Entorno:', config.environment);
    console.error('❌ URL actual:', window.location.origin + '/callback');
    console.error('❌ URL esperada:', config.redirectUri);
    console.error('❌ ACCIÓN REQUERIDA: Configure esta URL en Google Cloud Console');
    
    // Mostrar advertencia específica para SSL
    if (config === OAUTH_CONFIG.COOLIFY && !config.sslValid) {
      console.error('🔒 ADVERTENCIA SSL: El certificado no es confiable');
      console.error('🔒 SOLUCIÓN: Use Netlify (https://tvradio2.netlify.app) para producción');
    }
  } else {
    console.log('✅ redirect_uri válido para el entorno actual');
    
    // Mostrar estado SSL
    if (config.sslValid) {
      console.log('🔒 ✅ SSL: Válido y confiable');
    } else {
      console.warn('🔒 ⚠️ SSL: Inválido o no disponible');
    }
  }
};

// Ejecutar validación al cargar el módulo
if (typeof window !== 'undefined') {
  showRedirectUriWarning();
}
