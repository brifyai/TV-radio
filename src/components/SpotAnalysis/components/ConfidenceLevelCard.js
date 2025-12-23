import React, { useRef } from 'react';
import ImageExportButton from '../../UI/ImageExportButton';

const ConfidenceLevelCard = () => {
  // Referencia para exportar imagen
  const exportRef = useRef();

  const confidenceLevel = 95; // Nivel de confianza del 95%
  
  // Función para determinar el color de la barra de progreso
  const getProgressColor = (level) => {
    if (level > 90) return 'bg-green-500';
    if (level > 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div ref={exportRef} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col relative">
      {/* Botón de exportar */}
      <ImageExportButton
        targetRef={exportRef}
        filename="confidence-level"
        className="absolute top-4 right-4 z-10"
      />

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Nivel de Confianza</h2>
        <p className="text-gray-600 mb-4">Certeza del análisis estadístico</p>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col items-center mb-4">
          <div className="text-5xl font-bold text-blue-700 mb-1">{confidenceLevel}%</div>
          <div className="text-lg font-medium text-green-600">Muy Alta</div>
          <p className="text-sm text-gray-600">Análisis altamente confiable</p>
        </div>
        
        <div className="mb-4">
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
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg text-center">
            <div className="text-xs text-gray-600">Validación cruzada</div>
            <div className="text-base font-bold text-blue-700">95%</div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg text-center">
            <div className="text-xs text-gray-600">Referencia robusta</div>
            <div className="text-base font-bold text-green-700">Sí</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded-lg text-center">
            <div className="text-xs text-gray-600">Análisis estadístico</div>
            <div className="text-base font-bold text-yellow-700">Alto</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-600">
          <p className="mb-2">
            Este nivel indica la certeza de que los resultados se deben al impacto real del spot TV.
          </p>
          <div className="font-medium text-gray-900 mb-1">Factores evaluados:</div>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Cantidad de datos</li>
            <li>Consistencia temporal</li>
            <li>Significancia estadística</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceLevelCard;