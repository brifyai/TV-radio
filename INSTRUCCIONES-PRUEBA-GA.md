# Instrucciones para Probar Autenticación de Google Analytics

## 🚀 Preparación

La aplicación ya está configurada y corriendo en `http://localhost:3000`

## 📋 Pasos para Probar

### 1. Abrir la Aplicación
1. Navega a `http://localhost:3000`
2. Abre la consola de desarrollador (F12)
3. Deberías ver el mensaje: `🔧 debugAnalytics disponible en window.debugAnalytics`

### 2. Verificar Configuración
En la consola, ejecuta:
```javascript
window.debugAnalytics.checkConfiguration()
```

Deberías ver algo como:
```
🔍 Configuración actual:
  - Client ID: 575745299328-scsmugneks2vg3kkoap6gd2ssashvefs...
  - Client Secret: configured
  - Scopes: email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users.readonly
  - Origin: http://localhost:3000
```

### 3. Iniciar Sesión en la Aplicación
1. Haz clic en "Iniciar Sesión"
2. Usa tus credenciales de Supabase
3. Serás redirigido al dashboard

### 4. Probar Conexión de Google Analytics
En el dashboard:
1. Busca el botón "Conectar Google Analytics"
2. Haz clic en él
3. Se abrirá una nueva ventana de Google OAuth

### 5. Completar Autenticación de Google
1. Inicia sesión con tu cuenta de Google
2. Acepta los permisos solicitados (debe incluir Analytics)
3. Serás redirigido al callback

### 6. Verificar Resultados en la Consola

#### Durante el Callback deberías ver:
```
🔍 DEBUG Callback:
  - URL completa: http://localhost:3000/callback?code=...&analytics=true
  - Search: ?code=...&analytics=true
  - Hash: 
  - code: 4/0AX4XfWh...
  - error: none
  - analytics: true
  - state: none
  - todos los parámetros: {code: "...", analytics: "true"}
```

#### Durante el intercambio de tokens:
```
📊 Procesando conexión de Google Analytics...
🔑 Intercambiando código por tokens de Google Analytics...
  - client_id: 575745299328-scsmugneks2vg3kkoap6gd2ssashvefs.apps.googleusercontent.com
  - redirect_uri: http://localhost:3000/callback?analytics=true
  - code: present
✅ Tokens obtenidos exitosamente: {
  hasAccessToken: true,
  hasRefreshToken: true,
  expiresIn: 3599,
  tokenType: "Bearer"
}
✅ Google Analytics conectado exitosamente con tokens directos
```

### 7. Verificar Tokens en la Base de Datos

Conéctate a Supabase y ejecuta:
```sql
SELECT 
  id, 
  email,
  google_access_token IS NOT NULL as has_access_token,
  google_refresh_token IS NOT NULL as has_refresh_token,
  google_token_expires_at,
  updated_at
FROM users 
WHERE email = 'tu-email@example.com';
```

### 8. Probar Funciones de Depuración (Opcional)

#### Generar URL de autorización manualmente:
```javascript
window.debugAnalytics.generateAuthUrl()
```

#### Extraer código de URL actual:
```javascript
window.debugAnalytics.extractCodeFromUrl()
```

#### Probar obtención de propiedades (después de tener tokens):
```javascript
// Primero obtén el access token de la base de datos o contexto
// Luego ejecuta:
window.debugAnalytics.testGetProperties('tu-access-token-aqui')
```

## 🔧 Solución de Problemas

### Error: "No se encontró código de autorización"
- **Verificación**: Asegúrate que la URL del callback contenga `?code=...`
- **Solución**: Revisa la configuración de redirect URI en Google Cloud Console

### Error: "invalid_client"
- **Verificación**: `window.debugAnalytics.checkConfiguration()`
- **Solución**: Verifica Client ID y Client Secret en `.env`

### Error: "redirect_uri_mismatch"
- **Causa**: El redirect URI no está configurado en Google Cloud Console
- **Solución**: Agrega `http://localhost:3000/callback` a URIs autorizados

### Error: "access_denied"
- **Causa**: Usuario denegó los permisos
- **Solución**: Vuelve a intentar y acepta los permisos

### No aparece el botón "Conectar Google Analytics"
- **Verificación**: Asegúrate de haber iniciado sesión
- **Solución**: Refresca la página y vuelve a iniciar sesión

## 📊 Logs Esperados Exitosos

### Callback Completo:
```
🔍 DEBUG Callback:
  - URL completa: http://localhost:3000/callback?code=4/0AX4XfWh...&analytics=true
  - Search: ?code=4/0AX4XfWh...&analytics=true
  - Hash: 
  - code: 4/0AX4XfWh...
  - error: none
  - analytics: true
  - state: none
  - todos los parámetros: {code: "4/0AX4XfWh...", analytics: "true"}
✅ Sesión establecida exitosamente: user@example.com
📊 Procesando conexión de Google Analytics...
🔑 Intercambiando código por tokens de Google Analytics...
✅ Tokens obtenidos exitosamente: {hasAccessToken: true, hasRefreshToken: true, expiresIn: 3599, tokenType: "Bearer"}
✅ Google Analytics conectado exitosamente con tokens directos
```

## 🎯 Resultado Esperado

Si todo funciona correctamente:
1. ✅ Verás los tokens guardados en la base de datos
2. ✅ El dashboard mostrará "Google Analytics Conectado"
3. ✅ Podrás obtener datos de Analytics usando los tokens
4. ✅ La conexión persistirá gracias al refresh token

## 📝 Notas Finales

- Los tokens expiran en 1 hora (3599 segundos)
- El refresh token permite obtener nuevos tokens automáticamente
- Los scopes incluyen permisos de lectura para Analytics
- La configuración está lista para producción (solo cambiar URLs)