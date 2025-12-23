import React from 'react';
import { motion } from 'framer-motion';

// Importar componentes
import ImpactAnalysisCard from './components/ImpactAnalysisCard';
import ConfidenceLevelCard from './components/ConfidenceLevelCard';
import SmartInsightsCard from './components/SmartInsightsCard';
import TrafficHeatmap from './components/TrafficHeatmap'; // Componente actualizado

const SpotAnalysis = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl shadow-xl p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Análisis de Impacto de Spots TV
            </h1>
            <p className="text-blue-100">
              Plataforma inteligente de análisis con IA
            </p>
          </div>
        </div>
      </motion.div>

      {/* Componentes principales en formato vertical */}
      <div className="space-y-6 p-6">
        <div data-export-id="impact-analysis-card">
          <ImpactAnalysisCard />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div data-export-id="confidence-level-card">
            <ConfidenceLevelCard />
          </div>
          
          <div data-export-id="smart-insights-card">
            <SmartInsightsCard />
          </div>
        </div>
        
        <div data-export-id="traffic-heatmap">
          <TrafficHeatmap />
        </div>
      </div>
    </div>
  );
};

export default SpotAnalysis;