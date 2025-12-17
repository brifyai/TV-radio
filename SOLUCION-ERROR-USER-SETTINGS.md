# Solución: Error de Tabla user_settings en Supabase

## Problema Identificado

Los errores que estás viendo son **reales** y indican que la tabla `user_settings` no existe en la base de datos de Supabase:

```
Error: {code: 'PGRST205', message: "Could not find the table 'public.user_settings' in the schema cache"}
```

## Causa del Error

El componente `Settings.js` intenta acceder a la tabla `user_settings` pero esta tabla no ha sido creada en la base de datos de Supabase.

## Solución Implementada

### 1. Archivos Creados/Modificados

- ✅ **`create-user-settings-table.sql`**: Script SQL para crear la tabla
- ✅ **`src/config/supabase.js`**: Actualizado con la definición de la tabla y políticas RLS
- ✅ **`src/components/Settings/Settings.js`**: Corregido error de importación `useCallback`

### 2. Pasos para Aplicar la Solución

#### Opción A: Ejecutar en Supabase Dashboard

1. **Ir al Dashboard de Supabase**: https://supabase.com/dashboard
2. **Seleccionar tu proyecto**: `uwbxyaszdqwypbebogvw`
3. **Ir a SQL Editor**
4. **Ejecutar el contenido de** `create-user-settings-table.sql`

#### Opción B: Ejecutar Comandos SQL

Ejecuta estos comandos en el SQL Editor de Supabase:

```sql
-- Crear tabla user_settings para configuraciones de usuario
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Configuraciones de perfil
  full_name TEXT,
  phone TEXT,
  company TEXT,
  bio TEXT,
  
  -- Configuraciones de notificaciones
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT false,
  notifications_analytics BOOLEAN DEFAULT true,
  notifications_reports BOOLEAN DEFAULT true,
  notifications_maintenance BOOLEAN DEFAULT true,
  
  -- Configuraciones de apariencia
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'es',
  timezone TEXT DEFAULT 'America/Santiago',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  currency TEXT DEFAULT 'CLP',
  
  -- Configuraciones de privacidad
  profile_visibility TEXT DEFAULT 'private',
  analytics_sharing BOOLEAN DEFAULT false,
  data_retention TEXT DEFAULT '1year',
  two_factor_auth BOOLEAN DEFAULT false,
  
  -- Configuraciones de datos
  auto_backup BOOLEAN DEFAULT true,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint único por usuario
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_settings_updated_at();
```

## Estado Actual

- ✅ **Código corregido**: Los archivos JavaScript están listos
- ✅ **Esquema actualizado**: La definición de tabla está en `supabase.js`
- ✅ **Cambios en Git**: Commit `460ca21` enviado al repositorio
- ⏳ **Pendiente**: Ejecutar el SQL en la base de datos de Supabase

## Resultado Esperado

Una vez ejecutados los comandos SQL:

1. **Los errores desaparecerán** del console del navegador
2. **La página de Settings funcionará** correctamente
3. **Los usuarios podrán guardar** sus configuraciones
4. **No más errores 404** al acceder a `user_settings`

## Notas Importantes

- La tabla incluye **Row Level Security (RLS)** para proteger los datos de cada usuario
- Cada usuario solo puede acceder a sus propias configuraciones
- La tabla tiene **valores por defecto** para todas las configuraciones
- Se incluye **actualización automática** del campo `updated_at`

---

**Para aplicar esta solución, ejecuta el SQL en tu proyecto de Supabase.**