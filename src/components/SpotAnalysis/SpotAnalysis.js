import React, { useState, useCallback, useEffect } from 'react';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { useAuth } from '../../contexts/AuthContext';
import { getSpotAnalysisData } from '../../services/spotAnalysisService';
import { generateAIAnalysis, generateBatchAIAnalysis } from '../../services/aiAnalysisService';
import { TemporalAnalysisService } from '../../services/temporalAnalysisService';
import conversionAnalysisService from '../../services/conversionAnalysisService';
import { predictiveAnalyticsService } from '../../services/predictiveAnalyticsService';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import {
  Upload,
  Video,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  MousePointer,
  AlertCircle,
  Download,
  RefreshCw,
  Brain,
  Zap,
  Target,
  Clock,
  TrendingDown
} from 'lucide-react';

// Importar componentes modernos
import ImpactAnalysisCard from './components/ImpactAnalysisCard';
import ConfidenceLevelCard from './components/ConfidenceLevelCard';
import SmartInsightsCard from './components/SmartInsightsCard';
import TrafficHeatmap from './components/TrafficHeatmap';
import YouTubeVideoInput from './components/YouTubeVideoInput';
import LoadingSpinner from '../UI/LoadingSpinner';
import SimpleExportButton from '../UI/SimpleExportButton';

// Función para generar datos simulados
const getSimulatedSpotAnalysisData = () => {
  return {
    impactAnalysis: {
      analysisResults: {
        impactScore: 85,
        impactPercentage: 23.5,
        timingEffectiveness: 'Excelente',
        timingRecommendation: 'El spot fue transmitido en el momento óptimo de mayor audiencia',
        sustainabilityScore: 78,
        sustainabilityDescription: 'El efecto del spot se mantiene por 3-4 días',
        conversionRate: 4.2,
        dataQuality: 'high'
      }
    },
    confidenceLevel: 92,
    smartInsights: [
      {
        category: 'Timing del Spot',
        value: 95,
        icon: '⏰',
        text: 'El spot fue transmitido en el momento óptimo de mayor audiencia',
        color: 'bg-blue-100',
        border: 'border-blue-300'
      },
      {
        category: 'Análisis de Impacto',
        value: 85,
        icon: '📊',
        text: 'Impacto: 23.5% de aumento',
        color: 'bg-green-100',
        border: 'border-green-300'
      },
      {
        category: 'Sostenibilidad del Efecto',
        value: 78,
        icon: '⚡',
        text: 'El efecto del spot se mantiene por 3-4 días',
        color: 'bg-yellow-100',
        border: 'border-yellow-300'
      },
      {
        category: 'Tasa de Conversión Real',
        value: 4.2,
        icon: '📊',
        text: 'Tasa real: 4.2%',
        color: 'bg-purple-100',
        border: 'border-purple-300'
      }
    ],
    trafficData: {
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        traffic: Math.floor(Math.random() * 1000) + 500,
        conversions: Math.floor(Math.random() * 50) + 10
      }))
    }
  };
};

