import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Users, BarChart3 } from 'lucide-react';

const ImpactTimeline = ({ spotData, analysisResults }) => {
  if (!analysisResults || analysisResults.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline de Impacto</h3>
          <p className="text-gray-600">No hay datos de análisis disponibles</p>
        </div>
      </motion.div>
    );
  }

  // Calcular estadísticas del análisis
  const totalSpots = analysisResults.length;
  const avgImpact = analysisResults.reduce((sum, result) =>
    sum + (result.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
  const positiveImpacts = analysisResults.filter(result =>
    (result.impact?.activeUsers?.percentageChange || 0) > 0).length;
  const maxImpact = Math.max(...analysisResults.map(result =>
    result.impact?.activeUsers?.percentageChange || 0));
  const minImpact = Math.min(...analysisResults.map(result =>
    result.impact?.activeUsers?.percentageChange || 0));

  // Obtener el mejor y peor spot
  const bestSpot = analysisResults.reduce((best, current) =>
    (current.impact?.activeUsers?.percentageChange || 0) > (best.impact?.activeUsers?.percentageChange || 0) ? current : best
  );
  const worstSpot = analysisResults.reduce((worst, current) =>
    (current.impact?.activeUsers?.percentageChange || 0) < (worst.impact?.activeUsers?.percentageChange || 0) ? current : worst
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Análisis de Impacto</h3>
          <p className="text-sm text-gray-600">Resultados de todos los spots analizados</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${avgImpact >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {avgImpact >= 0 ? 'Impacto Positivo' : 'Impacto Negativo'}
          </span>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-800">Total Spots</p>
              <p className="text-lg font-bold text-blue-900">{totalSpots}</p>
            </div>
            <Target className="h-6 w-6 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-3 rounded-lg border ${
            avgImpact >= 0
              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
              : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium ${avgImpact >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Impacto Prom.
              </p>
              <p className={`text-lg font-bold ${avgImpact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {avgImpact >= 0 ? '+' : ''}{avgImpact.toFixed(1)}%
              </p>
            </div>
            {avgImpact >= 0 ? (
              <TrendingUp className="h-6 w-6 text-green-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-800">Exitosos</p>
              <p className="text-lg font-bold text-purple-900">
                {positiveImpacts}
              </p>
            </div>
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-800">Mejor</p>
              <p className="text-lg font-bold text-orange-900">+{maxImpact.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Análisis Detallado - Compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 flex-1">
        {/* Mejor Spot */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
        >
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-green-900">Más Exitoso</h4>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-green-800">
              <span className="font-medium">Impacto:</span> +{bestSpot.impact?.activeUsers?.percentageChange?.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-green-700 truncate">
              {bestSpot.titulo_programa || bestSpot.nombre || 'N/A'}
            </p>
          </div>
        </motion.div>

        {/* Peor Spot */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200"
        >
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
              <TrendingDown className="h-3 w-3 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-red-900">Menor Impacto</h4>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-red-800">
              <span className="font-medium">Impacto:</span> {minImpact.toFixed(1)}%
            </p>
            <p className="text-xs text-red-700 truncate">
              {worstSpot.titulo_programa || worstSpot.nombre || 'N/A'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Conclusión - Compacta */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 flex-shrink-0"
      >
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-900 mb-1">Conclusión</h4>
            <p className="text-xs text-gray-700 line-clamp-2">
              {avgImpact > 10
                ? "Impacto significativo y positivo en el tráfico."
                : avgImpact > 0
                ? "Impacto moderado pero consistente."
                : "Impacto negativo, revisar estrategia."}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {positiveImpacts}/{totalSpots} spots con impacto positivo
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImpactTimeline;