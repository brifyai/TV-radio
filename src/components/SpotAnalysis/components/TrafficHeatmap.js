import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TrafficHeatmap = ({ analysisResults }) => {
  // Generar datos de heatmap basados en horarios y días
  const generateHeatmapData = () => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Simular datos de tráfico por hora y día
    const heatmapData = [];
    
    days.forEach((day, dayIndex) => {
      hours.forEach((hour) => {
        let intensity = Math.random() * 100;
        
        // Simular patrones realistas de tráfico
        if (hour >= 9 && hour <= 17) intensity += 30; // Horario laboral
        if (hour >= 19 && hour <= 23) intensity += 40; // Prime time
        if (dayIndex >= 5) intensity -= 20; // Fines de semana
        
        // Si hay datos de spot, marcar esa celda
        let isSpotTime = false;
        if (analysisResults && analysisResults.length > 0) {
          const spotHour = analysisResults[0].spot.dateTime.getHours();
          const spotDay = analysisResults[0].spot.dateTime.getDay() - 1; // 0 = Sunday
          isSpotTime = dayIndex === spotDay && hour === spotHour;
          if (isSpotTime) intensity = Math.max(intensity, 90); // Alto impacto en spot
        }
        
        heatmapData.push({
          day,
          hour,
          intensity: Math.min(100, Math.max(0, intensity)),
          isSpotTime,
          label: `${day} ${hour}:00`
        });
      });
    });
    
    return heatmapData;
  };

  const heatmapData = generateHeatmapData();

  // Datos para gráfico de barras (promedio por hora)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = heatmapData.filter(d => d.hour === hour);
    const avgIntensity = hourData.reduce((sum, d) => sum + d.intensity, 0) / hourData.length;
    
    return {
      hour: `${hour}:00`,
      intensity: Math.round(avgIntensity),
      isPeak: hour >= 9 && hour <= 17 || hour >= 19 && hour <= 23
    };
  });

  const getHeatmapColor = (intensity) => {
    if (intensity >= 80) return '#EF4444'; // Rojo intenso
    if (intensity >= 60) return '#F59E0B'; // Naranja
    if (intensity >= 40) return '#10B981'; // Verde
    if (intensity >= 20) return '#3B82F6'; // Azul
    return '#6B7280'; // Gris
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600">
            <span className="font-medium">Intensidad:</span> {payload[0].value}%
          </p>
          <p className="text-sm text-gray-500">
            {payload[0].value >= 80 ? 'Tráfico muy alto' :
             payload[0].value >= 60 ? 'Tráfico alto' :
             payload[0].value >= 40 ? 'Tráfico medio' :
             payload[0].value >= 20 ? 'Tráfico bajo' : 'Tráfico muy bajo'}
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
          <h3 className="text-xl font-bold text-gray-900">Mapa de Calor de Tráfico</h3>
          <p className="text-sm text-gray-600">Patrones de tráfico por día y hora</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Alto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Medio</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-xs text-gray-600">Bajo</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-8 gap-1">
          {/* Header */}
          <div className="text-xs font-medium text-gray-500 p-2"></div>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500 p-2 text-center">
              {day}
            </div>
          ))}
          
          {/* Heatmap cells */}
          {Array.from({ length: 24 }, (_, hour) => (
            <React.Fragment key={hour}>
              <div className="text-xs font-medium text-gray-500 p-2 text-center">
                {hour}
              </div>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, dayIndex) => {
                const cellData = heatmapData.find(d => d.day === day && d.hour === hour);
                return (
                  <motion.div
                    key={`${day}-${hour}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (hour * 7 + dayIndex) * 0.01 }}
                    className="aspect-square rounded cursor-pointer relative group"
                    style={{ backgroundColor: getHeatmapColor(cellData.intensity) }}
                  >
                    {cellData.isSpotTime && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 border-2 border-yellow-400 rounded"
                      >
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                      </motion.div>
                    )}
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {cellData.label}: {Math.round(cellData.intensity)}%
                    </div>
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Gráfico de barras por hora */}
      <div className="h-48">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Promedio de Tráfico por Hora</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              interval={1}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="intensity" radius={[2, 2, 0, 0]}>
              {hourlyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPeak ? '#EF4444' : getHeatmapColor(entry.intensity)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 grid grid-cols-3 gap-4"
      >
        <div className="text-center p-3 rounded-lg bg-red-50">
          <p className="text-xs text-red-600 mb-1">Hora Pico</p>
          <p className="text-lg font-bold text-red-700">
            {hourlyData.reduce((max, curr) => curr.intensity > max.intensity ? curr : max).hour}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-green-50">
          <p className="text-xs text-green-600 mb-1">Mejor Día</p>
          <p className="text-lg font-bold text-green-700">Martes</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-blue-50">
          <p className="text-xs text-blue-600 mb-1">Spot Timing</p>
          <p className="text-lg font-bold text-blue-700">
            {analysisResults?.[0]?.spot?.dateTime?.toLocaleTimeString('es-CL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) || 'N/A'}
          </p>
        </div>
      </motion.div>

      {/* Leyenda de interpretación */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 p-3 bg-gray-50 rounded-lg"
      >
        <p className="text-xs text-gray-600 text-center">
          💡 <strong>Tip:</strong> Los colores más intensos indican mayor tráfico. 
          El punto amarillo marca el horario de tu spot.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default TrafficHeatmap;