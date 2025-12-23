import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getSpotAnalysisData } from '../../services/spotAnalysisService'; // Nuevo servicio

// Importar componentes
import ImpactAnalysisCard from './components/ImpactAnalysisCard';
import ConfidenceLevelCard from './components/ConfidenceLevelCard';
import SmartInsightsCard from './components/SmartInsightsCard';
import TrafficHeatmap from './components/TrafficHeatmap';
import LoadingSpinner from '../UI/LoadingSpinner';

const SpotAnalysis = () => {
  const { currentUser } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const data = await getSpotAnalysisData(currentUser.uid);
        setAnalysisData(data);
      } catch (err) {
        console.error('Error fetching spot analysis data:', err);
        setError('Error al cargar datos de análisis');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAnalysisData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
          <ImpactAnalysisCard data={analysisData?.impactAnalysis} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div data-export-id="confidence-level-card">
            <ConfidenceLevelCard confidence={analysisData?.confidenceLevel} />
          </div>
          
          <div data-export-id="smart-insights-card">
            <SmartInsightsCard insights={analysisData?.smartInsights} />
          </div>
        </div>
        
        <div data-export-id="traffic-heatmap">
          <TrafficHeatmap data={analysisData?.trafficData} />
        </div>
      </div>
    </div>
  );
};

export default SpotAnalysis;