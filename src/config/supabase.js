import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create a mock client that returns empty responses
const mockSupabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
    signUp: () => Promise.reject(new Error('Supabase not configured')),
    signInWithOAuth: () => Promise.reject(new Error('Supabase not configured')),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.reject(new Error('Supabase not configured')),
    updateUser: () => Promise.reject(new Error('Supabase not configured'))
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        gt: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        })
      }),
      gt: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null })
      }),
      maybeSingle: () => Promise.resolve({ data: null, error: null })
    }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
  }),
  rpc: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
};

// Check if Supabase credentials are properly configured
const useMockClient = !supabaseUrl || !supabaseAnonKey ||
  supabaseAnonKey.includes('example-key') ||
  supabaseUrl.includes('your-project');

if (useMockClient) {
  console.warn('⚠️ Supabase credentials not properly configured. Using mock client.');
}

export const supabase = useMockClient ? mockSupabase : createClient(supabaseUrl, supabaseAnonKey);

// Database schema for multi-user GA4 integration
export const databaseSchema = {
  // Users table (extends Supabase auth.users)
  users: `
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID REFERENCES auth.users(id) PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      google_access_token TEXT,
      google_refresh_token TEXT,
      google_token_expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  // Google Analytics accounts table
  ga4_accounts: `
    CREATE TABLE IF NOT EXISTS public.ga4_accounts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL,
      account_name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, account_id)
    );
  `,

  // Google Analytics properties table
  ga4_properties: `
    CREATE TABLE IF NOT EXISTS public.ga4_properties (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      property_name TEXT NOT NULL,
      property_type TEXT DEFAULT 'WEB',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, property_id)
    );
  `,

  // Analytics data cache table
  analytics_cache: `
    CREATE TABLE IF NOT EXISTS public.analytics_cache (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      property_id TEXT NOT NULL,
      date_range_start DATE NOT NULL,
      date_range_end DATE NOT NULL,
      metrics JSONB NOT NULL,
      dimensions JSONB NOT NULL,
      cached_data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
      UNIQUE(user_id, property_id, date_range_start, date_range_end, metrics, dimensions)
    );
  `,

  // User settings table
  user_settings: `
    CREATE TABLE IF NOT EXISTS public.user_settings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      
      -- Configuraciones de perfil
      full_name TEXT,
      phone TEXT,
      company TEXT,
      bio TEXT,
      avatar_url TEXT,
      
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
  `,

  // Row Level Security (RLS) policies
  rls_policies: `
    -- Enable RLS on all tables
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.ga4_accounts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.ga4_properties ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

    -- Users can only access their own data
    CREATE POLICY "Users can view own profile" ON public.users
      FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile" ON public.users
      FOR UPDATE USING (auth.uid() = id);

    -- GA4 accounts policies
    CREATE POLICY "Users can view own GA4 accounts" ON public.ga4_accounts
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own GA4 accounts" ON public.ga4_accounts
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own GA4 accounts" ON public.ga4_accounts
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own GA4 accounts" ON public.ga4_accounts
      FOR DELETE USING (auth.uid() = user_id);

    -- GA4 properties policies
    CREATE POLICY "Users can view own GA4 properties" ON public.ga4_properties
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own GA4 properties" ON public.ga4_properties
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own GA4 properties" ON public.ga4_properties
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own GA4 properties" ON public.ga4_properties
      FOR DELETE USING (auth.uid() = user_id);

    -- Analytics cache policies
    CREATE POLICY "Users can view own cached analytics" ON public.analytics_cache
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own cached analytics" ON public.analytics_cache
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own cached analytics" ON public.analytics_cache
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own cached analytics" ON public.analytics_cache
      FOR DELETE USING (auth.uid() = user_id);

    -- User settings policies
    ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own settings" ON public.user_settings
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own settings" ON public.user_settings
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own settings" ON public.user_settings
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own settings" ON public.user_settings
      FOR DELETE USING (auth.uid() = user_id);
  `,

  // Functions for automatic user creation
  create_user_profile: `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      -- CRITICAL: Only create user profile for primary authentication (not Analytics OAuth)
      -- Check if this is an Analytics OAuth by looking at the provider or metadata
      IF (new.raw_app_meta_data->>'provider' = 'google' AND
          new.raw_user_meta_data->>'analytics_oauth' = 'true') THEN
        -- Analytics OAuth - don't create profile, just return
        RAISE NOTICE 'Analytics OAuth detected, skipping profile creation for user: %', new.email;
        RETURN new;
      END IF;
      
      -- Primary authentication - create/update profile
      INSERT INTO public.users (id, email, full_name, avatar_url)
      VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
      
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Trigger to automatically create user profile
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `
};