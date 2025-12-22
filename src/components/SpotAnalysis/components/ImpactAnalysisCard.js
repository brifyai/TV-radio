import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ImpactAnalysisCard = ({ data }) => {
  const chartData = {
    labels: ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    datasets: [
      {
        label: 'Tráfico Normal',
        data: [2.5, 2.0, 1.8, 2.2, 4.0, 6.0, 7.5, 7.0, 6.5, 5.0, 4.5, 3.0],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Hora Pico',
        data: [null, null, null, null, 6.0, 8.0, 9.5, null, null, null, null, null],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Spot Programado',
        data: [null, null, null, null, 5.5, null, null, 8.0, null, null, null, null],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Patrones de tráfico durante el día',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis de Impacto</h2>
      <p className="text-gray-600 mb-6">Impacto de spots en el tráfico del sitio</p>
      
      <div className="flex space-x-4 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm">Tráfico Normal</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm">Hora Pico</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm">Spot Programado</span>
        </div>
      </div>
      
      <Bar data={chartData} options={options} />
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        💡 Tip: El gráfico muestra el impacto de los spots en el tráfico, con picos destacados durante las horas de mayor actividad.
      </div>
    </div>
  );
};

export default ImpactAnalysisCard;