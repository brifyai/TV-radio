import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TrafficHeatmapCard = ({ data: propData }) => {
  // Si no hay datos, mostrar mensaje de carga
  if (!propData || !propData.labels || !propData.datasets) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mapa de Calor de Tráfico</h2>
        <p className="text-gray-600 mb-6">Distribución del tráfico durante la semana</p>
        
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Cargando datos de tráfico...</p>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Los datos de tráfico aparecerán aquí después del análisis</p>
        </div>
      </div>
    );
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Tráfico por Día de la Semana',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Mapa de Calor de Tráfico</h2>
      <p className="text-gray-600 mb-6">Distribución del tráfico durante la semana</p>
      
      <div className="h-64">
        <Bar data={propData} options={options} />
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>📊 Los datos se actualizan automáticamente según el análisis</p>
      </div>
    </div>
  );
};

export default TrafficHeatmapCard;