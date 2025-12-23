import React from 'react';

const TrafficHeatmap = () => {
  // Datos de ejemplo para el mapa de calor
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hours = ['0', '3', '6', '9', '12', '15', '18', '21'];
  
  // Generar datos aleatorios para demostración
  const generateHeatmapData = () => {
    return days.map(() => 
      hours.map(() => Math.floor(Math.random() * 100))
    );
  };

  const heatmapData = generateHeatmapData();
  
  // Función para determinar el color basado en la intensidad
  const getColor = (value) => {
    if (value > 80) return 'bg-red-600';
    if (value > 60) return 'bg-orange-500';
    if (value > 40) return 'bg-yellow-400';
    if (value > 20) return 'bg-green-400';
    return 'bg-gray-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mapa de Calor de Tráfico</h2>
          <p className="text-gray-600">Patrones de tráfico por día y hora</p>
        </div>
        <div className="text-sm text-gray-600">
          <span className="inline-block w-3 h-3 bg-gray-200 rounded-sm mr-1"></span> Bajo
          <span className="inline-block w-3 h-3 bg-green-400 rounded-sm mx-2 mr-1"></span> Medio
          <span className="inline-block w-3 h-3 bg-red-600 rounded-sm mx-2 mr-1"></span> Alto
        </div>
      </div>

      <div className="grid grid-cols-9 gap-1">
        {/* Celda vacía para alinear horas */}
        <div></div>
        
        {/* Encabezados de horas */}
        {hours.map(hour => (
          <div key={hour} className="text-xs text-center text-gray-600 py-1">
            {hour}:00
          </div>
        ))}
        
        {/* Filas de días y datos */}
        {days.map((day, dayIndex) => (
          <React.Fragment key={day}>
            {/* Nombre del día */}
            <div className="text-xs text-gray-600 pr-2 py-1 flex items-center">
              {day}
            </div>
            
            {/* Celdas de datos */}
            {hours.map((_, hourIndex) => {
              const value = heatmapData[dayIndex][hourIndex];
              return (
                <div
                  key={`${day}-${hourIndex}`}
                  className={`h-8 rounded-sm flex items-center justify-center ${getColor(value)}`}
                  title={`${day} ${hours[hourIndex]}:00 - ${value}%`}
                >
                  <span className="text-xs text-white font-medium">{value}%</span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-4 flex items-center">
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Mejor Día:</span> Lun | 
            <span className="font-medium ml-2">Spot Timing:</span> 06:56 p.m.
          </p>
        </div>
        <div className="text-blue-600 text-sm">
          💡 Los colores más intensos indican mayor tráfico
        </div>
      </div>
    </div>
  );
};

export default TrafficHeatmap;