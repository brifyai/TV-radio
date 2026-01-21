# Guía Completa: Configurar Google OAuth para Producción

## 🚨 Problema Actual
El callback de Google Analytics está llegando sin código de autorización:
```
URL: https://tvradio2.netlify.app/callback?analytics=true&t=1765803240870
❌ code: not found
```

## 🔧 Solución: Configurar Google Cloud Console

### Paso 1: Acceder a Google Cloud Console
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Iniciar sesión con la cuenta de Google que tiene acceso al proyecto
3. Seleccionar el proyecto correcto (debería contener las credenciales del Client ID)

### Paso 2: Navegar a Credenciales
1. En el menú izquierdo, ir a **APIs & Services** > **Credentials**
2. Buscar el **OAuth 2.0 Client ID** con ID: `[TU_GOOGLE_CLIENT_ID]`
3. Hacer clic en el nombre del cliente para editarlo

### Paso 3: Configurar URIs de Redirección Autorizados
En la sección **Authorized redirect URIs**, agregar:

#### Para Desarrollo (si es necesario):
```
http://localhost:3000/callback
```

#### Para Producción (¡IMPORTANTE!):
```
https://tvradio2.netlify.app/callback
```

**Pasos para agregar:**
1. Hacer clic en **+ ADD URI**
2. Ingresar `https://tvradio2.netlify.app/callback`
3. Hacer clic en **Save**

### Paso 4: Verificar Configuración
Después de guardar, deberías ver:
```
Authorized redirect URIs:
✅ http://localhost:3000/callback
✅ https://tvradio2.netlify.app/callback
```

### Paso 5: Configurar Variables de Entorno en Netlify
1. Ir al [dashboard de Netlify](https://app.netlify.com/)
2. Seleccionar el sitio `tvradio2`
3. Ir a **Site settings** > **Build & deploy** > **Environment**
4. Agregar estas variables:

```
REACT_APP_GOOGLE_CLIENT_ID=[TU_GOOGLE_CLIENT_ID]
REACT_APP_GOOGLE_CLIENT_SECRET=[TU_GOOGLE_CLIENT_SECRET]
REACT_APP_GOOGLE_SCOPES=email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users.readonly
```

### Paso 6: Redesplegar la Aplicación
1. Los cambios en variables de entorno se aplican automáticamente
2. Si hay cambios en el código, hacer push y Netlify redeployará automáticamente

## 🧪 Flujo de Prueba Después de la Configuración

### 1. Probar el Flujo Completo
1. Ir a `https://tvradio2.netlify.app`
2. Iniciar sesión con Supabase
3. Hacer clic en "Conectar Google Analytics"
4. Debería redirigir a Google OAuth

### 2. Verificar URL de Redirección
La URL de OAuth debería incluir:
```
redirect_uri=https://tvradio2.netlify.app/callback?analytics=true
```

### 3. Verificar Callback Exitoso
Después de autenticarse, el callback debería verse así:
```
✅ URL: https://tvradio2.netlify.app/callback?code=4/0AX4XfWh...&analytics=true
✅ code: 4/0AX4XfWh... (present)
✅ analytics: true
```

### 4. Verificar Logs Esperados
```
🔍 DEBUG Callback:
  - URL completa: https://tvradio2.netlify.app/callback?code=4/0AX4XfWh...&analytics=true
  - Search: ?code=4/0AX4XfWh...&analytics=true
  - code: 4/0AX4XfWh...
  - analytics: true
✅ Sesión establecida exitosamente: user@example.com
📊 Procesando conexión de Google Analytics...
🔑 Intercambiando código por tokens de Google Analytics...
✅ Tokens obtenidos exitosamente
✅ Google Analytics conectado exitosamente
```

## 🚨 Solución Temporal (Mientras se configura OAuth)

Si necesitas probar la funcionalidad mientras configuras OAuth, puedes simular tokens manualmente:

### 1. Obtener Tokens Manualmente
1. Ir a [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Usar estos scopes:
   ```
   email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users.readonly
   ```
3. Autorizar y obtener tokens

### 2. Inyectar Tokens en la Base de Datos
Ejecutar este SQL en Supabase:
```sql
UPDATE users 
SET 
  google_access_token = 'TU_ACCESS_TOKEN_AQUI',
  google_refresh_token = 'TU_REFRESH_TOKEN_AQUI',
  google_token_expires_at = NOW() + INTERVAL '1 hour',
  updated_at = NOW()
WHERE email = 'camilo@origencomunicaciones.cl';
```

## 🔍 Verificación de Configuración

### Verificar Client ID
El Client ID debe ser:
```
[TU_GOOGLE_CLIENT_ID]
```

### Verificar Scopes
Los scopes deben incluir:
```
email
profile
https://www.googleapis.com/auth/analytics.readonly
https://www.googleapis.com/auth/analytics.manage.users.readonly
```

### Verificar Dominio
Asegúrate de que el dominio `tvradio2.netlify.app` esté verificado en Google Cloud Console si es necesario.

## 📋 Checklist de Configuración

- [ ] Acceder a Google Cloud Console
- [ ] Seleccionar proyecto correcto
- [ ] Editar OAuth 2.0 Client ID
- [ ] Agregar `https://tvradio2.netlify.app/callback` a URIs autorizados
- [ ] Guardar cambios
- [ ] Configurar variables de entorno en Netlify
- [ ] Redesplegar aplicación
- [ ] Probar flujo completo
- [ ] Verificar callback con código de autorización

## 🆘 Troubleshooting

### Error: "redirect_uri_mismatch"
- **Causa:** El redirect URI no está configurado en Google Cloud Console
- **Solución:** Agregar exactamente `https://tvradio2.netlify.app/callback`

### Error: "invalid_client"
- **Causa:** Client ID incorrecto o no configurado
- **Solución:** Verificar que el Client ID sea el correcto

### Error: "access_denied"
- **Causa:** Usuario denegó permisos
- **Solución:** Volver a intentar y aceptar permisos

### Callback sin código
- **Causa:** Redirect URI no configurado correctamente
- **Solución:** Verificar configuración en Google Cloud Console

## 📞 Contacto de Soporte

Si tienes problemas con la configuración de Google Cloud Console:
1. Verifica que tienes acceso al proyecto correcto
2. Contacta al administrador del proyecto si no tienes permisos
3. Asegúrate de que el proyecto tenga habilitadas las APIs de Google Analytics

Una vez configurado correctamente, el flujo de OAuth debería funcionar sin problemas y la aplicación podrá obtener datos de Google Analytics directamente.