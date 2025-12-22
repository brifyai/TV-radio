import React from 'react';
import { motion } from 'framer-motion';

// Importar nuevos componentes
import ImpactAnalysisCard from './components/ImpactAnalysisCard';
import ConfidenceLevelCard from './components/ConfidenceLevelCard';
import SmartInsightsCard from './components/SmartInsightsCard';
import TrafficHeatmapCard from './components/TrafficHeatmapCard';

const SpotAnalysis = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6"
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
        
        <div data-export-id="confidence-level-card">
          <ConfidenceLevelCard />
        </div>
        
        <div data-export-id="smart-insights-card">
          <SmartInsightsCard />
        </div>
        
        <div data-export-id="traffic-heatmap-card">
          <TrafficHeatmapCard />
        </div>
      </div>
    </div>
  );
};

export default SpotAnalysis;