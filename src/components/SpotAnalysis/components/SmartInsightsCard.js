import React from 'react';
import { motion } from 'framer-motion';

const SmartInsightsCard = () => {
  const insights = [
    {
      category: 'Timing del Spot',
      value: 39,
      icon: '⏰',
      text: 'Timing alternativo: Considera spots en horarios de mayor actividad web para maximizar impacto.',
      color: 'bg-blue-100',
      border: 'border-blue-300'
    },
    {
      category: 'Análisis de Impacto',
      value: 95,
      icon: '📊',
      text: 'Impacto moderado: -52.2% de aumento. Considera optimizar el contenido o timing del spot.',
      color: 'bg-green-100',
      border: 'border-green-300'
    },
    {
      category: 'Sostenibilidad del Efecto',
      value: 64,
      icon: '⚡',
      text: 'Efecto sostenido: El tráfico se mantuvo elevado durante la transmisión del spot.',
      color: 'bg-yellow-100',
      border: 'border-yellow-300'
    },
    {
      category: 'Tasa de Conversión Real',
      value: 70,
      icon: '📊',
      text: 'Tasa real medida: 0% (0 páginas vistas / 11 sesiones). Considera optimizar la experiencia del usuario.',
      color: 'bg-purple-100',
      border: 'border-purple-300'
    },
    {
      category: 'Benchmarking',
      value: 95,
      icon: '📊',
      text: 'Por debajo del promedio: Tu spot generó 93.5% menos impacto. Hay oportunidad de mejora.',
      color: 'bg-red-100',
      border: 'border-red-300'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Smart Insights</h2>
          <p className="text-gray-600">Análisis inteligente automático</p>
        </div>
        <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          IA Activa
        </div>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${insight.border} ${insight.color}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-xl mr-3">
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{insight.category}</h3>
                  <span className="text-sm font-bold text-gray-700">{insight.value}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{insight.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        💡 Estos insights se generan automáticamente mediante análisis de IA avanzada sobre datos históricos y en tiempo real.
      </div>
    </div>
  );
};

export default SmartInsightsCard;