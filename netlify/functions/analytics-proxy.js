const axios = require('axios');

// Configuración de Google Analytics API
const GOOGLE_ANALYTICS_API_BASE = 'https://analyticsdata.googleapis.com';
const GOOGLE_ANALYTICS_ADMIN_API_BASE = 'https://analyticsadmin.googleapis.com';

// Middleware para verificar el token de autorización
const verifyAuthToken = (headers) => {
  const authHeader = headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización no proporcionado o inválido');
  }
  
  return authHeader.substring(7);
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
    const path = event.path.replace('/.netlify/functions/analytics-proxy', '');
    const accessToken = verifyAuthToken(event.headers);

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
      
      // Verificar que event.body existe y no está vacío
      if (!event.body) {
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
        requestData = JSON.parse(event.body);
      } catch (parseError) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'JSON inválido en el cuerpo de la solicitud',
            details: parseError.message
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
      const apiDimensions = dimensions?.map(dim => dimensionMapping[dim] || dim) || [];
      
      console.log(`🔍 Dimensiones mapeadas para API:`, apiDimensions);
      
      // Mapear métricas a los nombres correctos de la API
      const apiMetrics = metrics?.map(metric => metricMapping[metric] || metric) || [];
      
      console.log(`🔍 Métricas mapeadas para API:`, apiMetrics);
      
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
    console.error('❌ Error en el proxy de Netlify:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({ 
        error: message,
        details: error.response?.data
      })
    };
  }
};