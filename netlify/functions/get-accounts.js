const { google } = require('googleapis');

exports.handler = async (event, context) => {
  try {
    // Solo permitir métodos GET
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    // Obtener el token de acceso del header
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token de autorización no proporcionado o inválido' })
      };
    }

    const accessToken = authHeader.substring(7);
    
    // Configurar el cliente de autenticación
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Obtener las cuentas de Google Analytics
    const response = await google.analyticsadmin('v1beta').accounts.list({
      auth
    });

    // Devolver las cuentas
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(response.data.accounts || [])
    };

  } catch (error) {
    console.error('Error en get-accounts:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Error interno del servidor'
      })
    };
  }
};