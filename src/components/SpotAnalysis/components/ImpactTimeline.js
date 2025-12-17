import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ImpactTimeline = ({ spotData, analysisResults }) => {
  // Generar datos de timeline basados en datos reales
  const generateTimelineData = () => {
    if (!analysisResults || analysisResults.length === 0) return [];
    
    const spot = analysisResults[0]; // Tomar el primer spot como ejemplo
    
    // Solo usar datos reales disponibles, evitar multiplicadores simulados
    const timePoints = [
      { time: 'Spot', label: 'Durante Spot', impact: spot.metrics?.spot?.activeUsers || 0, color: '#10B981' }
    ];
    
    // Solo agregar puntos adicionales si hay datos reales disponibles
    // Evitar datos simulados con multiplicadores arbitrarios
    return timePoints;
  };

  const timelineData = generateTimelineData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].payload.label}</p>
          <p className="text-blue-600">
            <span className="font-medium">Impacto:</span> {payload[0].value} usuarios
          </p>
          <p className="text-sm text-gray-500">
            {label === 'Spot' ? 'Momento del spot' : `${label} después del spot`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Timeline de Impacto</h3>
          <p className="text-sm text-gray-600">Evolución del tráfico en el tiempo</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">En tiempo real</span>
        </div>
      </div>

      {/* Timeline Visual */}
      <div className="mb-6">
        <div className="flex items-center justify-between relative">
          {timelineData.map((point, index) => (
            <div key={index} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: point.color }}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="mt-2 text-center"
              >
                <p className="text-xs font-medium text-gray-900">{point.time}</p>
                <p className="text-xs text-gray-500">{point.impact}</p>
              </motion.div>
            </div>
          ))}
          
          {/* Línea conectora */}
          <div className="absolute top-2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-blue-500 via-purple-500 via-yellow-500 to-red-500"></div>
        </div>
      </div>

      {/* Gráfico de línea */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="impact" 
              stroke="url(#gradient)" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="25%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="75%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {timelineData.slice(1).map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="text-center p-3 rounded-lg bg-gray-50"
          >
            <p className="text-xs text-gray-600 mb-1">{point.time}</p>
            <p className="text-lg font-bold" style={{ color: point.color }}>
              {point.impact}
            </p>
            <p className="text-xs text-gray-500">usuarios</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ImpactTimeline;