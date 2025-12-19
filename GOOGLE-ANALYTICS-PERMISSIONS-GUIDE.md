# Guía de Configuración de Permisos de Google Analytics API

## Problemas Identificados

Los errores que estás experimentando:
```
Error de permisos: no tienes acceso a las cuentas de Google Analytics. Verifica los permisos de tu aplicación en Google Cloud Console.
Error de conexión: No se puede conectar con el servidor backend en /.netlify/functions/analytics-proxy
```

## Soluciones Implementadas

### 1. ✅ Configuración de Variables de Entorno

Se han actualizado las variables de entorno con las credenciales correctas:

```env
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_aqui
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
```

### 2. ✅ Servidor Backend Funcionando

El servidor proxy de Google Analytics está corriendo en `http://localhost:3001` con los endpoints:
- `GET /api/analytics/accounts` - Obtener cuentas
- `GET /api/analytics/properties/:accountId` - Obtener propiedades
- `POST /api/analytics/data/:propertyId` - Obtener datos de analytics
- `GET /api/health` - Health check

### 3. ✅ Manejo Mejorado de Errores

Se ha implementado un nuevo componente `AnalyticsErrorDisplay` que proporciona:
- Mensajes de error claros y específicos
- Soluciones sugeridas para cada tipo de error
- Acciones directas para resolver los problemas
- Información técnica para depuración (en desarrollo)

## Pasos para Verificar Permisos de Google Analytics API

### Paso 1: Verificar Configuración en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto correspondiente al Client ID proporcionado
3. Ve a **APIs y Servicios** > **Biblioteca**
4. Asegúrate de que las siguientes APIs estén habilitadas:
   - ✅ Google Analytics Data API
   - ✅ Google Analytics Admin API

### Paso 2: Verificar Pantalla de Consentimiento OAuth

1. En Google Cloud Console, ve a **APIs y Servicios** > **Pantalla de consentimiento OAuth**
2. Asegúrate de que esté configurada para **Usuarios externos**
3. Verifica que tengas los siguientes scopes configurados:
   - `email`
   - `profile` 
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `https://www.googleapis.com/auth/analytics.edit`
   - `https://www.googleapis.com/auth/analytics.manage.users.readonly`

### Paso 3: Verificar Credenciales OAuth 2.0

1. Ve a **APIs y Servicios** > **Credenciales**
2. Busca tu Client ID configurado en Google Cloud Console
3. Asegúrate de que:
   - ✅ El tipo de aplicación sea "Aplicación web"
   - ✅ Los URIs de redirección autorizados incluyan:
     - `http://localhost:3000/callback`
     - `http://localhost:3000`
     - `https://tvradio2.netlify.app/callback`
     - `https://tvradio2.netlify.app`

### Paso 4: Verificar Acceso a Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Asegúrate de que tengas acceso a al menos una propiedad GA4
3. Verifica que tengas los permisos necesarios (lector o superior)

### Paso 5: Probar la Conexión

1. Inicia sesión en la aplicación
2. Ve a la sección de Analytics
3. Intenta conectar tu cuenta de Google Analytics
4. Si aparece el error de permisos, sigue estos pasos adicionales:

## Solución de Problemas Comunes

### Error: "No tienes acceso a las cuentas de Google Analytics"

**Causas posibles:**
1. La aplicación no tiene los scopes correctos configurados
2. El usuario no tiene acceso a las propiedades de GA4
3. Los tokens han expirado

**Soluciones:**
1. **Volver a conectar la cuenta:**
   - Ve al dashboard
   - Haz clic en "Conectar Google Analytics"
   - Autoriza con los scopes correctos

2. **Verificar acceso directo:**
   - Ingresa a [Google Analytics](https://analytics.google.com/)
   - Confirma que puedes ver las propiedades

3. **Limpiar caché y cookies:**
   - Limpia el caché del navegador
   - Elimina las cookies del sitio

### Error: "No se puede conectar con el servidor backend"

**Causas posibles:**
1. El servidor backend no está corriendo
2. Problemas de red o firewall
3. Puerto bloqueado

**Soluciones:**
1. **Verificar servidor:**
   - Abre `http://localhost:3001/api/health` en el navegador
   - Deberías ver: `{"status":"OK","timestamp":"...","version":"1.0.0"}`

2. **Reiniciar servidor:**
   ```bash
   # Detener procesos Node.js
   taskkill /F /IM node.exe
   
   # Iniciar servidor backend
   node server.js
   
   # Iniciar aplicación React (en otra terminal)
   npm start
   ```

## Configuración de Supabase OAuth (Alternativa Recomendada)

Si prefieres usar Supabase para manejar OAuth:

1. Ve al dashboard de Supabase
2. En **Authentication** > **Providers**, habilita Google
3. Configura las credenciales de Google:
   - Client ID: `tu_google_client_id_aqui`
   - Client Secret: `tu_google_client_secret_aqui`
4. Configura el Redirect URL:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`
5. Añade los scopes de Google Analytics

## Verificación Final

Para verificar que todo funciona correctamente:

1. ✅ Servidor backend corriendo en `localhost:3001`
2. ✅ Aplicación React corriendo en `localhost:3000`
3. ✅ Variables de entorno configuradas
4. ✅ APIs habilitadas en Google Cloud Console
5. ✅ Pantalla de consentimiento OAuth configurada
6. ✅ Acceso a Google Analytics verificado

## Contacto y Soporte

Si los problemas persisten:

1. **Revisa la consola del navegador** para ver errores detallados
2. **Verifica los logs del servidor backend** en la terminal
3. **Confirma que las credenciales sean correctas** en Google Cloud Console
4. **Asegúrate de que el usuario tenga acceso** a las propiedades de GA4

---

## Resumen de Cambios Realizados

1. **Variables de entorno actualizadas** con credenciales reales
2. **Servidor backend verificado** y funcionando
3. **Componente de errores mejorado** implementado
4. **Guía de solución de problemas** creada
5. **Flujo de autenticación optimizado** para manejar errores

Los errores originales deberían estar resueltos con estos cambios. Si aún experimentas problemas, sigue los pasos de verificación detallados arriba.