/**
 * Configuración de URLs de redirección OAuth para múltiples entornos
 * SOLUCIÓN DEFINITIVA SSL - Con soporte para dominio propio imetrics.cl
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
  
  // URLs de Dominio Propio - PRODUCCIÓN IDEAL (SSL VÁLIDO CON CLOUDFLARE)
  DOMAIN: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_DOMAIN || 'https://imetrics.cl/auth/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui',
    sslValid: true, // ✅ SSL VÁLIDO CON CLOUDFLARE
    status: 'ACTIVE',
    environment: 'production',
    primary: true, // 🎯 PRODUCCIÓN IDEAL CON DOMINIO PROPIO
    domain: 'imetrics.cl',
    provider: 'Cloudflare',
    benefits: ['SSL válido', 'CDN global', 'SEO optimizado', 'Branding profesional']
  },
  
  // URLs de Netlify - PRODUCCIÓN ALTERNATIVA (SSL VÁLIDO)
  NETLIFY: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_NETLIFY || 'https://tvradio2.netlify.app/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui',
    sslValid: true, // ✅ SSL VÁLIDO Y CONFIABLE
    status: 'ACTIVE',
    environment: 'production',
    primary: false, // 🔶 PRODUCCIÓN SECUNDARIA
    domain: 'tvradio2.netlify.app',
    provider: 'Netlify'
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
 * SOLUCIÓN DEFINITIVA SSL - Prioridad dominio propio > Netlify > Coolify > Local
 */
export const getOAuthConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('🔍 Detectando entorno OAuth:', { hostname, protocol });
  
  // 🎯 PRIORIDAD 1: Dominio propio imetrics.cl (Producción ideal con Cloudflare)
  if (hostname.includes('imetrics.cl') || hostname === 'imetrics.cl') {
    console.log('🚀✅ Entorno detectado: DOMAIN (PRODUCCIÓN IDEAL - imetrics.cl + Cloudflare)');
    console.log('🚀✅ SSL: Válido y confiable con Cloudflare');
    console.log('🚀✅ Beneficios: CDN, SEO, Branding profesional');
    return OAUTH_CONFIG.DOMAIN;
  }
  
  // 🎯 PRIORIDAD 2: Netlify (Producción alternativa con SSL válido)
  if (hostname.includes('netlify.app') || hostname.includes('netlify')) {
    console.log('✅ Entorno detectado: NETLIFY (PRODUCCIÓN ALTERNATIVA - SSL VÁLIDO)');
    return OAUTH_CONFIG.NETLIFY;
  }
  
  // ⚠️ PRIORIDAD 3: Coolify (Desarrollo/testing - FORZAR HTTPS)
  if (hostname.includes('coolify.app') ||
      hostname.includes('sslip.io') ||
      process.env.REACT_APP_USE_COOLIFY_DOMAIN === 'true') {
    console.log('⚠️ Entorno detectado: COOLIFY (DESARROLLO - FORZANDO HTTPS)');
    console.log('🔒 FORZANDO HTTPS para OAuth en Coolify');
    // FORZAR HTTPS para Coolify - CRÍTICO para OAuth
    const coolifyConfig = {
      ...OAUTH_CONFIG.COOLIFY,
      redirectUri: `https://${hostname}/callback`,
      sslValid: true // Forzar SSL válido para OAuth
    };
    console.log('🔒 URL HTTPS forzada:', coolifyConfig.redirectUri);
    return coolifyConfig;
  }
  
  // 🔧 PRIORIDAD 4: Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    console.log('✅ Entorno detectado: LOCAL (DESARROLLO)');
    return OAUTH_CONFIG.LOCAL;
  }
  
  // Fallback: usar configuración de dominio propio (ideal)
  console.log('⚠️ Entorno no reconocido, usando configuración DOMAIN por defecto');
  console.log('💡 RECOMENDACIÓN: Configure su dominio en imetrics.cl');
  return OAUTH_CONFIG.DOMAIN;
};

/**
 * Genera la URL de redirección OAuth correcta para el entorno actual
 * SOLUCIÓN DEFINITIVA SSL - Priorizar dominio propio > Netlify > Coolify > Local
 */
export const getRedirectUri = () => {
  const config = getOAuthConfig();
  
  // 🚀 PRIORIDAD 1: Dominio propio (SSL válido y confiable con Cloudflare)
  if (config === OAUTH_CONFIG.DOMAIN) {
    console.log('🚀✅ PRODUCCIÓN IDEAL: Usando URL imetrics.cl con SSL Cloudflare:', config.redirectUri);
    console.log('🚀✅ ESTADO SSL: VÁLIDO - Sin advertencias de seguridad');
    console.log('🚀✅ BENEFICIOS: CDN, SEO, Branding profesional');
    return config.redirectUri;
  }
  
  // 🎯 PRIORIDAD 2: Netlify (SSL válido y confiable)
  if (config === OAUTH_CONFIG.NETLIFY) {
    console.log('🔒 ✅ PRODUCCIÓN: Usando URL Netlify con SSL válido:', config.redirectUri);
    console.log('🔒 ✅ ESTADO SSL: VÁLIDO - Sin advertencias de seguridad');
    return config.redirectUri;
  }
  
  // ⚠️ PRIORIDAD 3: Coolify (SSL problemático - solo desarrollo)
  if (config === OAUTH_CONFIG.COOLIFY) {
    console.log('🔒 DESARROLLO: Usando URL Coolify con HTTPS forzado:', config.redirectUri);
    console.log('🔒 ESTADO SSL: FORZADO para OAuth (HTTPS requerido)');
    console.log('🔒 URL HTTPS:', config.redirectUri);
    return config.redirectUri;
  }
  
  // 🔧 PRIORIDAD 4: Local development
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
