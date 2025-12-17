const axios = require('axios');

// Configuración de Google Analytics API
const GOOGLE_ANALYTICS_API_BASE = 'https://analyticsdata.googleapis.com';
const GOOGLE_ANALYTICS_ADMIN_API_BASE = 'https://analyticsadmin.googleapis.com';

// Middleware mejorado para verificar el token de autorización
const verifyAuthToken = (headers) => {
  console.log('🔍 DEBUG: Verificando token de autorización...');
  console.log('🔍 DEBUG: Headers recibidos:', Object.keys(headers || {}));
  
  const authHeader = headers.authorization || headers.Authorization;
  
  if (!authHeader) {
    console.log('❌ DEBUG: No se encontró header de autorización');
    throw new Error('Header de autorización no encontrado');
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ DEBUG: Header de autorización no tiene formato Bearer');
    throw new Error('Header de autorización debe tener formato "Bearer <token>"');
  }
  
  const token = authHeader.substring(7);
  console.log('✅ DEBUG: Token extraído, longitud:', token.length);
  
  return token;
};

// Manejador para obtener cuentas de Google Analytics
exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Manejar solicitudes OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('🔍 DEBUG: Nueva solicitud recibida');
    console.log('🔍 DEBUG: HTTP Method:', event.httpMethod);
    console.log('🔍 DEBUG: Path original:', event.path);
    console.log('🔍 DEBUG: Headers disponibles:', Object.keys(event.headers || {}));
    
    const path = event.path.replace('/.netlify/functions/analytics-proxy', '');
    console.log('🔍 DEBUG: Path procesado:', path);
    
    // Endpoint de health check para debugging
    if (event.httpMethod === 'GET' && path === '/health') {
      console.log('✅ DEBUG: Health check solicitado');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'unknown'
        })
      };
    }

    // Verificar token de autorización para endpoints que lo requieren
    let accessToken;
    try {
      accessToken = verifyAuthToken(event.headers);
    } catch (authError) {
      console.log('❌ DEBUG: Error de autenticación:', authError.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'No autorizado',
          message: authError.message,
          timestamp: new Date().toISOString()
        })
      };
    }

    // Endpoint para obtener cuentas
    if (event.httpMethod === 'GET' && path === '/api/analytics/accounts') {
      console.log('🔍 Obteniendo cuentas de Google Analytics...');
      
      const response = await axios.get(
        `${GOOGLE_ANALYTICS_ADMIN_API_BASE}/v1beta/accounts`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Cuentas encontradas: ${response.data.accounts?.length || 0}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data.accounts || [])
      };
    }

    // Endpoint para obtener propiedades de una cuenta
    if (event.httpMethod === 'GET' && path.startsWith('/api/analytics/properties/')) {
      const accountId = path.split('/').pop();
      console.log(`🔍 Obteniendo propiedades para la cuenta: ${accountId}`);
      
      // Validar que accountId no sea undefined o vacío
      if (!accountId || accountId === 'undefined') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'ID de cuenta inválido',
            details: 'El accountId no puede ser undefined o vacío'
          })
        };
      }
      
      // Construir el filtro correctamente según la especificación de la API de Google Analytics
      const filter = `parent:accounts/${accountId}`;
      console.log(`🔍 Usando filtro: ${filter}`);
      
      const response = await axios.get(
        `${GOOGLE_ANALYTICS_ADMIN_API_BASE}/v1beta/properties?filter=${encodeURIComponent(filter)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Propiedades encontradas: ${response.data.properties?.length || 0}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data.properties || [])
      };
    }

    // Endpoint para obtener datos de analytics de una propiedad
    if (event.httpMethod === 'POST' && path.startsWith('/api/analytics/data/')) {
      const propertyId = path.split('/').pop();
      
      console.log('🔍 DEBUG: Procesando solicitud de datos para propiedad:', propertyId);
      console.log('🔍 DEBUG: HTTP Method:', event.httpMethod);
      console.log('🔍 DEBUG: Path completo:', path);
      
      // Verificar que event.body existe y no está vacío
      if (!event.body || event.body.trim() === '') {
        console.log('❌ DEBUG: Cuerpo de solicitud vacío');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Cuerpo de la solicitud requerido',
            details: 'Se requiere enviar métricas, dimensiones y rango de fechas en el cuerpo'
          })
        };
      }
      
      let requestData;
      try {
        console.log('🔍 DEBUG: Intentando parsear JSON del cuerpo...');
        requestData = JSON.parse(event.body);
        console.log('✅ DEBUG: JSON parseado exitosamente');
      } catch (parseError) {
        console.log('❌ DEBUG: Error al parsear JSON:', parseError.message);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'JSON inválido en el cuerpo de la solicitud',
            details: `Error de parseo: ${parseError.message}`,
            receivedBody: event.body.substring(0, 200) // Primeros 200 chars para debug
          })
        };
      }
      
      const { metrics, dimensions, dateRange } = requestData;
      
      console.log(`🔍 Obteniendo datos de analytics para propiedad: ${propertyId}`);
      console.log(`🔍 Métricas solicitadas:`, metrics);
      console.log(`🔍 Dimensiones solicitadas:`, dimensions);
      console.log(`🔍 Rango de fechas:`, dateRange);
      
      // Mapeo de dimensiones a nombres correctos de GA4 API
      const dimensionMapping = {
        'date': 'date',
        'minute': 'minute',
        'hour': 'hour',
        'dateHour': 'dateHour',
        'dateMinute': 'nthMinute',  // Corregido: dateMinute no existe, usar nthMinute
        'country': 'country',
        'city': 'city',
        'deviceCategory': 'deviceCategory',
        'browser': 'browser',
        'operatingSystem': 'operatingSystem',
        'source': 'source',
        'medium': 'medium',
        'campaign': 'campaign',
        'pagePath': 'pagePath',
        'pageTitle': 'pageTitle',
        'sessionSource': 'sessionSource',
        'sessionMedium': 'sessionMedium',
        'sessionCampaign': 'sessionCampaign',
        'landingPage': 'landingPagePlusQueryString',
        'exitPage': 'exitPagePath',
        'pageLocation': 'pageLocation'
      };
      
      // Mapeo de métricas a nombres correctos de GA4 API
      const metricMapping = {
        'activeUsers': 'activeUsers',
        'sessions': 'sessions',
        'pageviews': 'screenPageViews',
        'bounceRate': 'bounceRate',
        'sessionDuration': 'averageSessionDuration',
        'eventCount': 'eventCount',
        'conversions': 'conversions',
        'users': 'totalUsers',
        'newUsers': 'newUsers',
        'engagementRate': 'engagementRate',
        'engagedSessions': 'engagedSessions',
        'engagementDuration': 'userEngagementDuration'
      };
      
      // Mapear dimensiones a los nombres correctos de la API
      const apiDimensions = dimensions?.map(dim => {
        const mapped = dimensionMapping[dim] || dim;
        console.log(`🔍 Mapeando dimensión: ${dim} -> ${mapped}`);
        return mapped;
      }) || [];
      
      console.log(`🔍 Dimensiones mapeadas para API:`, apiDimensions);
      
      // Validar que tenemos dimensiones válidas
      if (apiDimensions.length === 0) {
        console.log('❌ DEBUG: No se proporcionaron dimensiones válidas');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Dimensiones requeridas',
            details: 'Debe proporcionar al menos una dimensión válida',
            availableDimensions: Object.keys(dimensionMapping)
          })
        };
      }
      
      // Mapear métricas a los nombres correctos de la API
      const apiMetrics = metrics?.map(metric => {
        const mapped = metricMapping[metric] || metric;
        console.log(`🔍 Mapeando métrica: ${metric} -> ${mapped}`);
        return mapped;
      }) || [];
      
      console.log(`🔍 Métricas mapeadas para API:`, apiMetrics);
      
      // Validar que tenemos métricas válidas
      if (apiMetrics.length === 0) {
        console.log('❌ DEBUG: No se proporcionaron métricas válidas');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Métricas requeridas',
            details: 'Debe proporcionar al menos una métrica válida',
            availableMetrics: Object.keys(metricMapping)
          })
        };
      }
      
      // Construir la solicitud para la API de Google Analytics Data
      const requestBody = {
        metrics: apiMetrics.map(metric => ({ name: metric })),
        dimensions: apiDimensions.map(dimension => ({ name: dimension })),
        dateRanges: [{
          startDate: dateRange?.startDate || '30daysAgo',
          endDate: dateRange?.endDate || 'today'
        }]
      };

      console.log(`🔍 Enviando solicitud a Google Analytics API:`, JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        `${GOOGLE_ANALYTICS_API_BASE}/v1beta/properties/${propertyId}:runReport`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Datos de analytics obtenidos exitosamente');
      console.log(`🔍 Estructura de respuesta:`, {
        hasRows: !!response.data.rows,
        rowsCount: response.data.rows?.length || 0,
        hasTotals: !!response.data.totals,
        totalsCount: response.data.totals?.length || 0,
        hasMaximums: !!response.data.maximums,
        hasMinimums: !!response.data.minimums,
        hasRowCount: !!response.data.rowCount,
        metadata: response.data.metadata
      });
      
      // Si hay datos, mostrar una muestra
      if (response.data.rows && response.data.rows.length > 0) {
        console.log(`🔍 Muestra de datos (primeras 3 filas):`, response.data.rows.slice(0, 3));
      }
      
      if (response.data.totals && response.data.totals.length > 0) {
        console.log(`🔍 Datos de totales:`, response.data.totals);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    // Endpoint no encontrado
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Endpoint no encontrado',
        path: event.path
      })
    };

  } catch (error) {
    console.error('❌ Error en el proxy de Netlify:');
    console.error('❌ Tipo de error:', error.constructor.name);
    console.error('❌ Mensaje:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Response data:', error.response?.data);
    console.error('❌ Response status:', error.response?.status);
    console.error('❌ Request path:', event.path);
    console.error('❌ Request method:', event.httpMethod);
    
    // Determinar código de estado apropiado
    let status = 500;
    let message = 'Error interno del servidor';
    let details = {};
    
    if (error.response) {
      // Error de la API de Google
      status = error.response.status;
      message = error.response.data?.error?.message || error.response.data?.message || error.message;
      details = {
        googleApiError: error.response.data,
        status: status
      };
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      // Error de red
      status = 503;
      message = 'Servicio no disponible temporalmente';
      details = {
        networkError: error.code,
        message: 'No se puede conectar con Google Analytics API'
      };
    } else if (error.message.includes('Token de autorización')) {
      // Error de autenticación
      status = 401;
      message = 'Token de autorización inválido';
      details = {
        authError: true,
        message: 'Verifica que el token de acceso sea válido'
      };
    } else {
      // Error genérico
      message = error.message || 'Error desconocido';
      details = {
        errorType: error.constructor.name,
        originalError: error.message
      };
    }
    
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({
        error: message,
        details: details,
        timestamp: new Date().toISOString(),
        path: event.path,
        method: event.httpMethod
      })
    };
  }
};