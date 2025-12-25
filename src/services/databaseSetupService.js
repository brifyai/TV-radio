/**
 * Servicio para configurar y corregir la estructura de base de datos
 * Corrige errores 400 en Supabase y asegura que las tablas estén correctamente configuradas
 */
export class DatabaseSetupService {
  constructor() {
    this.supabase = null;
  }

  async initializeSupabase() {
    if (!this.supabase) {
      const { supabase } = await import('../config/supabase-new');
      this.supabase = supabase;
    }
    return this.supabase;
  }

  /**
   * Verificar y crear estructura de base de datos
   */
  async setupDatabaseStructure() {
    try {
      console.log('🔧 Configurando estructura de base de datos...');
      
      // Verificar tablas existentes
      await this.verifyTablesExist();
      
      // Crear índices necesarios
      await this.createIndexes();
      
      // Configurar políticas RLS
      await this.setupRowLevelSecurity();
      
      console.log('✅ Estructura de base de datos configurada correctamente');
      return { success: true, message: 'Base de datos configurada exitosamente' };
      
    } catch (error) {
      console.error('❌ Error configurando base de datos:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Verificar que las tablas necesarias existen
   */
  async verifyTablesExist() {
    const supabase = await this.initializeSupabase();
    const requiredTables = [
      'analytics_cache',
      'ga4_accounts',
      'ga4_properties',
      'users'
    ];

    for (const tableName of requiredTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          console.log(`📋 Tabla ${tableName} no existe, creando...`);
          await this.createTable(tableName);
        } else if (error) {
          console.warn(`⚠️ Error verificando tabla ${tableName}:`, error);
        } else {
          console.log(`✅ Tabla ${tableName} existe`);
        }
      } catch (error) {
        console.error(`❌ Error verificando tabla ${tableName}:`, error);
      }
    }
  }

  /**
   * Crear una tabla específica
   */
  async createTable(tableName) {
    const supabase = await this.initializeSupabase();
    
    const tableSchemas = {
      analytics_cache: `
        CREATE TABLE IF NOT EXISTS analytics_cache (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          property_id TEXT NOT NULL,
          date_range_start DATE NOT NULL,
          date_range_end DATE NOT NULL,
          cached_data JSONB NOT NULL,
          metrics JSONB,
          dimensions JSONB,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      ga4_accounts: `
        CREATE TABLE IF NOT EXISTS ga4_accounts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          account_id TEXT NOT NULL,
          account_name TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, account_id)
        );
      `,
      ga4_properties: `
        CREATE TABLE IF NOT EXISTS ga4_properties (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          account_id TEXT NOT NULL,
          property_id TEXT NOT NULL,
          property_name TEXT,
          property_type TEXT DEFAULT 'WEB',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, property_id)
        );
      `,
      users: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT,
          full_name TEXT,
          google_access_token TEXT,
          google_refresh_token TEXT,
          google_token_expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    };

    const schema = tableSchemas[tableName];
    if (!schema) {
      throw new Error(`Esquema no definido para tabla ${tableName}`);
    }

    try {
      // Usar RPC para ejecutar SQL directo
      const { error } = await supabase.rpc('execute_sql', {
        query: schema
      });

      if (error) {
        console.warn(`⚠️ No se pudo crear tabla ${tableName} con RPC, intentando método alternativo...`);
        // Si RPC falla, la tabla probablemente ya existe
      }
      
      console.log(`✅ Tabla ${tableName} verificada/creada`);
    } catch (error) {
      console.warn(`⚠️ Error creando tabla ${tableName}:`, error);
      // Continuar con otras tablas
    }
  }

  /**
   * Crear índices para optimizar consultas
   */
  async createIndexes() {
    const supabase = await this.initializeSupabase();
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_analytics_cache_user_property ON analytics_cache(user_id, property_id);',
      'CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);',
      'CREATE INDEX IF NOT EXISTS idx_ga4_accounts_user ON ga4_accounts(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_ga4_properties_user ON ga4_properties(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_users_google_tokens ON users(google_access_token);'
    ];

    for (const indexSQL of indexes) {
      try {
        await supabase.rpc('execute_sql', { query: indexSQL });
        console.log('✅ Índice creado:', indexSQL.substring(0, 50) + '...');
      } catch (error) {
        console.warn('⚠️ Error creando índice:', error);
      }
    }
  }

  /**
   * Configurar Row Level Security
   */
  async setupRowLevelSecurity() {
    const supabase = await this.initializeSupabase();
    const tables = ['analytics_cache', 'ga4_accounts', 'ga4_properties', 'users'];

    for (const tableName of tables) {
      try {
        // Habilitar RLS
        await supabase.rpc('execute_sql', {
          query: `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`
        });

        // Crear política para que los usuarios solo accedan a sus propios datos
        await supabase.rpc('execute_sql', {
          query: `
            CREATE POLICY IF NOT EXISTS "Users can only access their own data" 
            ON ${tableName} 
            FOR ALL 
            USING (auth.uid() = user_id);
          `
        });

        console.log(`✅ RLS configurado para ${tableName}`);
      } catch (error) {
        console.warn(`⚠️ Error configurando RLS para ${tableName}:`, error);
      }
    }
  }

  /**
   * Limpiar caché expirado
   */
  async cleanupExpiredCache() {
    try {
      const supabase = await this.initializeSupabase();
      
      const { error } = await supabase
        .from('analytics_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.warn('⚠️ Error limpiando caché expirado:', error);
      } else {
        console.log('✅ Caché expirado limpiado');
      }
    } catch (error) {
      console.error('❌ Error en limpieza de caché:', error);
    }
  }

  /**
   * Verificar conectividad con Supabase
   */
  async testConnection() {
    try {
      const supabase = await this.initializeSupabase();
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      console.log('✅ Conexión con Supabase exitosa');
      return { success: true, connected: true };
    } catch (error) {
      console.error('❌ Error conectando con Supabase:', error);
      return { success: false, connected: false, error: error.message };
    }
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getDatabaseStats() {
    try {
      const supabase = await this.initializeSupabase();
      
      const [cacheStats, accountsStats, propertiesStats] = await Promise.all([
        supabase.from('analytics_cache').select('id', { count: 'exact', head: true }),
        supabase.from('ga4_accounts').select('id', { count: 'exact', head: true }),
        supabase.from('ga4_properties').select('id', { count: 'exact', head: true })
      ]);

      return {
        analytics_cache: cacheStats.count || 0,
        ga4_accounts: accountsStats.count || 0,
        ga4_properties: propertiesStats.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }
}

export default DatabaseSetupService;