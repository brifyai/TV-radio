-- ============================================
-- SCRIPT DE RESETEO COMPLETO DE BASE DE DATOS
-- TV Radio Analytics - iMetrics
-- ============================================
-- ADVERTENCIA: Este script eliminará TODAS las tablas y datos
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. ELIMINAR TODAS LAS TABLAS EXISTENTES
-- ============================================

DROP TABLE IF EXISTS analytics_cache CASCADE;
DROP TABLE IF EXISTS ga4_properties CASCADE;
DROP TABLE IF EXISTS ga4_accounts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREAR EXTENSIONES NECESARIAS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREAR TABLA DE USUARIOS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  department TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Tokens de Google OAuth
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMPTZ,
  
  -- Campos de auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 4. CREAR TABLA DE CONFIGURACIÓN DE USUARIOS
-- ============================================

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Configuraciones generales
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'es',
  timezone TEXT DEFAULT 'America/Santiago',
  
  -- Configuraciones de notificaciones
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  
  -- Configuraciones de análisis
  default_date_range TEXT DEFAULT 'last_7_days',
  default_comparison TEXT DEFAULT 'previous_period',
  
  -- Avatar personalizado
  avatar_url TEXT,
  
  -- Configuraciones personalizadas
  custom_settings JSONB DEFAULT '{}',
  
  -- Campos de auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_settings_user_id_unique UNIQUE(user_id)
);

-- Índices para user_settings
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- 5. CREAR TABLA DE CUENTAS DE GOOGLE ANALYTICS
-- ============================================

CREATE TABLE ga4_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Datos de la cuenta de GA4
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  display_name TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Campos de auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT ga4_accounts_user_account_unique UNIQUE(user_id, account_id)
);

-- Índices para ga4_accounts
CREATE INDEX idx_ga4_accounts_user_id ON ga4_accounts(user_id);
CREATE INDEX idx_ga4_accounts_account_id ON ga4_accounts(account_id);

-- 6. CREAR TABLA DE PROPIEDADES DE GOOGLE ANALYTICS
-- ============================================

CREATE TABLE ga4_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  
  -- Datos de la propiedad de GA4
  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  display_name TEXT,
  
  -- Configuración
  timezone TEXT,
  currency_code TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Campos de auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT ga4_properties_user_property_unique UNIQUE(user_id, property_id)
);

-- Índices para ga4_properties
CREATE INDEX idx_ga4_properties_user_id ON ga4_properties(user_id);
CREATE INDEX idx_ga4_properties_property_id ON ga4_properties(property_id);
CREATE INDEX idx_ga4_properties_account_id ON ga4_properties(account_id);

-- 7. CREAR TABLA DE CACHÉ DE ANALYTICS
-- ============================================

CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Datos del caché
  cache_key TEXT NOT NULL,
  cached_data JSONB NOT NULL,
  
  -- Control de expiración
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Campos de auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT analytics_cache_user_key_unique UNIQUE(user_id, cache_key)
);

-- Índices para analytics_cache
CREATE INDEX idx_analytics_cache_user_id ON analytics_cache(user_id);
CREATE INDEX idx_analytics_cache_expires_at ON analytics_cache(expires_at);
CREATE INDEX idx_analytics_cache_cache_key ON analytics_cache(cache_key);

-- 8. CREAR FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CREAR TRIGGERS PARA updated_at
-- ============================================

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ga4_accounts_updated_at
  BEFORE UPDATE ON ga4_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ga4_properties_updated_at
  BEFORE UPDATE ON ga4_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_cache_updated_at
  BEFORE UPDATE ON analytics_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para ga4_accounts
CREATE POLICY "Users can view their own GA4 accounts"
  ON ga4_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GA4 accounts"
  ON ga4_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GA4 accounts"
  ON ga4_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GA4 accounts"
  ON ga4_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para ga4_properties
CREATE POLICY "Users can view their own GA4 properties"
  ON ga4_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GA4 properties"
  ON ga4_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GA4 properties"
  ON ga4_properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GA4 properties"
  ON ga4_properties FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para analytics_cache
CREATE POLICY "Users can view their own cache"
  ON analytics_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cache"
  ON analytics_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cache"
  ON analytics_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cache"
  ON analytics_cache FOR DELETE
  USING (auth.uid() = user_id);

-- 11. CREAR FUNCIÓN PARA LIMPIAR CACHÉ EXPIRADO
-- ============================================

CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. CREAR BUCKET DE STORAGE PARA AVATARES
-- ============================================
-- NOTA: Esto debe ejecutarse manualmente en Supabase Dashboard
-- Storage → Create bucket → Name: "avatars" → Public: true

-- ============================================
-- SCRIPT COMPLETADO
-- ============================================
-- Ahora puedes crear usuarios usando Supabase Auth
-- Los datos del perfil se sincronizarán automáticamente
-- ============================================
