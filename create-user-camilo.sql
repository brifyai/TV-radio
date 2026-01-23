-- ============================================
-- CREAR USUARIO: Camilo Alegria
-- ============================================
-- IMPORTANTE: Este script debe ejecutarse DESPUÉS de crear
-- el usuario en Supabase Auth Dashboard
-- ============================================

-- PASO 1: Crear usuario en Supabase Auth Dashboard
-- --------------------------------------------------
-- 1. Ve a Authentication → Users en Supabase Dashboard
-- 2. Haz clic en "Add user" → "Create new user"
-- 3. Ingresa:
--    - Email: camiloalegriabarra@gmail.com
--    - Password: Antonito26$
--    - Auto Confirm User: ✓ (marcado)
-- 4. Haz clic en "Create user"
-- 5. Copia el UUID del usuario creado

-- PASO 2: Insertar perfil del usuario en la tabla users
-- --------------------------------------------------
-- Reemplaza 'USER_UUID_AQUI' con el UUID real del usuario creado

INSERT INTO users (
  id,
  email,
  full_name,
  role,
  is_active,
  preferences,
  metadata
) VALUES (
  'USER_UUID_AQUI'::uuid,  -- Reemplazar con el UUID real
  'camiloalegriabarra@gmail.com',
  'Camilo Alegria',
  'admin',  -- Cambiar a 'user' si no debe ser admin
  true,
  '{"theme": "light", "language": "es"}'::jsonb,
  '{"created_by": "manual_setup"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- PASO 3: Crear configuración inicial del usuario
-- --------------------------------------------------

INSERT INTO user_settings (
  user_id,
  theme,
  language,
  timezone,
  email_notifications,
  default_date_range,
  custom_settings
) VALUES (
  'USER_UUID_AQUI'::uuid,  -- Reemplazar con el UUID real
  'light',
  'es',
  'America/Santiago',
  true,
  'last_7_days',
  '{}'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
  updated_at = NOW();

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que el usuario fue creado correctamente
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM users
WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar configuración del usuario
SELECT 
  us.id,
  us.user_id,
  us.theme,
  us.language,
  u.email,
  u.full_name
FROM user_settings us
JOIN users u ON u.id = us.user_id
WHERE u.email = 'camiloalegriabarra@gmail.com';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. El usuario debe ser creado primero en Supabase Auth
-- 2. Luego ejecutar este script con el UUID correcto
-- 3. El usuario podrá iniciar sesión con:
--    Email: camiloalegriabarra@gmail.com
--    Password: Antonito26$
-- ============================================
