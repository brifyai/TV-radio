import React from 'react';
import { motion } from 'framer-motion';

const SmartInsightsCard = () => {
  const insights = [
    "Los spots en horario de 20:00 a 22:00 tienen un 30% más de impacto",
    "La duración óptima de los spots es de 45 segundos para máxima retención",
    "Los programas de deportes generan un 25% más de tráfico que otros géneros"
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Smart Insights</h2>
      <p className="text-gray-600 mb-6">Análisis inteligente basado en datos</p>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-blue-50 rounded-lg border border-blue-100"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{insight}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        💡 Tip: Estos insights se generan automáticamente mediante análisis de IA sobre los datos históricos.
      </div>
    </div>
  );
};

export default SmartInsightsCard;