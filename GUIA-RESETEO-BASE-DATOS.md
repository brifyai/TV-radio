# 🔄 Guía Completa: Reseteo de Base de Datos y Creación de Usuario

## ⚠️ ADVERTENCIA IMPORTANTE

Este proceso **eliminará TODOS los datos** de tu base de datos. Asegúrate de:
- Hacer un backup si tienes datos importantes
- Estar seguro de que quieres eliminar todo
- Tener acceso al Dashboard de Supabase

---

## 📋 Paso 1: Resetear la Base de Datos

### 1.1 Acceder a Supabase SQL Editor

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **New query**

### 1.2 Ejecutar Script de Reseteo

1. Abre el archivo `database-reset-complete.sql`
2. Copia **TODO** el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. Espera a que termine (puede tomar 10-30 segundos)

### 1.3 Verificar que se crearon las tablas

Ejecuta este query para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver estas tablas:
- ✅ `analytics_cache`
- ✅ `ga4_accounts`
- ✅ `ga4_properties`
- ✅ `user_settings`
- ✅ `users`

---

## 👤 Paso 2: Crear el Bucket de Storage para Avatares

### 2.1 Crear Bucket

1. En Supabase Dashboard, ve a **Storage**
2. Haz clic en **Create bucket**
3. Configura:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Marcado
   - **File size limit**: 2 MB (opcional)
   - **Allowed MIME types**: `image/*` (opcional)
4. Haz clic en **Create bucket**

### 2.2 Configurar Políticas del Bucket

1. Selecciona el bucket `avatars`
2. Ve a **Policies**
3. Haz clic en **New policy**
4. Crea estas políticas:

**Política 1: Permitir lectura pública**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );
```

**Política 2: Permitir subida autenticada**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
```

**Política 3: Permitir actualización propia**
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 👤 Paso 3: Crear Usuario Camilo Alegria

### 3.1 Crear Usuario en Supabase Auth

1. En Supabase Dashboard, ve a **Authentication** → **Users**
2. Haz clic en **Add user** → **Create new user**
3. Completa el formulario:
   - **Email**: `camiloalegriabarra@gmail.com`
   - **Password**: `Antonito26$`
   - **Auto Confirm User**: ✅ Marcado (importante)
4. Haz clic en **Create user**
5. **IMPORTANTE**: Copia el **UUID** del usuario creado (lo necesitarás en el siguiente paso)

### 3.2 Crear Perfil del Usuario

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `create-user-camilo.sql`
3. **IMPORTANTE**: Reemplaza `'USER_UUID_AQUI'` con el UUID real que copiaste
   - Busca todas las apariciones (hay 2)
   - Ejemplo: `'550e8400-e29b-41d4-a716-446655440000'::uuid`
4. Ejecuta el script completo
5. Verifica que se creó correctamente ejecutando las queries de verificación al final del script

---

## ✅ Paso 4: Verificación Final

### 4.1 Verificar Usuario

Ejecuta este query:

```sql
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  u.created_at,
  us.theme,
  us.language
FROM users u
LEFT JOIN user_settings us ON us.user_id = u.id
WHERE u.email = 'camiloalegriabarra@gmail.com';
```

Deberías ver:
- ✅ Email: camiloalegriabarra@gmail.com
- ✅ Full name: Camilo Alegria
- ✅ Role: admin
- ✅ Is active: true
- ✅ Theme: light
- ✅ Language: es

### 4.2 Probar Inicio de Sesión

1. Ve a tu aplicación: `http://localhost:3000` o `https://imetrics.cl`
2. Haz clic en **Iniciar Sesión**
3. Ingresa:
   - **Email**: `camiloalegriabarra@gmail.com`
   - **Password**: `Antonito26$`
4. Deberías poder iniciar sesión correctamente

---

## 🔧 Solución de Problemas

### Error: "User not found"
- Verifica que el usuario fue creado en **Authentication** → **Users**
- Verifica que marcaste **Auto Confirm User**

### Error: "Invalid UUID"
- Asegúrate de copiar el UUID completo del usuario
- El formato debe ser: `'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid`

### Error: "Row Level Security"
- Verifica que ejecutaste el script completo `database-reset-complete.sql`
- Las políticas RLS deben estar habilitadas

### No puedo subir avatar
- Verifica que creaste el bucket `avatars`
- Verifica que el bucket es público
- Verifica que creaste las políticas de storage

---

## 📊 Estructura Final de la Base de Datos

```
┌─────────────────────────────────────────┐
│           SUPABASE AUTH                 │
│  (Gestión de autenticación)             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│              users                      │
│  - id (UUID) ← auth.uid()               │
│  - email                                │
│  - full_name                            │
│  - google_access_token                  │
│  - google_refresh_token                 │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┬─────────────┐
        ▼                   ▼             ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│user_settings │  │ga4_accounts  │  │ga4_properties│
│              │  │              │  │              │
│- user_id     │  │- user_id     │  │- user_id     │
│- theme       │  │- account_id  │  │- property_id │
│- language    │  │- account_name│  │- property_name│
└──────────────┘  └──────────────┘  └──────────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │analytics_cache   │
                                  │                  │
                                  │- user_id         │
                                  │- cached_data     │
                                  │- expires_at      │
                                  └──────────────────┘
```

---

## 🎉 ¡Listo!

Tu base de datos está completamente reseteada y el usuario Camilo Alegria está creado.

Ahora puedes:
- ✅ Iniciar sesión con el usuario creado
- ✅ Conectar Google Analytics
- ✅ Analizar spots de TV
- ✅ Usar todas las funcionalidades de la aplicación

---

## 📝 Notas Adicionales

### Crear más usuarios

Para crear más usuarios, repite el **Paso 3** con diferentes datos.

### Cambiar rol de usuario

Para cambiar el rol de un usuario (admin/user):

```sql
UPDATE users 
SET role = 'admin'  -- o 'user'
WHERE email = 'email@ejemplo.com';
```

### Eliminar usuario

Para eliminar un usuario completamente:

1. Elimina en **Authentication** → **Users**
2. Los datos en las tablas se eliminarán automáticamente (CASCADE)

---

**¿Necesitas ayuda?** Revisa los logs de Supabase o contacta al equipo de desarrollo.
