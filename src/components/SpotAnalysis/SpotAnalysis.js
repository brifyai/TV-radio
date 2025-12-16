import React, { useState, useCallback } from 'react';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { generateAIAnalysis, generateBatchAIAnalysis } from '../../services/aiAnalysisService';
import * as XLSX from 'xlsx';
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
  Brain
} from 'lucide-react';

const SpotAnalysis = () => {
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

  // Parsear CSV mejorado - SOLO LEE fecha_aparicion y hora_megatime
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
    const fechaIndex = headers.findIndex(h => h === 'fecha_aparicion');
    const horaIndex = headers.findIndex(h => h === 'hora_megatime');
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha_aparicion" y "hora_megatime"');
    }
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(delimiter).map(v => v.trim());
      
      // Solo extraer las columnas necesarias
      return {
        fecha_aparicion: values[fechaIndex] || '',
        hora_megatime: values[horaIndex] || ''
      };
    }).filter(spot => spot.fecha_aparicion || spot.hora_megatime); // Filtrar filas vacías
  }, []);

  // Parsear datos de Excel - SOLO LEE fecha_aparicion y hora_megatime
  const parseExcelData = useCallback((jsonData) => {
    if (jsonData.length === 0) return [];
    
    // Validar máximo 100 líneas de datos (encabezado + 100 datos)
    if (jsonData.length > 101) {
      throw new Error('El archivo excede el límite máximo de 100 líneas de datos');
    }
    
    // Primera fila como headers
    const headers = jsonData[0].map(h => (h || '').toString().toLowerCase());
    const fechaIndex = headers.findIndex(h => h === 'fecha_aparicion');
    const horaIndex = headers.findIndex(h => h === 'hora_megatime');
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha_aparicion" y "hora_megatime"');
    }
    
    return jsonData.slice(1).map((row, index) => {
      // Solo extraer las columnas necesarias
      return {
        fecha_aparicion: row[fechaIndex] || '',
        hora_megatime: row[horaIndex] || ''
      };
    }).filter(spot => spot.fecha_aparicion || spot.hora_megatime); // Filtrar filas vacías
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
          day = parseInt(match[2]);
          month = parseInt(match[1]) - 1;
          year = parseInt(match[3]);
        } else {
          // Para formato ISO (YYYY/MM/DD)
          day = parseInt(match[3]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[1]);
        }
        break;
      }
    }
    
    // Si encontramos una fecha válida
    if (day !== undefined && month !== undefined && year !== undefined) {
      // Parsear hora
      const timeMatch = hora.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!timeMatch) {
        return new Date(NaN);
      }
      
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseInt(timeMatch[3] || 0);
      
      return new Date(year, month, day, hours, minutes, seconds, 0);
    }
    
    // CASO 3: Si no se pudo parsear, intentar como fecha directa de JavaScript
    const directDate = new Date(fecha + ' ' + hora);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }
    
    // CASO 4: Si todo falla, intentar solo con la fecha
    const dateOnly = new Date(fecha);
    if (!isNaN(dateOnly.getTime())) {
      return dateOnly;
    }
    
    return new Date(NaN);
  }, []);

  // Parsear archivo de spots (Excel/CSV) - CONVERTIDO A useCallback
  const parseSpotsFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let spots = [];
          
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            const content = e.target.result;
            spots = parseCSV(content);
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Parsear Excel con XLSX
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            spots = parseExcelData(jsonData);
          } else {
            reject(new Error('Formato de archivo no soportado'));
            return;
          }
          
          // Validar y formatear datos - SOLO USAR fecha_aparicion y hora_megatime
          const formattedSpots = spots.map((spot, index) => {
            // Parsear fecha y hora con múltiples formatos
            const dateTime = parseDateTimeFlexible(spot.fecha_aparicion, spot.hora_megatime);
           
            return {
              id: index + 1,
              fecha: spot.fecha_aparicion,
              hora: spot.hora_megatime,
              nombre: `Spot ${index + 1}`, // Nombre por defecto ya que no tenemos este dato
              duracion: 30, // Default 30 segundos ya que no tenemos este dato
              canal: 'TV', // Default TV ya que no tenemos este dato
              dateTime: dateTime, // Objeto Date para análisis
              valid: !isNaN(dateTime.getTime())
            };
          }).filter(spot => spot.valid && spot.fecha && spot.hora); // Filtrar spots válidos
          
          console.log(`✅ Se parsearon ${formattedSpots.length} spots válidos de ${spots.length} totales`);
          resolve(formattedSpots);
        } catch (error) {
          console.error('❌ Error parseando archivo:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    });
  }, [parseDateTimeFlexible, parseCSV, parseExcelData]);

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

  // Parsear fecha y hora (mantener para compatibilidad) - CONVERTIDO A useCallback
  const parseDateTime = useCallback((fecha, hora) => {
    return parseDateTimeFlexible(fecha, hora);
  }, [parseDateTimeFlexible]);

  // Formatear fecha para Google Analytics - CONVERTIDO A useCallback
  const formatGADate = useCallback((date) => {
    return date.toISOString().split('T')[0];
  }, []);

  // Procesar datos de Analytics - CONVERTIDO A useCallback
  const processAnalyticsData = useCallback((data) => {
    if (!data || !data.rows || data.rows.length === 0) {
      return { activeUsers: 0, sessions: 0, pageviews: 0 };
    }

    const totals = data.rows.reduce((acc, row) => {
      return {
        activeUsers: acc.activeUsers + (parseFloat(row.metricValues?.[0]?.value) || 0),
        sessions: acc.sessions + (parseFloat(row.metricValues?.[1]?.value) || 0),
        pageviews: acc.pageviews + (parseFloat(row.metricValues?.[2]?.value) || 0)
      };
    }, { activeUsers: 0, sessions: 0, pageviews: 0 });

    return totals;
  }, []);

  // Calcular impacto - CONVERTIDO A useCallback
  const calculateImpact = useCallback((spot, previousDay, previousWeek) => {
    const impact = {};
    
    ['activeUsers', 'sessions', 'pageviews'].forEach(metric => {
      const spotValue = spot[metric] || 0;
      const prevDayValue = previousDay[metric] || 0;
      const prevWeekValue = previousWeek[metric] || 0;
      
      const avgBaseline = (prevDayValue + prevWeekValue) / 2;
      const increase = spotValue - avgBaseline;
      const percentageChange = avgBaseline > 0 ? (increase / avgBaseline) * 100 : 0;
      
      impact[metric] = {
        value: spotValue,
        baseline: avgBaseline,
        increase: increase,
        percentageChange: percentageChange,
        significant: Math.abs(percentageChange) > 10 // Considerar significativo si > 10%
      };
    });
    
    return impact;
  }, []);

  // Analizar impacto de un spot específico - MOVIDO ANTES Y CONVERTIDO A useCallback
  const analyzeSpotImpact = useCallback(async (spot, propertyId) => {
    // Parsear fecha y hora del spot
    const spotDateTime = parseDateTime(spot.fecha, spot.hora);
    
    // Obtener datos de Analytics para diferentes períodos
    const periods = {
      spot: {
        start: new Date(spotDateTime),
        end: new Date(spotDateTime.getTime() + (spot.duracion || 30) * 1000)
      },
      previousDay: {
        start: new Date(spotDateTime.getTime() - 24 * 60 * 60 * 1000),
        end: new Date(spotDateTime.getTime() - 24 * 60 * 60 * 1000 + (spot.duracion || 30) * 1000)
      },
      previousWeek: {
        start: new Date(spotDateTime.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(spotDateTime.getTime() - 7 * 24 * 60 * 60 * 1000 + (spot.duracion || 30) * 1000)
      }
    };

    // Obtener métricas para cada período
    const metrics = ['activeUsers', 'sessions', 'pageviews'];
    const dimensions = ['minute'];
    
    const results = {};
    
    for (const [periodName, period] of Object.entries(periods)) {
      try {
        const data = await getAnalyticsData(
          propertyId,
          metrics,
          dimensions,
          {
            startDate: formatGADate(period.start),
            endDate: formatGADate(period.end)
          }
        );
        
        results[periodName] = processAnalyticsData(data);
      } catch (error) {
        console.warn(`⚠️ Error obteniendo datos para ${periodName}:`, error);
        results[periodName] = { activeUsers: 0, sessions: 0, pageviews: 0 };
      }
    }

    // Calcular impacto
    const impact = calculateImpact(results.spot, results.previousDay, results.previousWeek);
    
    return {
      spot: {
        ...spot,
        dateTime: spotDateTime
      },
      metrics: results,
      impact
    };
  }, [getAnalyticsData, formatGADate, processAnalyticsData, calculateImpact, parseDateTime]);

  // Generar análisis de IA automáticamente
  const generateAutomaticAIAnalysis = useCallback(async (results) => {
    console.log('🤖 Iniciando análisis automático de IA...');
    
    try {
      // Generar análisis batch general
      const batchAnalysis = await generateBatchAIAnalysis(results);
      setBatchAIAnalysis(batchAnalysis);
      console.log('✅ Análisis IA general completado');
      
      // Generar análisis individual para cada spot
      const aiResults = {};
      for (let i = 0; i < results.length; i++) {
        try {
          const spotAnalysis = await generateAIAnalysis(results[i]);
          aiResults[i] = spotAnalysis;
          console.log(`✅ Análisis IA para spot ${i + 1} completado`);
          
          // Pausa entre análisis individuales para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`⚠️ Error en análisis IA para spot ${i + 1}:`, error);
          aiResults[i] = {
            insights: ['Error al generar análisis de IA'],
            recommendations: ['Inténtalo nuevamente'],
            summary: 'Error en análisis de IA'
          };
        }
      }
      
      setAiAnalysis(aiResults);
      console.log('🎉 Análisis automático de IA completado');
      
    } catch (error) {
      console.error('❌ Error en análisis automático de IA:', error);
      // No mostrar error al usuario, solo loggear
    }
  }, []);

  // Realizar análisis de impacto
  const performAnalysis = useCallback(async () => {
    if (!selectedProperty || spotsData.length === 0) {
      alert('Por favor, selecciona una propiedad y carga los datos de spots');
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress(0);
    setAiAnalysis({});
    setBatchAIAnalysis(null);

    try {
      const results = [];
      
      for (let i = 0; i < spotsData.length; i++) {
        const spot = spotsData[i];
        setAnalysisProgress(Math.round((i / spotsData.length) * 100));
        
        // Analizar cada spot
        const spotResult = await analyzeSpotImpact(spot, selectedProperty);
        results.push(spotResult);
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setAnalysisResults(results);
      console.log('📈 Análisis completado:', results);
      
      // Ejecutar análisis de IA automáticamente después del análisis de spots
      await generateAutomaticAIAnalysis(results);
      
    } catch (error) {
      console.error('❌ Error en el análisis:', error);
      alert('Error al realizar el análisis. Por favor, inténtalo nuevamente.');
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [spotsData, selectedProperty, analyzeSpotImpact, generateAutomaticAIAnalysis]);

  // Exportar resultados
  const exportResults = () => {
    if (!analysisResults) return;
    
    const csv = [
      ['Spot', 'Fecha', 'Hora', 'Usuarios Activos', 'Sesiones', 'Vistas de Página', 'Impacto Usuarios', 'Impacto Sesiones', 'Impacto Vistas'],
      ...analysisResults.map(result => [
        result.spot.nombre,
        result.spot.fecha,
        result.spot.hora,
        result.metrics.spot.activeUsers,
        result.metrics.spot.sessions,
        result.metrics.spot.pageviews,
        `${result.impact.activeUsers.percentageChange.toFixed(1)}%`,
        `${result.impact.sessions.percentageChange.toFixed(1)}%`,
        `${result.impact.pageviews.percentageChange.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis_spots_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Análisis de Impacto de Spots TV
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Mide el impacto de los spots de televisión en las visitas a tu sitio web
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportResults}
              disabled={!analysisResults}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={performAnalysis}
              disabled={analyzing || !selectedProperty || spotsData.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              {analyzing ? 'Analizando...' : 'Analizar Impacto'}
            </button>
          </div>
        </div>
      </div>

      {/* Conexión a Analytics */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Conexión requerida
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Conecta tu cuenta de Google Analytics para analizar el impacto de los spots.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuración */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración del Análisis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selección de cuenta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta de Analytics
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setSelectedProperty(''); // Resetear propiedad al cambiar cuenta
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!isConnected}
            >
              <option value="">Selecciona una cuenta...</option>
              {sortedAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.displayName || account.account_name || account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de propiedad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propiedad de Analytics
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!isConnected || !selectedAccount}
            >
              <option value="">
                {selectedAccount ? 'Selecciona una propiedad...' : 'Primero selecciona una cuenta'}
              </option>
              {filteredProperties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.displayName || property.property_name || property.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subida de archivo de spots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de Spots (Excel/CSV)
            </label>
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
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              >
                <Upload className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {spotsFile ? spotsFile.name : 'Selecciona archivo Excel o CSV'}
                </span>
              </label>
            </div>
            {spotsData.length > 0 && (
              <p className="mt-2 text-sm text-green-600">
                ✓ {spotsData.length} spots cargados
              </p>
            )}
          </div>
        </div>

        {/* Subida de video (opcional) */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video del Spot (Opcional)
          </label>
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
              className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
            >
              <Video className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {videoFile ? videoFile.name : 'Selecciona video del spot'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Progreso del análisis */}
      {analyzing && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Analizando Impacto</h3>
            <span className="text-sm text-gray-600">{analysisProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Analizando spot {Math.ceil((analysisProgress / 100) * spotsData.length)} de {spotsData.length}...
          </p>
        </div>
      )}

      {/* Resultados del análisis */}
      {analysisResults && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Resultados del Análisis</h2>
              <p className="text-sm text-gray-600">Análisis automático con IA incluido</p>
            </div>
          </div>

          {/* Análisis de IA General */}
          {batchAIAnalysis && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center mb-3">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-purple-900">Análisis Inteligente General</h3>
              </div>
              <p className="text-sm text-purple-800 mb-3">{batchAIAnalysis.summary}</p>
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-medium text-purple-700 mb-1">Insights Clave:</h4>
                  <ul className="text-xs text-purple-700 list-disc list-inside">
                    {batchAIAnalysis.insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-purple-700 mb-1">Recomendaciones:</h4>
                  <ul className="text-xs text-purple-700 list-disc list-inside">
                    {batchAIAnalysis.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {analysisResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{result.spot.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      {result.spot.dateTime.toLocaleDateString('es-CL')} {result.spot.dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} - {result.spot.canal}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.impact.activeUsers.significant ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Impacto Detectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Sin Impacto Significativo
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Usuarios Activos */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Usuarios</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.metrics.spot.activeUsers}
                    </p>
                    <p className={`text-xs ${result.impact.activeUsers.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.activeUsers.percentageChange >= 0 ? '+' : ''}{result.impact.activeUsers.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                  
                  {/* Sesiones */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MousePointer className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Sesiones</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.metrics.spot.sessions}
                    </p>
                    <p className={`text-xs ${result.impact.sessions.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.sessions.percentageChange >= 0 ? '+' : ''}{result.impact.sessions.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                  
                  {/* Vistas de Página */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Vistas</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.metrics.spot.pageviews}
                    </p>
                    <p className={`text-xs ${result.impact.pageviews.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.pageviews.percentageChange >= 0 ? '+' : ''}{result.impact.pageviews.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Análisis de IA para este spot */}
                {aiAnalysis[index] && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Brain className="h-4 w-4 text-purple-600 mr-2" />
                      <h4 className="text-sm font-medium text-purple-900">Análisis Inteligente</h4>
                    </div>
                    <p className="text-xs text-purple-800 mb-2">{aiAnalysis[index].summary}</p>
                    <div className="space-y-1">
                      <div>
                        <h5 className="text-xs font-medium text-purple-700">Insights:</h5>
                        <ul className="text-xs text-purple-700 list-disc list-inside">
                          {aiAnalysis[index].insights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-purple-700">Recomendaciones:</h5>
                        <ul className="text-xs text-purple-700 list-disc list-inside">
                          {aiAnalysis[index].recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotAnalysis;