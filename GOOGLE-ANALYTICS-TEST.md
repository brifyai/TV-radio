# Prueba de Autenticación de Google Analytics

## Configuración Actual

### Variables de Entorno
- `REACT_APP_GOOGLE_CLIENT_ID`: [TU_GOOGLE_CLIENT_ID]
- `REACT_APP_GOOGLE_CLIENT_SECRET`: [TU_GOOGLE_CLIENT_SECRET]
- `REACT_APP_GOOGLE_SCOPES`: email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users.readonly

### Flujo de Autenticación Implementado

1. **Inicio desde Login.js**: El usuario hace clic en "Conectar Google Analytics"
2. **Redirección a Google**: Se abre ventana de OAuth con los scopes correctos
3. **Callback**: La aplicación recibe el código de autorización en `/callback?analytics=true`
4. **Intercambio de Tokens**: Se usa el servicio `googleAnalyticsService.exchangeCodeForTokens()`
5. **Almacenamiento**: Los tokens se guardan en la tabla `users` de Supabase

## Pasos para Probar

### 1. Iniciar Sesión
```
1. Abrir http://localhost:3000
2. Iniciar sesión con credenciales de Supabase
3. Navegar al dashboard
```

### 2. Conectar Google Analytics
```
1. Hacer clic en "Conectar Google Analytics" en el dashboard
2. Se abrirá ventana de Google OAuth
3. Iniciar sesión con cuenta de Google que tenga acceso a Analytics
4. Aceptar los permisos solicitados
5. Redirigir al callback
```

### 3. Verificar Resultados

#### En la Consola del Navegador
Buscar los siguientes logs:
- `🔍 DEBUG Callback:` - Información general del callback
- `📊 Procesando conexión de Google Analytics...` - Inicio del proceso
- `🔑 Tokens obtenidos:` - Confirmación de tokens recibidos
- `✅ Google Analytics conectado exitosamente` - Éxito completo

#### En la Base de Datos (Supabase)
Verificar que el usuario tenga:
- `google_access_token`: Token de acceso
- `google_refresh_token`: Token de refresco
- `google_token_expires_at`: Fecha de expiración

## Problemas Comunes y Soluciones

### Error: "No se encontró código de autorización"
- **Causa**: La redirección no incluye el parámetro `code`
- **Solución**: Verificar que la URL de redirect en Google Console coincida con `http://localhost:3000/callback`

### Error: "invalid_client"
- **Causa**: Client ID o Client Secret incorrectos
- **Solución**: Verificar las credenciales en Google Cloud Console

### Error: "redirect_uri_mismatch"
- **Causa**: URI de redirección no configurada en Google Console
- **Solución**: Agregar `http://localhost:3000/callback` a los URIs autorizados

### Error: "access_denied"
- **Causa**: Usuario denegó los permisos
- **Solución**: El usuario debe aceptar los permisos solicitados

## Logs Esperados

### Callback Exitoso
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

### Intercambio de Tokens Exitoso
```
🔑 Intercambiando código por tokens de Google Analytics...
  - client_id: [TU_GOOGLE_CLIENT_ID]
  - redirect_uri: http://localhost:3000/callback?analytics=true
  - code: present
✅ Tokens obtenidos exitosamente: {
  hasAccessToken: true,
  hasRefreshToken: true,
  expiresIn: 3599,
  tokenType: "Bearer"
}
```

## Próximos Pasos

1. **Probar el flujo completo** con una cuenta de Google real
2. **Verificar los tokens** en la base de datos
3. **Probar la obtención de datos** de Analytics usando los tokens
4. **Implementar refresh token** para mantener la conexión activa

## Notas Importantes

- Los scopes de OAuth incluyen permisos de lectura para Analytics
- El redirect URI debe estar configurado en Google Cloud Console
- Los tokens tienen una validez de 1 hora (3599 segundos)
- El refresh token permite obtener nuevos tokens sin intervención del usuario