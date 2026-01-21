import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// URL del backend proxy - configuración dinámica
const getApiBaseUrl = () => {
  // Prioridad: variable de entorno > detección automática > fallback
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL !== 'http://localhost:3001') {
    return process.env.REACT_APP_API_URL;
  }
  
  // Detección automática del dominio actual
  const currentOrigin = window.location.origin;
  const isLocalhost = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
  
  if (isLocalhost) {
    return 'http://localhost:3001'; // Desarrollo local
  } else {
    // Producción: usar el mismo dominio (path relativo)
    // Esto permite que funcione correctamente detrás de un proxy (como Easypanel/Nginx)
    // donde el frontend y el backend se sirven desde el mismo origen/puerto
    return ''; 
  }
};

const API_BASE_URL = getApiBaseUrl();

const GOOGLE_SCOPES = [
  'email',
  'profile',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/analytics.edit',
  'https://www.googleapis.com/auth/analytics.manage.users.readonly'
];

class GoogleAnalyticsService {
  constructor() {
    this.clientId = GOOGLE_CLIENT_ID;
    this.clientSecret = GOOGLE_CLIENT_SECRET;
    this.apiBaseUrl = API_BASE_URL;
    
    // Debug logging para verificar la URL configurado (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG GoogleAnalyticsService constructor:');
      console.log('  - NODE_ENV:', process.env.NODE_ENV);
      console.log('  - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      console.log('  - API_BASE_URL final:', this.apiBaseUrl);
      console.log('  - Current origin:', window.location.origin);
    }
  }

  /**
   * Generate OAuth URL for Google authentication
   */
  generateAuthUrl(redirectUri) {
    const invalidClientIds = [
      '560729460022-rjim3hh4e47qkl5nmldpvo1n1iqcfggs.apps.googleusercontent.com',
      'your_google_client_id_here.apps.googleusercontent.com',
      'YOUR_CLIENT_ID.apps.googleusercontent.com'
    ];
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG generateAuthUrl:');
      console.log('  - client_id:', this.clientId);
      console.log('  - redirect_uri:', redirectUri);
    }
    
    if (!this.clientId ||
        !this.clientId.includes('.apps.googleusercontent.com') ||
        invalidClientIds.includes(this.clientId)) {
      throw new Error('Google OAuth client_id inválido. Configure credenciales válidas en Google Cloud Console.');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: GOOGLE_SCOPES.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG: Parámetros OAuth generados:', params.toString());
      console.log('🔍 DEBUG: URL completa:', `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`);
    }

