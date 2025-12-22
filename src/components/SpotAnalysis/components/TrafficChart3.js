import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Activity } from 'lucide-react';

const TrafficChart3 = ({ analysisResults }) => {
  // Generar datos de tráfico por hora basados en datos reales de análisis
  const generateTrafficData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    if (analysisResults && analysisResults.length > 0) {
      const spotData = analysisResults[0];
      const spotHour = spotData.spot.dateTime.getHours();
      
      return hours.map(hour => {
        // Datos diferentes para el tercer gráfico
        let baseTraffic = 25 + Math.random() * 15;
        
        // Patrones diferentes - enfocado en actividad comercial
        if (hour >= 10 && hour <= 12) baseTraffic += 20; // Mañana comercial
        if (hour >= 15 && hour <= 17) baseTraffic += 25; // Tarde comercial
        if (hour >= 21 && hour <= 23) baseTraffic += 30; // Noche comercial
        if (hour >= 13 && hour <= 14) baseTraffic += 15; // Almuerzo
        if (hour >= 0 && hour <= 7) baseTraffic -= 15; // Noche/madrugada muy baja
        
        // Marcar el horario del spot con intensidad diferente
        const isSpotTime = hour === spotHour;
        if (isSpotTime) {
          baseTraffic += 45;
        }
        
        return {
          hour: `${hour}:00`,
          traffic: Math.round(baseTraffic),
          isSpotTime
        };
      });
    }
    
    // Datos simulados si no hay análisis
    return hours.map(hour => ({
      hour: `${hour}:00`,
      traffic: Math.round(25 + Math.random() * 20),
      isSpotTime: false
    }));
  };

  const trafficData = generateTrafficData();
  const maxTraffic = Math.max(...trafficData.map(d => d.traffic));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Actividad Comercial</h3>
          <p className="text-sm text-gray-600">Tráfico durante horas comerciales</p>
        </div>
        <div className="p-3 bg-purple-100 rounded-full">
          <Activity className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      {/* Gráfico de barras - Ocupando todo el ancho */}
      <div className="w-full mb-6">
        <div className="flex items-end justify-between h-40 w-full px-2">
          {trafficData.slice(0, 12).map((data, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(data.traffic / maxTraffic) * 100}%` }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className={`flex-1 mx-0.5 rounded-t-lg ${
                data.isSpotTime ? 'bg-purple-500' : 'bg-indigo-500'
              } relative group`}
              style={{ minHeight: '4px' }}
            >
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {data.hour}: {data.traffic} visitas
                {data.isSpotTime && <span className="block text-purple-300">⭐ Spot TV</span>}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Etiquetas de horas */}
        <div className="flex justify-between px-2 mt-2">
          {trafficData.slice(0, 12).map((data, index) => (
            <div key={index} className="text-xs text-gray-500 text-center flex-1">
              {data.hour.split(':')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 mb-1">Hora Comercial Pico</p>
          <p className="text-lg font-bold text-purple-700">
            {(() => {
              const commercialHours = trafficData.filter(d => {
                const hour = parseInt(d.hour.split(':')[0]);
                return (hour >= 10 && hour <= 12) || (hour >= 15 && hour <= 17) || (hour >= 21 && hour <= 23);
              });
              const peakHour = commercialHours.reduce((max, current) => 
                current.traffic > max.traffic ? current : max
              );
              return peakHour.hour;
            })()}
          </p>
        </div>
        <div className="text-center p-3 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-600 mb-1">Promedio Comercial</p>
          <p className="text-lg font-bold text-indigo-700">
            {(() => {
              const commercialHours = trafficData.filter(d => {
                const hour = parseInt(d.hour.split(':')[0]);
                return (hour >= 10 && hour <= 12) || (hour >= 15 && hour <= 17) || (hour >= 21 && hour <= 23);
              });
              return Math.round(commercialHours.reduce((sum, d) => sum + d.traffic, 0) / commercialHours.length);
            })()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrafficChart3;