/**
 * Sistema de logging controlado para evitar spam en consola
 */

// Configuración del logger
const LOG_CONFIG = {
  // Máximo de mensajes por tipo en un período de tiempo
  maxLogsPerMinute: {
    log: 50,     // Máximo 50 logs normales por minuto
    warn: 20,    // Máximo 20 warnings por minuto
    error: 10,   // Máximo 10 errores por minuto
    debug: 30    // Máximo 30 debug logs por minuto
  },
  // Período de tiempo en milisegundos
  timeWindow: 60000, // 1 minuto
  // Si estamos en desarrollo, permitir más logs
  development: {
    maxLogsPerMinute: {
      log: 100,
      warn: 50,
      error: 20,
      debug: 100
    }
  }
};

// Contadores de logs
const logCounters = {
  log: [],
  warn: [],
  error: [],
  debug: []
};

// Función para limpiar contadores antiguos
const cleanOldCounters = (type) => {
  const now = Date.now();
  logCounters[type] = logCounters[type].filter(timestamp => 
    now - timestamp < LOG_CONFIG.timeWindow
  );
};

// Función para verificar si se puede loggear
const canLog = (type) => {
  cleanOldCounters(type);
  
  const config = process.env.NODE_ENV === 'development' 
    ? LOG_CONFIG.development.maxLogsPerMinute 
    : LOG_CONFIG.maxLogsPerMinute;
  
  return logCounters[type].length < config[type];
};

// Función para registrar un intento de log
const registerLog = (type) => {
  logCounters[type].push(Date.now());
};

// Función principal de logging controlado
const createLogger = () => {
  const originalConsole = { ...console };
  
  return {
    log: (...args) => {
      if (canLog('log')) {
        registerLog('log');
        originalConsole.log(...args);
      } else {
        // Silenciosamente ignorar logs excesivos
        originalConsole.log?.(`🔇 [LOG LIMIT EXCEEDED] ${args.length} mensajes omitidos`);
      }
    },
    
    warn: (...args) => {
      if (canLog('warn')) {
        registerLog('warn');
        originalConsole.warn(...args);
      } else {
        originalConsole.warn?.(`🔇 [WARN LIMIT EXCEEDED] ${args.length} mensajes omitidos`);
      }
    },
    
    error: (...args) => {
      if (canLog('error')) {
        registerLog('error');
        originalConsole.error(...args);
      } else {
        originalConsole.error?.(`🔇 [ERROR LIMIT EXCEEDED] ${args.length} mensajes omitidos`);
      }
    },
    
    debug: (...args) => {
      if (process.env.NODE_ENV === 'development' && canLog('debug')) {
        registerLog('debug');
        originalConsole.debug?.(...args);
      }
    },
    
    // Métodos especiales para logging crítico (siempre permitidos)
    critical: (...args) => {
      originalConsole.error('🚨 CRITICAL:', ...args);
    },
    
    // Método para obtener estadísticas
    getStats: () => {
      const stats = {};
      
      Object.keys(logCounters).forEach(type => {
        cleanOldCounters(type);
        stats[type] = logCounters[type].length;
      });
      
      return stats;
    },
    
    // Método para resetear contadores
    reset: () => {
      Object.keys(logCounters).forEach(type => {
        logCounters[type] = [];
      });
    },
    
    // Restaurar console original (para emergencias)
    restore: () => {
      Object.assign(console, originalConsole);
    }
  };
};

// Crear instancia del logger
const logger = createLogger();

// Reemplazar console global con el controlado
if (typeof window !== 'undefined') {
  // Solo en el navegador
  Object.assign(console, logger);
  
  // Mostrar estadísticas cada 30 segundos en desarrollo
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const stats = logger.getStats();
      const totalLogs = Object.values(stats).reduce((sum, count) => sum + count, 0);
      
      if (totalLogs > 0) {
        console.log(`📊 Logger Stats (último minuto):`, stats);
      }
    }, 30000);
  }
}

export default logger;