const SpotAnalysis = () => {
  const { user } = useAuth();
  const { accounts, properties, getAnalyticsData, isConnected } = useGoogleAnalytics();
  
  // Estados para el análisis de spots
  const [spotsFile, setSpotsFile] = useState(null);
  const [spotsData, setSpotsData] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [batchAIAnalysis, setBatchAIAnalysis] = useState(null);
  const [viewMode, setViewMode] = useState('modern'); // 'modern' o 'classic'
  const [temporalAnalysis, setTemporalAnalysis] = useState(null);
  const [temporalBaseline, setTemporalBaseline] = useState(null);
  const [conversionAnalysis, setConversionAnalysis] = useState(null);
  const [controlGroupAnalysis, setControlGroupAnalysis] = useState(null);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [youtubeAnalysis, setYoutubeAnalysis] = useState(null);

  // Filtrar y ordenar propiedades basadas en la cuenta seleccionada
  const filteredProperties = selectedAccount
    ? properties
        .filter(prop => prop.accountId === selectedAccount)
        .sort((a, b) => (a.displayName || a.property_name || a.name).localeCompare(b.displayName || b.property_name || b.name))
    : [];

  // Ordenar cuentas alfabéticamente
  const sortedAccounts = [...accounts].sort((a, b) =>
    (a.displayName || a.account_name || a.name).localeCompare(b.displayName || b.account_name || b.name)
  );

  // Instancia del servicio de análisis temporal
  const temporalAnalysisService = new TemporalAnalysisService();

  // Parsear CSV mejorado - LEE fecha, hora inicio, Canal, Titulo Programa, inversion
  const parseCSV = useCallback((content) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Validar máximo 100 líneas (encabezado + 100 datos = 101 total)
    if (lines.length > 101) {
      throw new Error('El archivo excede el límite máximo de 100 líneas de datos');
    }
    
    // Detectar delimitador (coma o punto y coma)
    const delimiter = lines[0].includes(';') ? ';' : ',';
    
    // Extraer headers y encontrar índices de las columnas que necesitamos
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
    const fechaIndex = headers.findIndex(h => h === 'fecha');
    const horaIndex = headers.findIndex(h => h === 'hora inicio');
    const canalIndex = headers.findIndex(h => h === 'canal');
    const tituloIndex = headers.findIndex(h => h === 'titulo programa');
    const inversionIndex = headers.findIndex(h => h === 'inversion');
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha" y "hora inicio"');
    }
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(delimiter).map(v => v.trim());
      
      // Extraer todas las columnas necesarias
      return {
        fecha: values[fechaIndex] || '',
        hora_inicio: values[horaIndex] || '',
        canal: values[canalIndex] || '',
        titulo_programa: values[tituloIndex] || '',
        inversion: values[inversionIndex] || ''
      };
    }).filter(spot => spot.fecha || spot.hora_inicio); // Filtrar filas vacías
  }, []);

  // Parsear datos de Excel - LEE fecha, hora inicio, Canal, Titulo Programa, inversion
  const parseExcelData = useCallback((jsonData) => {
    if (jsonData.length === 0) return [];
    
    // Validar máximo 100 líneas de datos (encabezado + 100 datos)
    if (jsonData.length > 101) {
      throw new Error('El archivo excede el límite máximo de 100 líneas de datos');
    }
    
    // Primera fila como headers
    const headers = jsonData[0].map(h => (h || '').toString().toLowerCase());
    const fechaIndex = headers.findIndex(h => h === 'fecha');
    const horaIndex = headers.findIndex(h => h === 'hora inicio');
    const canalIndex = headers.findIndex(h => h === 'canal');
    const tituloIndex = headers.findIndex(h => h === 'titulo programa');
    const inversionIndex = headers.findIndex(h => h === 'inversion');
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha" y "hora inicio"');
    }
    
    return jsonData.slice(1).map((row, index) => {
      // Extraer todas las columnas necesarias
      return {
        fecha: row[fechaIndex] || '',
        hora_inicio: row[horaIndex] || '',
        canal: row[canalIndex] || '',
        titulo_programa: row[tituloIndex] || '',
        inversion: row[inversionIndex] || ''
      };
    }).filter(spot => spot.fecha || spot.hora_inicio); // Filtrar filas vacías
  }, []);

  // Parsear fecha y hora con múltiples formatos - SOPORTA FECHAS SERIAL DE EXCEL
  const parseDateTimeFlexible = useCallback((fecha, hora) => {
    if (!fecha || !hora) return new Date(NaN);
    
    let dateObj;
    
    // CASO 1: Si fecha es un número (serial de Excel)
    if (!isNaN(fecha) && fecha.toString().match(/^\d+(\.\d+)?$/)) {
      const excelSerial = parseFloat(fecha);
      
      // Excel serial: días desde 1900-01-01 (pero Excel tiene un bug para 1900)
      // JavaScript: milisegundos desde 1970-01-01
      const excelEpoch = new Date(1900, 0, 1);
      
      // Convertir serial de Excel a fecha JavaScript
      dateObj = new Date(excelEpoch.getTime() + (excelSerial - 1) * 24 * 60 * 60 * 1000);
      
      // Si la hora también es un número serial, sumarlo
      if (!isNaN(hora) && hora.toString().match(/^\d+(\.\d+)?$/)) {
        const horaSerial = parseFloat(hora);
        const horas = Math.floor(horaSerial * 24);
        const minutos = Math.floor((horaSerial * 24 - horas) * 60);
        const segundos = Math.floor(((horaSerial * 24 - horas) * 60 - minutos) * 60);
        
        dateObj.setHours(horas, minutos, segundos);
      }
      
      return dateObj;
    }
    
    // CASO 2: Si es texto, intentar parsear
    fecha = fecha.toString().trim();
    hora = hora.toString().trim();
    
    // Intentar diferentes formatos de fecha
    const dateFormats = [
      // Formatos latinoamericanos DD/MM/YYYY
      /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/,
      // Formatos ISO YYYY-MM-DD
      /^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/,
      // Formatos americanos MM/DD/YYYY
      /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/
    ];
    
    let day, month, year;
    
    // Intentar parsear fecha
    for (const format of dateFormats) {
      const match = fecha.match(format);
      if (match) {
        // Para formato latinoamericano (DD/MM/YYYY)
        if (parseInt(match[1]) <= 31 && parseInt(match[2]) <= 12) {
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1; // Meses en JS son 0-based
          year = parseInt(match[3]);
        } else if (parseInt(match[2]) <= 31 && parseInt(match[1]) <= 12) {
          // Para formato americano (MM/DD/YYYY)
          month = parseInt(match[1]) - 1;
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        } else {
          // Para formato ISO (YYYY-MM-DD)
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          day = parseInt(match[3]);
        }
        break;
      }
    }
    
    if (day === undefined) {
      return new Date(NaN);
    }
    
    // Parsear hora
    let hours = 0, minutes = 0, seconds = 0;
    
    // Intentar diferentes formatos de hora
    const timeFormats = [
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/,  // HH:MM o HH:MM:SS
      /^(\d{1,2})\.(\d{2})(?:\.(\d{2}))?$/, // HH.MM o HH.MM.SS
      /^(\d{1,2})h(\d{2})(?:\'(\d{2}))?$/  // HHhMM o HHhMM'ss
    ];
    
    for (const format of timeFormats) {
      const match = hora.match(format);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        seconds = match[3] ? parseInt(match[3]) : 0;
        break;
      }
    }
    
    // Crear objeto Date
    dateObj = new Date(year, month, day, hours, minutes, seconds);
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return new Date(NaN);
    }
    
    return dateObj;
  }, []);

  // Parsear archivo de spots (CSV o Excel)
  const parseSpotsFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let data;
          
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            // Parsear CSV
            data = parseCSV(content);
          } else {
            // Parsear Excel
            const workbook = XLSX.read(content, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
            data = parseExcelData(jsonData);
          }
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  }, [parseCSV, parseExcelData]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        console.log('🔍 DEBUG: Fetching spot analysis data for user:', user?.id);
        
        // SIEMPRE usar datos simulados en desarrollo para evitar errores de API
        console.log('🔄 Using simulated data for development');
        const simulatedData = getSimulatedSpotAnalysisData();
        setAnalysisData(simulatedData);
        
      } catch (err) {
        console.error('Error in fetchAnalysisData:', err);
        // En cualquier error, usar datos simulados
        const simulatedData = getSimulatedSpotAnalysisData();
        setAnalysisData(simulatedData);
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutar una vez al montar el componente
    fetchAnalysisData();
  }, []);

  // Manejar subida de archivo de spots
  const handleSpotsFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor, sube un archivo Excel (.xlsx, .xls) o CSV');
      return;
    }

    // Validar tamaño máximo (5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > MAX_SIZE) {
      alert('El archivo excede el tamaño máximo permitido de 5MB');
      return;
    }

    setSpotsFile(file);
    
    try {
      const data = await parseSpotsFile(file);
      setSpotsData(data);
      console.log('📊 Datos de spots cargados:', data);
    } catch (error) {
      console.error('❌ Error al procesar archivo de spots:', error);
      alert(`Error al procesar el archivo: ${error.message}. Por favor, verifica el formato.`);
    }
  }, [parseSpotsFile]);

  // Manejar subida de video
  const handleVideoUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      alert('Por favor, sube un archivo de video válido');
      return;
    }

    setVideoFile(file);
    console.log('🎥 Video cargado:', file.name);
  }, []);

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

      {/* Sección de configuración de Analytics */}
      <div className="p-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración de Google Analytics</h2>
              <p className="text-gray-600">Selecciona la cuenta y propiedad para el análisis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selección de Cuenta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta de Analytics
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setSelectedProperty(''); // Reset property when account changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona una cuenta</option>
                {sortedAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.displayName || account.account_name || account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de Propiedad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propiedad de Analytics
              </label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                disabled={!selectedAccount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Selecciona una propiedad</option>
                {filteredProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.displayName || property.property_name || property.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Conecta tu cuenta de Google Analytics para acceder a los datos reales
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sección de subida de archivos */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sección principal: Archivo de Spots */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-500 rounded-lg mr-3">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Archivo de Spots</h3>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleSpotsFileUpload}
                className="hidden"
                id="spots-file-upload"
              />
              <label
                htmlFor="spots-file-upload"
                className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all bg-white"
              >
                <Upload className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  {spotsFile ? (
                    <span className="text-green-600 font-medium">{spotsFile.name}</span>
                  ) : (
                    'Selecciona archivo Excel o CSV'
                  )}
                </span>
              </label>
            </div>
            {spotsData.length > 0 && (
              <div className="mt-3 flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {spotsData.length} spots cargados exitosamente
              </div>
            )}
          </motion.div>

          {/* Sección opcional: Video */}
          <motion.div
            whileHover={{ y: -1 }}
            className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-500 rounded-lg mr-3">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Video del Spot (Opcional)</h3>
                <p className="text-sm text-gray-600">Sube el video para análisis visual adicional</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all bg-white"
              >
                <Video className="h-6 w-6 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">
                  {videoFile ? (
                    <span className="text-blue-600 font-medium">{videoFile.name}</span>
                  ) : (
                    'Selecciona video del spot'
                  )}
                </span>
              </label>
            </div>
          </motion.div>
        </div>

        {/* Sección de Video con IA - Nueva integración YouTube */}
        <div className="mb-6">
          <YouTubeVideoInput
            analysisResults={analysisData?.impactAnalysis?.analysisResults}
            isAnalyzing={loading}
            onAnalysisComplete={(data) => setYoutubeAnalysis(data)}
          />
        </div>

        {/* Componentes principales con NUEVO SISTEMA DE EXPORTACIÓN - SIN REFERENCIAS COMPARTIDAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default SpotAnalysis;