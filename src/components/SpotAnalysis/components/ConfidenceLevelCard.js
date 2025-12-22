import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ConfidenceLevelCard = () => {
  const confidenceLevel = 85; // Nivel de confianza del 85%
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Nivel de Confianza</h2>
      <p className="text-gray-600 mb-6">Fiabilidad de los datos de impacto</p>
      
      <div className="flex items-center justify-center mb-4">
        <div className="w-40 h-40">
          <CircularProgressbar
            value={confidenceLevel}
            text={`${confidenceLevel}%`}
            styles={buildStyles({
              textSize: '16px',
              pathColor: `rgba(59, 130, 246, ${confidenceLevel / 100})`,
              textColor: '#1f2937',
              trailColor: '#d1d5db',
            })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Datos Validados</p>
          <p className="font-bold text-lg">98%</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Correlación</p>
          <p className="font-bold text-lg">Alta</p>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        💡 Tip: Un nivel de confianza superior al 80% indica datos altamente fiables para la toma de decisiones.
      </div>
    </div>
  );
};

export default ConfidenceLevelCard;