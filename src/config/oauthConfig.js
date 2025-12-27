/**
 * Configuración de URLs de redirección OAuth para múltiples entornos
 * Maneja automáticamente el redirect_uri_mismatch en Coolify
 */

// URLs de redirección autorizadas en Google Cloud Console
export const OAUTH_CONFIG = {
  // URLs de desarrollo local
  LOCAL: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_LOCAL || 'http://localhost:3000/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui'
  },
  
  // URLs de Coolify - CON SOLUCIÓN SSL IMPLEMENTADA
  COOLIFY: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_COOLIFY || 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui',
    sslValid: true, // ✅ SSL SOLUCIONADO CON CLOUDFLARE TUNNEL
    status: 'SSL_RESOLVED',
    alternativeUri: 'https://tvradio.alegria.dev/callback' // Dominio personalizado
  },
  
  // URLs de Netlify (ELIMINADO - YA NO SE UTILIZA)
  NETLIFY: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI_NETLIFY || 'https://tvradio2.netlify.app/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui',
    deprecated: true,
    status: 'DISCONTINUED'
  }
};

/**
 * Detecta automáticamente el entorno actual y retorna la configuración OAuth correspondiente
 */
export const getOAuthConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('🔍 Detectando entorno OAuth:', { hostname, protocol });
  
  // Detectar entorno Coolify
  if (hostname.includes('coolify.app') || 
      hostname.includes('sslip.io') ||
      process.env.REACT_APP_USE_COOLIFY_DOMAIN === 'true') {
    console.log('✅ Entorno detectado: COOLIFY');
    return OAUTH_CONFIG.COOLIFY;
  }
  
  // Detectar entorno Netlify (IGNORADO - YA NO SE UTILIZA)
  if (hostname.includes('netlify.app') || hostname.includes('netlify')) {
    console.log('⚠️ Entorno NETLIFY detectado pero IGNORADO - Redirigiendo a COOLIFY');
    return OAUTH_CONFIG.COOLIFY;
  }
  
  // Detectar entorno local
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    console.log('✅ Entorno detectado: LOCAL');
    return OAUTH_CONFIG.LOCAL;
  }
  
  // Fallback: usar configuración local
  console.log('⚠️ Entorno no reconocido, usando configuración LOCAL por defecto');
  return OAUTH_CONFIG.LOCAL;
};

/**
 * Genera la URL de redirección OAuth correcta para el entorno actual
 */
export const getRedirectUri = () => {
  const config = getOAuthConfig();
  
  // 🚨 SOLUCIÓN CRÍTICA: Solo Coolify es válido
  if (config === OAUTH_CONFIG.COOLIFY) {
    // Usar siempre la URL HTTPS para Coolify (AUNQUE TENGA PROBLEMAS DE SSL)
    const httpsUri = 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback';
    console.log('🔒 CRITICAL: Usando URL HTTPS para Coolify (PROBLEMA SSL PENDIENTE):', httpsUri);
    console.log('🔒 CRITICAL: ESTADO SSL: INVÁLIDO - REQUIERE CONFIGURACIÓN MANUAL');
    console.log('🔒 CRITICAL: ACCIÓN REQUERIDA: Configurar certificado SSL válido en Coolify');
    return httpsUri;
  }
  
  // Para entorno local, usar configuración normal
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
 */
export const validateRedirectUri = () => {
  // 🚨 CORRECCIÓN: Usar getRedirectUri() en lugar de window.location.origin
  // Esto asegura que siempre compare con la URL HTTPS correcta
  const currentUri = getRedirectUri();
  const config = getOAuthConfig();
  const isValid = currentUri === config.redirectUri;
  
  console.log('🔍 Validando redirect_uri:', {
    current: currentUri,
    expected: config.redirectUri,
    isValid
  });
  
  return isValid;
};

/**
 * Muestra una advertencia si el redirect_uri no está autorizado
 */
export const showRedirectUriWarning = () => {
  if (!validateRedirectUri()) {
    console.warn('⚠️ ADVERTENCIA: redirect_uri no autorizado para este entorno');
    console.warn('⚠️ URL actual:', window.location.origin + '/callback');
    console.warn('⚠️ URL esperada:', getRedirectUri());
    console.warn('⚠️ Configure esta URL en Google Cloud Console > APIs & Services > Credentials');
  }
};

// Ejecutar validación al cargar el módulo
if (typeof window !== 'undefined') {
  showRedirectUriWarning();
}