    return `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   * OPTIMIZADO: Reducido timeout y mejor manejo de errores
   */
  async exchangeCodeForTokens(code, redirectUri) {
    console.log('🔄 DEBUG: Iniciando intercambio de código por tokens...');
    console.log('🔄 DEBUG: Código recibido (primeros 20 chars):', code.substring(0, 20) + '...');
    console.log('🔄 DEBUG: Redirect URI:', redirectUri);
    
    try {
      // 🚨 OPTIMIZACIÓN: Timeout reducido para evitar expiración de código
      const response = await axios.post(GOOGLE_TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000 // 🔧 REDUCIDO: 15 segundos en lugar de 30
      });

      console.log('✅ DEBUG: Tokens obtenidos exitosamente');
      console.log('✅ DEBUG: Access token length:', response.data.access_token?.length || 0);
      console.log('✅ DEBUG: Refresh token available:', !!response.data.refresh_token);
      console.log('✅ DEBUG: Expires in:', response.data.expires_in, 'seconds');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error intercambiando código por tokens:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      
      // 🔧 MANEJO MEJORADO de errores específicos
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        console.log('🔍 DEBUG: Error 400 details:', errorData);
        
        // Detectar específicamente códigos expirados
        if (errorData.error === 'invalid_grant' || 
            errorData.error_description?.includes('expired') ||
            errorData.error_description?.includes('invalid') ||
            error.message.includes('expired')) {
          throw new Error('Código de autorización expirado. Esto puede deberse a demoras en el procesamiento. Por favor, intenta conectar nuevamente de forma más rápida.');
        } else {
          throw new Error(`Código de autorización inválido: ${errorData.error_description || error.message}`);
        }
      } else if (error.response?.status === 503) {
        throw new Error('Servicio de Google temporalmente no disponible. Por favor, intenta nuevamente en unos minutos.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('La conexión está tardando demasiado. Por favor, verifica tu conexión e intenta nuevamente.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('No se puede conectar con Google. Verifica tu conexión a internet.');
      } else {
        throw new Error(`Error al intercambiar código por tokens: ${error.response?.data?.error_description || error.message}`);
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(GOOGLE_TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get user information from Google
   */
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(GOOGLE_USERINFO_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user info:', error.response?.data || error.message);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Método auxiliar para reintentos automáticos
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const shouldRetry = error.code === 'ECONNABORTED' ||
                           error.response?.status >= 500 ||
                           error.response?.status === 429;
        
        if (isLastAttempt || !shouldRetry) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 Reintentando en ${delay}ms (intento ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Get list of Google Analytics accounts - USA PROXY BACKEND
   */
  async getAccounts(accessToken) {
    return this.retryWithBackoff(async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 DEBUG: Llamando al backend proxy para obtener cuentas');
          console.log('🔍 DEBUG: API URL:', `${this.apiBaseUrl}/api/analytics/accounts`);
          console.log('🔍 DEBUG: Entorno actual:', process.env.NODE_ENV);
          console.log('🔍 DEBUG: URL base configurada:', this.apiBaseUrl);
        }
           
          const response = await axios.get(`${this.apiBaseUrl}/api/analytics/accounts`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 45000
          });

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ DEBUG: Respuesta exitosa del backend');
            console.log('✅ DEBUG: Cuentas encontradas:', response.data.length || 0);
          }

          return response.data;
          
        } catch (error) {
          console.error('❌ ERROR DETALLADO al obtener cuentas:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            isNetworkError: !error.response,
            isTimeout: error.code === 'ECONNABORTED'
          });
          
          if (error.code === 'ECONNABORTED') {
            throw new Error('La conexión está tardando más de lo esperado. Esto puede deberse a la carga del servidor. Por favor, intenta nuevamente en unos momentos.');
          } else if (!error.response) {
            throw new Error(`Error de conexión: No se puede conectar con el servidor backend en ${this.apiBaseUrl}. Verifica que el servidor esté corriendo.`);
          } else if (error.response?.status === 401) {
            throw new Error('Error de autenticación: el token de acceso ha expirado o es inválido. Por favor, vuelve a conectar tu cuenta de Google Analytics.');
          } else if (error.response?.status === 403) {
            throw new Error('Error de permisos: no tienes acceso a las cuentas de Google Analytics. Verifica los permisos de tu aplicación en Google Cloud Console.');
          } else if (error.response?.status === 429) {
            throw new Error('Límite de velocidad excedido: Google Analytics ha recibido demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.');
          } else if (error.response?.status >= 500) {
            throw new Error('Error del servidor: el servicio no está disponible temporalmente. Por favor, intenta más tarde.');
          } else {
            throw new Error(`Error al obtener cuentas: ${error.response?.data?.error || error.message}`);
          }
        }
    });
  }

  /**
   * Get list of properties for a specific account - USA PROXY BACKEND
   */
  async getProperties(accessToken, accountId) {
    try {
      // Validar que accountId no sea undefined o vacío
      if (!accountId || accountId === 'undefined') {
        throw new Error('ID de cuenta inválido: el accountId no puede ser undefined o vacío');
      }
      
      console.log(`🔍 DEBUG: Obteniendo propiedades para cuenta ${accountId}`);
      console.log(`🔍 DEBUG: URL completa: ${this.apiBaseUrl}/api/analytics/properties/${accountId}`);
      
      const response = await axios.get(
        `${this.apiBaseUrl}/api/analytics/properties/${accountId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ DEBUG: Propiedades obtenidas: ${response.data?.length || 0}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ ERROR DETALLADO al obtener propiedades:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        accountId: accountId
      });
      
      if (error.response?.status === 401) {
        throw new Error('Error de autenticación: el token de acceso ha expirado. Por favor, vuelve a conectar tu cuenta.');
      } else if (error.response?.status === 403) {
        throw new Error('Error de permisos: no tienes acceso a las propiedades de esta cuenta.');
      } else if (error.response?.status === 404) {
        throw new Error('Cuenta no encontrada: la cuenta especificada no existe o no tienes acceso a ella.');
      } else if (error.response?.status === 400) {
        // Manejar específicamente el error de accountId inválido
        const errorMessage = error.response?.data?.error || error.message;
        if (errorMessage.includes('inválido') || errorMessage.includes('undefined')) {
          throw new Error('ID de cuenta inválido: por favor, selecciona una cuenta válida e intenta nuevamente.');
        }
        throw new Error(`Solicitud inválida: ${errorMessage}`);
      } else {
        throw new Error(`Error al obtener propiedades: ${error.response?.data?.error || error.message}`);
      }
    }
  }

  /**
   * Get analytics data for a specific property - USA PROXY BACKEND
   */
  async getAnalyticsData(accessToken, propertyId, metrics, dimensions, dateRange) {
    return this.retryWithBackoff(async () => {
      try {
        console.log(`🔍 DEBUG: Obteniendo datos de analytics para propiedad ${propertyId}`);
        console.log(`🔍 DEBUG: URL completa: ${this.apiBaseUrl}/api/analytics/data/${propertyId}`);
        console.log(`🔍 DEBUG: Entorno actual:`, process.env.NODE_ENV);
        console.log(`🔍 DEBUG: Métricas solicitadas:`, metrics);
        console.log(`🔍 DEBUG: Dimensiones solicitadas:`, dimensions);
        console.log(`🔍 DEBUG: Rango de fechas:`, dateRange);
        
        const response = await axios.post(
          `${this.apiBaseUrl}/api/analytics/data/${propertyId}`,
          {
            metrics,
            dimensions,
            dateRange
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 60000
          }
        );

        console.log(`✅ DEBUG: Respuesta recibida de Google Analytics API`);
        console.log(`✅ DEBUG: Estructura de respuesta:`, {
          hasRows: !!response.data.rows,
          rowsCount: response.data.rows?.length || 0,
          hasTotals: !!response.data.totals,
          totalsCount: response.data.totals?.length || 0,
          hasMaximums: !!response.data.maximums,
          hasMinimums: !!response.data.minimums,
          rowCount: response.data.rowCount,
          metadata: response.data.metadata
        });
        
        // Si hay datos, mostrar una muestra
        if (response.data.rows && response.data.rows.length > 0) {
          console.log(`🔍 DEBUG: Muestra de datos (primeras 3 filas):`, response.data.rows.slice(0, 3));
        }
        
        if (response.data.totals && response.data.totals.length > 0) {
          console.log(`🔍 DEBUG: Datos de totales:`, response.data.totals);
        }

        return response.data;
        
      } catch (error) {
        console.error('❌ ERROR DETALLADO al obtener datos de analytics:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          isNetworkError: !error.response,
          isTimeout: error.code === 'ECONNABORTED'
        });
        
        if (error.code === 'ECONNABORTED') {
          throw new Error('La conexión está tardando más de lo esperado. Esto puede deberse a la carga del servidor. Por favor, intenta nuevamente en unos momentos.');
        } else if (!error.response) {
          throw new Error(`Error de conexión: No se puede conectar con el servidor backend en ${this.apiBaseUrl}. Verifica que el servidor esté corriendo.`);
        } else if (error.response?.status === 401) {
          throw new Error('Error de autenticación: el token de acceso ha expirado o es inválido. Por favor, vuelve a conectar tu cuenta.');
        } else if (error.response?.status === 403) {
          throw new Error('Error de permisos: no tienes acceso a los datos de esta propiedad.');
        } else if (error.response?.status === 400) {
          // Mostrar el error específico que viene del servidor
          const serverError = error.response?.data?.error || error.response?.data?.message || error.message;
          console.log('🔍 DEBUG: Error 400 del servidor:', serverError);
          console.log('🔍 DEBUG: Detalles completos:', error.response?.data);
          
          // Si el error contiene información específica, mostrarla
          if (typeof serverError === 'object' && serverError.message) {
            throw new Error(`Solicitud inválida: ${serverError.message}`);
          } else if (typeof serverError === 'string' && serverError.length > 0) {
            throw new Error(`Solicitud inválida: ${serverError}`);
          } else {
            throw new Error('Solicitud inválida: verifica las métricas, dimensiones y rango de fechas seleccionados.');
          }
        } else if (error.response?.status === 429) {
          throw new Error('Límite de velocidad excedido: espera unos minutos e intenta nuevamente.');
        } else if (error.response?.status >= 500) {
          throw new Error('Error del servidor: el servicio no está disponible temporalmente. Por favor, intenta más tarde.');
        } else {
          throw new Error(`Error al obtener datos de analytics: ${error.response?.data?.error || error.message}`);
        }
      }
    });
  }

  /**
   * Alias para compatibilidad con minuteByMinuteAnalysisService
   * Convierte el formato de request de GA4 API al formato esperado por el backend
   */
  async runReport(request) {
    try {
      console.log('🔍 DEBUG: runReport called with request:', request);
      
      // Extraer datos del request
      const property = request.property;
      const dateRanges = request.dateRanges || [];
      const dimensions = request.dimensions || [];
      const metrics = request.metrics || [];
      
      // Extraer propertyId del formato "properties/123456789"
      const propertyId = property.replace('properties/', '');
      
      // Convertir dateRanges al formato esperado
      const dateRange = dateRanges.length > 0 ? {
        startDate: dateRanges[0].startDate,
        endDate: dateRanges[0].endDate
      } : null;
      
      if (!dateRange) {
        throw new Error('No date range provided in request');
      }
      
      // Convertir dimensions y metrics al formato esperado
      const dimensionsArray = dimensions.map(dim => dim.name);
      const metricsArray = metrics.map(metric => metric.name);
      
      // Obtener accessToken del contexto o storage
      const accessToken = localStorage.getItem('google_access_token') || sessionStorage.getItem('google_access_token');
      
      if (!accessToken) {
        throw new Error('No access token available. Please authenticate with Google Analytics.');
      }
      
      console.log('🔍 DEBUG: Converting request to backend format:', {
        propertyId,
        dateRange,
        dimensions: dimensionsArray,
        metrics: metricsArray
      });
      
      // Llamar al método getAnalyticsData
      return await this.getAnalyticsData(accessToken, propertyId, metricsArray, dimensionsArray, dateRange);
      
    } catch (error) {
      console.error('❌ Error in runReport:', error);
      throw error;
    }
  }

  /**
   * Validate if the access token is still valid
   */
  async validateAccessToken(accessToken) {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke access token
   */
  async revokeAccessToken(accessToken) {
    try {
      await axios.post(`https://oauth2.googleapis.com/revoke?token=${accessToken}`);
      return true;
    } catch (error) {
      console.error('Error revoking access token:', error);
      return false;
    }
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService();