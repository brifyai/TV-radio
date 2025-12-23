import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getSpotAnalysisData } from '../../services/spotAnalysisService';
import ImpactAnalysisCard from './components/ImpactAnalysisCard';
import ConfidenceLevelCard from './components/ConfidenceLevelCard';
import SmartInsightsCard from './components/SmartInsightsCard';
import TrafficHeatmap from './components/TrafficHeatmap';
import LoadingSpinner from '../UI/LoadingSpinner';
import SimpleExportButton from '../UI/SimpleExportButton';

const SpotAnalysis = () => {
  const { currentUser } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sistema de exportación sin referencias compartidas
  const [exportStatus, setExportStatus] = useState({
    impact: false,
    confidence: false,
    insights: false,
    traffic: false
  });

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

      {/* Componentes principales con NUEVO SISTEMA DE EXPORTACIÓN - SIN REFERENCIAS COMPARTIDAS */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenedor de Análisis de Impacto - con data-export para el nuevo sistema */}
        <div className="lg:col-span-2" data-export="impact">
          <div className="flex justify-end mb-4">
            <SimpleExportButton
              exportType="impact"
              className="z-10"
            />
          </div>
          <ImpactAnalysisCard data={analysisData?.impactAnalysis} />
        </div>
        
        {/* Columna derecha: Nivel de Confianza y Smart Insights */}
        <div className="flex flex-col gap-6">
          <div data-export="confidence">
            <div className="flex justify-end mb-4">
              <SimpleExportButton
                exportType="confidence"
                className="z-10"
              />
            </div>
            <ConfidenceLevelCard confidence={analysisData?.confidenceLevel} />
          </div>
          
          <div data-export="insights">
            <div className="flex justify-end mb-4">
              <SimpleExportButton
                exportType="insights"
                className="z-10"
              />
            </div>
            <SmartInsightsCard insights={analysisData?.smartInsights} />
          </div>
        </div>
        
        {/* Mapa de Calor - ancho completo debajo */}
        <div className="lg:col-span-3" data-export="traffic">
          <div className="flex justify-end mb-4">
            <SimpleExportButton
              exportType="traffic"
              className="z-10"
            />
          </div>
          <TrafficHeatmap data={analysisData?.trafficData} />
        </div>
      </div>
    </div>
  );
};

export default SpotAnalysis;