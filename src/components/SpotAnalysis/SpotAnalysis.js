import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getSpotAnalysisData } from '../../services/spotAnalysisService';
import ImpactAnalysisCard from './components/ImpactAnalysisCard';
import ConfidenceLevelCard from './components/ConfidenceLevelCard';
import SmartInsightsCard from './components/SmartInsightsCard';
import TrafficHeatmap from './components/TrafficHeatmap';
import LoadingSpinner from '../UI/LoadingSpinner';
import ImageExportButton from '../UI/ImageExportButton';

const SpotAnalysis = () => {
  const { currentUser } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Referencias para exportar imágenes
  const impactRef = useRef();
  const confidenceRef = useRef();
  const insightsRef = useRef();
  const trafficRef = useRef();

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

      {/* Componentes principales con altura uniforme */}
      <div className="p-6 space-y-6">
        <div ref={impactRef} className="relative">
          <ImageExportButton
            targetRef={impactRef}
            filename="impact-analysis"
            className="absolute top-4 right-4 z-10"
          />
          <ImpactAnalysisCard data={analysisData?.impactAnalysis} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div ref={confidenceRef} className="flex-1 min-h-[300px] relative">
            <ImageExportButton
              targetRef={confidenceRef}
              filename="confidence-level"
              className="absolute top-4 right-4 z-10"
            />
            <ConfidenceLevelCard confidence={analysisData?.confidenceLevel} />
          </div>
          
          <div ref={insightsRef} className="flex-1 min-h-[300px] relative">
            <ImageExportButton
              targetRef={insightsRef}
              filename="smart-insights"
              className="absolute top-4 right-4 z-10"
            />
            <SmartInsightsCard insights={analysisData?.smartInsights} />
          </div>
        </div>
        
        <div ref={trafficRef} className="relative">
          <ImageExportButton
            targetRef={trafficRef}
            filename="traffic-heatmap"
            className="absolute top-4 right-4 z-10"
          />
          <TrafficHeatmap data={analysisData?.trafficData} />
        </div>
      </div>
    </div>
  );
};

export default SpotAnalysis;