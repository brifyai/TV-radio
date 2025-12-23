import React from 'react';

const ConfidenceLevelCard = () => {
  const confidenceLevel = 95; // Nivel de confianza del 95%
  
  // Función para determinar el color de la barra de progreso
  const getProgressColor = (level) => {
    if (level > 90) return 'bg-green-500';
    if (level > 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Nivel de Confianza</h2>
      <p className="text-gray-600 mb-6">Certeza del análisis estadístico</p>
      
      <div className="flex flex-col items-center mb-6">
        <div className="text-5xl font-bold text-blue-700 mb-2">{confidenceLevel}%</div>
        <div className="text-lg font-medium text-green-600">Muy Alta</div>
        <p className="text-sm text-gray-600 mt-1">Análisis altamente confiable</p>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">
          Este nivel de confianza indica la certeza de que los resultados observados son debidos al impacto real del spot TV y no a variaciones aleatorias del tráfico web.
        </p>
        
        <div className="text-sm font-medium text-gray-900 mb-2">Factores evaluados:</div>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>Cantidad de datos</li>
          <li>Consistencia temporal</li>
          <li>Significancia estadística</li>
          <li>Calidad de la referencia de comparación</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Baja Confianza</span>
            <span>Alta Confianza</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getProgressColor(confidenceLevel)}`}
              style={{ width: `${confidenceLevel}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600">Validación cruzada</div>
            <div className="text-lg font-bold text-blue-700">95%</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600">Referencia robusta</div>
            <div className="text-lg font-bold text-green-700">Sí</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600">Análisis estadístico</div>
            <div className="text-lg font-bold text-yellow-700">Alto</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceLevelCard;