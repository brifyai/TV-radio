// Servicio de exportación PPTX simplificado para navegador
// Genera un archivo HTML que se puede convertir a PPTX manualmente

class PPTXExportService {
  constructor() {
    this.analysisData = null;
  }

  async generateSpotAnalysisPresentation(analysisData) {
    try {
      this.analysisData = analysisData;
      return this.generateHTMLPresentation();
    } catch (error) {
      console.error('Error generando presentación:', error);
      throw error;
    }
  }

  generateHTMLPresentation() {
    const data = this.analysisData;
    if (!data || !data.analysisResults || data.analysisResults.length === 0) {
      throw new Error('No hay datos de análisis para exportar');
    }

    const result = data.analysisResults[0];
    const spot = result.spot;
    const impact = result.impact?.activeUsers?.percentageChange || 0;

    // Generar HTML de la presentación
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análisis de Spot TV - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .slide {
            background: white;
            margin: 20px 0;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            page-break-after: always;
            min-height: 600px;
        }
        .slide h1 {
            color: #1f2937;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .slide h2 {
            color: #374151;
            margin-top: 30px;
        }
        .metrics-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .metrics-table th, .metrics-table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
        }
        .metrics-table th {
            background-color: #f9fafb;
            font-weight: 600;
        }
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .neutral { color: #6b7280; }
        .impact-high { background: linear-gradient(90deg, #dcfce7, #bbf7d0); }
        .impact-medium { background: linear-gradient(90deg, #fef3c7, #fde68a); }
        .impact-low { background: linear-gradient(90deg, #fee2e2, #fecaca); }
        .recommendation {
            background: #f8fafc;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 10px 0;
        }
        .logo {
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            margin-top: 40px;
        }
        @media print {
            body { background: white; }
            .slide { box-shadow: none; margin: 0; }
        }
    </style>
</head>
<body>
    <!-- Slide 1: Portada -->
    <div class="slide">
        <h1 style="text-align: center; font-size: 2.5em; margin-top: 100px;">
            Análisis de Spot TV vs Tráfico Web
        </h1>
        <p style="text-align: center; font-size: 1.2em; color: #6b7280; margin-top: 20px;">
            Generado el ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })}
        </p>
        <div style="text-align: center; margin-top: 60px;">
            <h2 style="color: #374151;">${spot?.titulo_programa || spot?.nombre || 'Spot TV'}</h2>
            <p style="font-size: 1.1em; color: #6b7280;">
                Canal: ${spot?.canal || 'N/A'} | Hora: ${spot?.hora || 'N/A'}
            </p>
        </div>
        <div class="logo">
            Powered by BrifyAI
        </div>
    </div>

    <!-- Slide 2: Resumen Ejecutivo -->
    <div class="slide">
        <h1>Resumen Ejecutivo</h1>
        
        <h2>📊 Resultados Principales:</h2>
        <ul style="font-size: 1.1em; line-height: 1.6;">
            <li><strong>Horario de transmisión:</strong> ${result.spot?.dateTime?.getHours() || result.spot?.hora || 'N/A'}:00</li>
            <li><strong>Impacto en usuarios activos:</strong> <span class="${impact >= 0 ? 'positive' : 'negative'}">${impact >= 0 ? '+' : ''}${impact.toFixed(1)}%</span></li>
        </ul>

        <div class="recommendation">
            <h3>Clasificación del Impacto:</h3>
            <p><strong>${
              impact > 20 ? '✅ CORRELACIÓN FUERTE - El spot generó un impacto significativo en el tráfico web' :
              impact > 10 ? '⚠️ CORRELACIÓN MODERADA - El spot tuvo impacto positivo pero mejorable' :
              impact < -10 ? '❌ CORRELACIÓN NEGATIVA - El spot redujo el tráfico web' :
              '🔄 CORRELACIÓN DÉBIL - Impacto mínimo en el tráfico web'
            }</p>
        </div>

        ${data.videoAnalysis && data.videoAnalysis.analisis_efectividad ? `
        <h2>🎬 Análisis de Contenido:</h2>
        <ul>
            <li><strong>Claridad del mensaje:</strong> ${parseFloat(data.videoAnalysis.analisis_efectividad.claridad_mensaje || 0).toFixed(1)}/10</li>
            <li><strong>Engagement visual:</strong> ${parseFloat(data.videoAnalysis.analisis_efectividad.engagement_visual || 0).toFixed(1)}/10</li>
            <li><strong>Memorabilidad:</strong> ${parseFloat(data.videoAnalysis.analisis_efectividad.memorabilidad || 0).toFixed(1)}/10</li>
        </ul>
        ` : ''}
    </div>

    <!-- Slide 3: Métricas de Correlación -->
    <div class="slide">
        <h1>Métricas de Correlación TV-Web</h1>
        
        <table class="metrics-table">
            <thead>
                <tr>
                    <th>Métrica</th>
                    <th>Durante Spot</th>
                    <th>Referencia</th>
                    <th>Cambio %</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Usuarios Activos</strong></td>
                    <td>${result.metrics?.spot?.activeUsers || 'N/A'}</td>
                    <td>${result.metrics?.reference?.activeUsers || 'N/A'}</td>
                    <td class="${result.impact?.activeUsers?.percentageChange >= 0 ? 'positive' : 'negative'}">
                        ${result.impact?.activeUsers?.percentageChange >= 0 ? '+' : ''}${result.impact?.activeUsers?.percentageChange?.toFixed(1) || '0'}%
                    </td>
                </tr>
                <tr>
                    <td><strong>Sesiones</strong></td>
                    <td>${result.metrics?.spot?.sessions || 'N/A'}</td>
                    <td>${result.metrics?.reference?.sessions || 'N/A'}</td>
                    <td class="${result.impact?.sessions?.percentageChange >= 0 ? 'positive' : 'negative'}">
                        ${result.impact?.sessions?.percentageChange >= 0 ? '+' : ''}${result.impact?.sessions?.percentageChange?.toFixed(1) || '0'}%
                    </td>
                </tr>
                <tr>
                    <td><strong>Vistas de Página</strong></td>
                    <td>${result.metrics?.spot?.pageviews || 'N/A'}</td>
                    <td>${result.metrics?.reference?.pageviews || 'N/A'}</td>
                    <td class="${result.impact?.pageviews?.percentageChange >= 0 ? 'positive' : 'negative'}">
                        ${result.impact?.pageviews?.percentageChange >= 0 ? '+' : ''}${result.impact?.pageviews?.percentageChange?.toFixed(1) || '0'}%
                    </td>
                </tr>
            </tbody>
        </table>

        <h2>📈 Interpretación de Resultados:</h2>
        <div class="recommendation">
            <p><strong>${
              result.impact?.activeUsers?.percentageChange > 15 ? 
                '✅ Vinculación Directa Confirmada: El spot generó un aumento significativo (>15%) en el tráfico web durante su transmisión.' :
              result.impact?.activeUsers?.percentageChange > 10 ?
                '⚠️ Impacto Significativo: El spot tuvo un impacto positivo (>10%) pero no cumple los criterios de vinculación directa.' :
              result.impact?.activeUsers?.percentageChange < -10 ?
                '❌ Impacto Negativo: El spot redujo el tráfico web, sugiriendo problemas en el mensaje o timing.' :
                '🔄 Impacto Mínimo: El spot no generó cambios significativos en el tráfico web.'
            }</strong></p>
        </div>
    </div>

    <!-- Slide 4: Recomendaciones -->
    <div class="slide">
        <h1>Recomendaciones Estratégicas</h1>
        
        <div class="recommendation">
            <h3>Timing - Prioridad: Alta</h3>
            <p><strong>Evaluar diferentes horarios de transmisión</strong></p>
            <p>El spot fue transmitido a las ${result.spot?.dateTime?.getHours() || result.spot?.hora || new Date().getHours()}:00. 
            ${(result.spot?.dateTime?.getHours() || result.spot?.hora || new Date().getHours()) >= 19 && (result.spot?.dateTime?.getHours() || result.spot?.hora || new Date().getHours()) <= 23 ? 
              'Horario óptimo (prime time).' : 
              'Probar horarios 19:00-23:00 para maximizar impacto.'}</p>
        </div>

        <div class="recommendation">
            <h3>Análisis de Efectividad - Prioridad: ${impact > 20 ? 'Media' : impact < -10 ? 'Alta' : 'Media'}</h3>
            <p><strong>${
              impact > 20 ? 'El spot SÍ funcionó - Incremento significativo en tráfico' :
              impact < -10 ? 'El spot NO funcionó - Impacto negativo en tráfico' :
              'Spot con impacto mínimo - Oportunidad de mejora'
            }</strong></p>
            <p>Impacto medido: ${impact >= 0 ? '+' : ''}${impact.toFixed(1)}%. 
            ${
              impact > 20 ? 'El spot generó correlación positiva entre TV y tráfico web.' :
              impact < -10 ? 'El spot generó correlación negativa entre TV y tráfico web.' :
              'El spot no generó cambios significativos en el tráfico web.'
            }</p>
        </div>
    </div>

    <!-- Slide 5: Análisis Temporal -->
    <div class="slide">
        <h1>Análisis Temporal</h1>
        
        <h2>⏰ Análisis de Timing:</h2>
        <p><strong>Horario de transmisión:</strong> ${result.spot?.dateTime?.getHours() || result.spot?.hora || 'N/A'}:00</p>
        <p><strong>Clasificación:</strong> ${
          (result.spot?.dateTime?.getHours() || result.spot?.hora || 0) >= 19 && (result.spot?.dateTime?.getHours() || result.spot?.hora || 0) <= 23 ? 'Prime Time (ÓPTIMO)' :
          (result.spot?.dateTime?.getHours() || result.spot?.hora || 0) >= 6 && (result.spot?.dateTime?.getHours() || result.spot?.hora || 0) < 12 ? 'Mañana (MEDIO)' :
          (result.spot?.dateTime?.getHours() || result.spot?.hora || 0) >= 12 && (result.spot?.dateTime?.getHours() || result.spot?.hora || 0) < 19 ? 'Tarde (MEJORABLE)' : 'Noche (BAJO)'
        }</p>
        
        <h3>Horarios recomendados para maximizar impacto:</h3>
        <ul>
            <li>19:00-23:00 (Prime Time) - Máxima audiencia</li>
            <li>12:00-14:00 (Almuerzo) - Audiencia media-alta</li>
            <li>20:00-22:00 (Nocturno) - Audiencia comprometida</li>
        </ul>

        <h2>📊 Patrones de Tráfico Web:</h2>
        <p>Los picos de tráfico web típicamente ocurren durante horarios de mayor actividad online, que no siempre coinciden con los horarios de mayor audiencia televisiva.</p>
    </div>

    <!-- Slide 6: Conclusiones -->
    <div class="slide">
        <h1>Conclusiones y Próximos Pasos</h1>
        
        <h2>🎯 Conclusiones Principales:</h2>
        <ul style="font-size: 1.1em; line-height: 1.8;">
            ${
              impact > 20 ? `
                <li>✅ El spot demostró alta efectividad para generar tráfico web</li>
                <li>✅ La correlación TV-Web es fuerte y significativa</li>
                <li>✅ El timing y contenido fueron apropiados</li>
                <li>📈 Considerar replicar esta estrategia en futuros spots</li>
              ` : impact > 10 ? `
                <li>⚠️ El spot tuvo impacto positivo pero mejorable</li>
                <li>📊 Existe correlación TV-Web moderada</li>
                <li>🎯 Oportunidades de optimización identificadas</li>
                <li>🔄 Ajustar timing y contenido para maximizar impacto</li>
              ` : impact < -10 ? `
                <li>❌ El spot no fue efectivo para generar tráfico web</li>
                <li>🚫 Se detectó correlación negativa TV-Web</li>
                <li>🔍 Revisar mensaje, timing y targeting</li>
                <li>⚡ Implementar cambios urgentes en la estrategia</li>
              ` : `
                <li>🔄 El spot no generó cambios significativos</li>
                <li>📊 Correlación TV-Web débil o nula</li>
                <li>🎯 Múltiples oportunidades de mejora</li>
                <li>📈 Requiere optimización integral de la estrategia</li>
              `
            }
        </ul>

        <h2>🚀 Próximos Pasos:</h2>
        <ol style="font-size: 1.1em; line-height: 1.8;">
            <li>Implementar las recomendaciones prioritarias</li>
            <li>Monitorear el próximo spot con estos insights</li>
            <li>A/B testing de diferentes horarios y contenidos</li>
            <li>Establecer métricas de seguimiento continuo</li>
            <li>Optimizar basado en datos reales de performance</li>
        </ol>
    </div>
</body>
</html>
    `;

    return html;
  }

  async downloadPresentation(filename = 'analisis-spot-tv.html') {
    try {
      const htmlContent = this.generateHTMLPresentation();
      
      // Crear blob y descargar
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace('.pptx', '.html'); // Cambiar extensión a HTML
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error descargando presentación:', error);
      throw error;
    }
  }
}

export default PPTXExportService;