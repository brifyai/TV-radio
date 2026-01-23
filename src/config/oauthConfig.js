/**
 * Configuración de URLs de redirección OAuth para múltiples entornos
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
  
  // URLs de Producción - imetrics.cl
  PRODUCTION: {
    redirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://imetrics.cl/callback',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'tu_client_id_aqui',
    sslValid: true,
    status: 'ACTIVE',
    environment: 'production',
    primary: true,
    domain: 'imetrics.cl',
    domains: ['imetrics.cl', 'www.imetrics.cl'] // Soportar ambos dominios
  }
};

/**
 * Detecta automáticamente el entorno actual y retorna la configuración OAuth correspondiente
 */
export const getOAuthConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('🔍 Detectando entorno OAuth:', { hostname, protocol });
  
  // Producción: imetrics.cl (con o sin www)
  if (hostname.includes('imetrics.cl')) {
    console.log('✅ Entorno detectado: PRODUCCIÓN (imetrics.cl)');
    return OAUTH_CONFIG.PRODUCTION;
  }
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    console.log('✅ Entorno detectado: LOCAL (DESARROLLO)');
    return OAUTH_CONFIG.LOCAL;
  }
  
  // Fallback: usar configuración de producción
  console.log('⚠️ Entorno no reconocido, usando configuración PRODUCTION por defecto');
  return OAUTH_CONFIG.PRODUCTION;
};

/**
 * Genera la URL de redirección OAuth correcta para el entorno actual
 */
export const getRedirectUri = () => {
  const config = getOAuthConfig();
  console.log('🔒 Usando redirect URI:', config.redirectUri);
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
  const config = getOAuthConfig();
  const expectedUri = config.redirectUri;
  const currentOrigin = window.location.origin;
  const currentUri = `${currentOrigin}/callback`;
  
  // Normalizar URLs para comparación (remover www si existe)
  const normalizeUrl = (url) => url.replace('://www.', '://');
  const normalizedCurrent = normalizeUrl(currentUri);
  const normalizedExpected = normalizeUrl(expectedUri);
  
  const isValid = currentUri.includes('localhost') || 
                  normalizedCurrent === normalizedExpected ||
                  currentUri === expectedUri;
  
  console.log('🔍 Validando redirect_uri:', {
    environment: config.environment,
    current: currentUri,
    expected: expectedUri,
    normalized: { current: normalizedCurrent, expected: normalizedExpected },
    isValid,
    sslValid: config.sslValid
  });
  
  return isValid;
};

/**
 * Muestra una advertencia si el redirect_uri no está autorizado
 */
export const showRedirectUriWarning = () => {
  const config = getOAuthConfig();
  
  if (!validateRedirectUri()) {
    console.error('❌ ERROR: redirect_uri no autorizado para este entorno');
    console.error('❌ Entorno:', config.environment);
    console.error('❌ URL actual:', window.location.origin + '/callback');
    console.error('❌ URL esperada:', config.redirectUri);
    console.error('❌ ACCIÓN REQUERIDA: Configure esta URL en Google Cloud Console');
  } else {
    console.log('✅ redirect_uri válido para el entorno actual');
    
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
