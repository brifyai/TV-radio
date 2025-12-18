import { useState, useEffect, useCallback } from 'react';
import { dataIntegrityValidator } from '../utils/dataIntegrityValidator';
import { DATA_INTEGRITY_CONFIG } from '../config/dataIntegrityConfig';

/**
 * HOOK PERSONALIZADO PARA VALIDACIÓN DE INTEGRIDAD DE DATOS
 * Se integra automáticamente en todos los componentes para prevenir datos simulados
 * 
 * CARACTERÍSTICAS:
 * - Validación automática en tiempo real
 * - Bloqueo de datos simulados
 * - Reemplazo con null cuando se detectan anomalías
 * - Logging automático de violaciones
 * - Advertencias UI automáticas
 */

export function useDataIntegrity(data, context = 'unknown', options = {}) {
  const [validatedData, setValidatedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const {
    strictMode = DATA_INTEGRITY_CONFIG.ENFORCE_REAL_DATA_ONLY,
    autoBlock = true,
    replaceWithNull = true,
    showUIWarning = true,
    onViolation = null
  } = options;

  // Función de validación principal
  const validateData = useCallback((dataToValidate, ctx = context) => {
    if (!dataToValidate) {
      return {
        isValid: true,
        data: null,
        violations: [],
        warnings: []
      };
    }

    setIsValidating(true);

    try {
      // Realizar validación completa
      const result = dataIntegrityValidator.validateDataIntegrity(dataToValidate, ctx);
      
      let finalData = dataToValidate;
      let shouldReplace = false;

      // Verificar si hay violaciones críticas
      const hasCriticalViolations = result.violations.some(v => v.severity === 'critical');
      const hasSuspiciousPatterns = result.violations.some(v => v.type === 'SIMULATED_PATTERN_DETECTED');

      if (strictMode && (hasCriticalViolations || hasSuspiciousPatterns)) {
        console.error('🚨 DATOS SIMULADOS DETECTADOS:', {
          context: ctx,
          violations: result.violations,
          originalData: dataToValidate
        });

        if (autoBlock) {
          if (replaceWithNull) {
            finalData = null;
            shouldReplace = true;
          }
          
          if (showUIWarning) {
            setShowWarning(true);
          }
        }

        // Ejecutar callback personalizado si existe
        if (onViolation) {
          onViolation(result, dataToValidate);
        }
      }

      setValidationResult({
        ...result,
        wasReplaced: shouldReplace,
        originalData: dataToValidate
      });

      setValidatedData(finalData);
      return {
        isValid: !hasCriticalViolations && !hasSuspiciousPatterns,
        data: finalData,
        violations: result.violations,
        warnings: result.warnings,
        wasReplaced: shouldReplace
      };

    } catch (error) {
      console.error('❌ Error en validación de datos:', error);
      
      const errorResult = {
        isValid: false,
        data: null,
        violations: [{
          type: 'VALIDATION_ERROR',
          severity: 'critical',
          message: error.message,
          context: ctx
        }],
        warnings: [],
        error: error.message
      };

      setValidationResult(errorResult);
      setValidatedData(null);
      return errorResult;

    } finally {
      setIsValidating(false);
    }
  }, [context, strictMode, autoBlock, replaceWithNull, showUIWarning, onViolation]);

  // Validar datos cuando cambien
  useEffect(() => {
    if (data !== undefined) {
      validateData(data, context);
    }
  }, [data, context, validateData]);

  // Función para validar datos manualmente
  const validateManually = useCallback((newData, newContext = context) => {
    return validateData(newData, newContext);
  }, [validateData]);

  // Función para limpiar advertencias
  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  // Función para obtener reporte de integridad
  const getIntegrityReport = useCallback(() => {
    return dataIntegrityValidator.getIntegrityReport();
  }, []);

  // Función para habilitar/deshabilitar validación
  const setValidationEnabled = useCallback((enabled) => {
    dataIntegrityValidator.setValidationEnabled(enabled);
  }, []);

  return {
    // Datos validados (pueden ser null si se detectaron simulaciones)
    data: validatedData,
    
    // Resultado completo de la validación
    validationResult,
    
    // Estado de validación
    isValidating,
    
    // Si se debe mostrar advertencia UI
    showWarning,
    
    // Funciones utilitarias
    validateManually,
    dismissWarning,
    getIntegrityReport,
    setValidationEnabled,
    
    // Estado de los datos
    hasData: validatedData !== null && validatedData !== undefined,
    isValid: validationResult?.isValid ?? true,
    wasReplaced: validationResult?.wasReplaced ?? false,
    violations: validationResult?.violations ?? [],
    warnings: validationResult?.warnings ?? []
  };
}

/**
 * HOOK ESPECIALIZADO PARA DATOS DE ANALYTICS
 * Específicamente diseñado para validar datos de Google Analytics
 */
export function useAnalyticsDataIntegrity(analyticsData, context = 'analytics') {
  return useDataIntegrity(analyticsData, context, {
    strictMode: true,
    autoBlock: true,
    replaceWithNull: true,
    showUIWarning: true,
    onViolation: (result, originalData) => {
      console.warn('🚨 Violación en datos de Analytics:', {
        context,
        violations: result.violations,
        dataSource: originalData?.fuente_datos
      });
    }
  });
}

/**
 * HOOK ESPECIALIZADO PARA DATOS DE VIDEO ANALYSIS
 * Específicamente diseñado para validar análisis de video
 */
export function useVideoAnalysisIntegrity(videoData, context = 'video_analysis') {
  return useDataIntegrity(videoData, context, {
    strictMode: true,
    autoBlock: true,
    replaceWithNull: true,
    showUIWarning: true,
    onViolation: (result, originalData) => {
      console.warn('🚨 Violación en análisis de video:', {
        context,
        violations: result.violations,
        model: originalData?.model
      });
    }
  });
}

/**
 * HOOK PARA VALIDACIÓN EN LOTE
 * Valida múltiples conjuntos de datos simultáneamente
 */
export function useBatchDataIntegrity(dataSets, context = 'batch') {
  const [results, setResults] = useState({});
  const [overallValid, setOverallValid] = useState(true);

  useEffect(() => {
    if (!dataSets || typeof dataSets !== 'object') return;

    const validationResults = {};
    let allValid = true;

    Object.entries(dataSets).forEach(([key, data]) => {
      const result = dataIntegrityValidator.validateDataIntegrity(data, `${context}.${key}`);
      validationResults[key] = result;
      
      if (!result.isValid) {
        allValid = false;
      }
    });

    setResults(validationResults);
    setOverallValid(allValid);
  }, [dataSets, context]);

  const validateSet = useCallback((key, data) => {
    const result = dataIntegrityValidator.validateDataIntegrity(data, `${context}.${key}`);
    setResults(prev => ({
      ...prev,
      [key]: result
    }));
    return result;
  }, [context]);

  return {
    results,
    overallValid,
    validateSet,
    getResult: (key) => results[key],
    getViolationCount: () => Object.values(results).reduce((sum, r) => sum + r.violations.length, 0)
  };
}

export default useDataIntegrity;