import PptxGenJS from 'pptxgenjs';

class PPTXExportService {
  constructor() {
    this.pptx = new PptxGenJS();
  }

  async generateSpotAnalysisPresentation(analysisData) {
    try {
      // Configuración inicial de la presentación
      this.pptx.author = "TV-Radio Analytics";
      this.pptx.company = "BrifyAI";
      this.pptx.subject = "Análisis de Spots TV vs Tráfico Web";
      this.pptx.title = `Análisis Spot TV - ${new Date().toLocaleDateString()}`;

      // Slide 1: Portada
      this.addTitleSlide(analysisData);

      // Slide 2: Resumen Ejecutivo
      this.addExecutiveSummarySlide(analysisData);

      // Slide 3: Métricas de Correlación
      this.addCorrelationMetricsSlide(analysisData);

      // Slide 4: Análisis de Video (si disponible)
      if (analysisData.videoAnalysis) {
        this.addVideoAnalysisSlide(analysisData);
      }

      // Slide 5: Recomendaciones
      this.addRecommendationsSlide(analysisData);

      // Slide 6: Análisis Temporal
      this.addTemporalAnalysisSlide(analysisData);

      // Slide 7: Conclusiones
      this.addConclusionsSlide(analysisData);

      return this.pptx;
    } catch (error) {
      console.error('Error generando presentación PPTX:', error);
      throw error;
    }
  }

  addTitleSlide(analysisData) {
    const slide = this.pptx.addSlide();
    
    // Título principal
    slide.addText('Análisis de Spot TV vs Tráfico Web', {
      x: 1, y: 2, w: 8, h: 1.5,
      fontSize: 32, bold: true, color: '1f2937',
      align: 'center'
    });

    // Subtítulo con fecha
    slide.addText(`Generado el ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })}`, {
      x: 1, y: 3.8, w: 8, h: 0.5,
      fontSize: 16, color: '6b7280',
      align: 'center'
    });

    // Información del spot
    if (analysisData.spotData) {
      const spot = analysisData.spotData;
      slide.addText(`Spot: ${spot.titulo_programa || 'N/A'}`, {
        x: 1, y: 4.8, w: 8, h: 0.5,
        fontSize: 18, bold: true, color: '374151',
        align: 'center'
      });

      slide.addText(`Canal: ${spot.canal || 'N/A'} | Hora: ${spot.hora || 'N/A'}`, {
        x: 1, y: 5.4, w: 8, h: 0.5,
        fontSize: 14, color: '6b7280',
        align: 'center'
      });
    }

    // Logo/Branding
    slide.addText('Powered by BrifyAI', {
      x: 1, y: 6.5, w: 8, h: 0.5,
      fontSize: 12, color: '9ca3af',
      align: 'center'
    });
  }

  addExecutiveSummarySlide(analysisData) {
    const slide = this.pptx.addSlide();
    
    // Título
    slide.addText('Resumen Ejecutivo', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 28, bold: true, color: '1f2937'
    });

    let yPos = 1.5;

    // Datos del análisis
    if (analysisData.analysisResults && analysisData.analysisResults.length > 0) {
      const result = analysisData.analysisResults[0];
      const spotHour = result.spot?.dateTime?.getHours() || result.spot?.hora || 'N/A';
      const impact = result.impact?.activeUsers?.percentageChange || 0;

      slide.addText('📊 Resultados Principales:', {
        x: 0.5, y: yPos, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });
      yPos += 0.5;

      slide.addText(`• Horario de transmisión: ${spotHour}:00`, {
        x: 0.7, y: yPos, w: 8.5, h: 0.3,
        fontSize: 12, color: '4b5563'
      });
      yPos += 0.4;

      slide.addText(`• Impacto en usuarios activos: ${impact >= 0 ? '+' : ''}${impact.toFixed(1)}%`, {
        x: 0.7, y: yPos, w: 8.5, h: 0.3,
        fontSize: 12, color: impact > 0 ? '059669' : impact < 0 ? 'dc2626' : '6b7280'
      });
      yPos += 0.4;

      // Clasificación del impacto
      let classification = '';
      if (impact > 20) {
        classification = '✅ CORRELACIÓN FUERTE - El spot generó un impacto significativo en el tráfico web';
      } else if (impact > 10) {
        classification = '⚠️ CORRELACIÓN MODERADA - El spot tuvo impacto positivo pero mejorable';
      } else if (impact < -10) {
        classification = '❌ CORRELACIÓN NEGATIVA - El spot redujo el tráfico web';
      } else {
        classification = '🔄 CORRELACIÓN DÉBIL - Impacto mínimo en el tráfico web';
      }

      slide.addText(classification, {
        x: 0.7, y: yPos, w: 8.5, h: 0.5,
        fontSize: 12, color: '374151'
      });
      yPos += 0.7;
    }

    // Análisis de video si está disponible
    if (analysisData.videoAnalysis && analysisData.videoAnalysis.analisis_efectividad) {
      slide.addText('🎬 Análisis de Contenido:', {
        x: 0.5, y: yPos, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });
      yPos += 0.5;

      const efectividad = analysisData.videoAnalysis.analisis_efectividad;
      const clarity = parseFloat(efectividad.claridad_mensaje || 0);
      const engagement = parseFloat(efectividad.engagement_visual || 0);
      const memorability = parseFloat(efectividad.memorabilidad || 0);

      slide.addText(`• Claridad del mensaje: ${clarity.toFixed(1)}/10`, {
        x: 0.7, y: yPos, w: 8.5, h: 0.3,
        fontSize: 12, color: '4b5563'
      });
      yPos += 0.4;

      slide.addText(`• Engagement visual: ${engagement.toFixed(1)}/10`, {
        x: 0.7, y: yPos, w: 8.5, h: 0.3,
        fontSize: 12, color: '4b5563'
      });
      yPos += 0.4;

      slide.addText(`• Memorabilidad: ${memorability.toFixed(1)}/10`, {
        x: 0.7, y: yPos, w: 8.5, h: 0.3,
        fontSize: 12, color: '4b5563'
      });
    }
  }

  addCorrelationMetricsSlide(analysisData) {
    const slide = this.pptx.addSlide();
    
    // Título
    slide.addText('Métricas de Correlación TV-Web', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 28, bold: true, color: '1f2937'
    });

    if (analysisData.analysisResults && analysisData.analysisResults.length > 0) {
      const result = analysisData.analysisResults[0];
      
      // Tabla de métricas
      const metrics = [
        ['Métrica', 'Durante Spot', 'Referencia', 'Cambio %'],
        ['Usuarios Activos', 
         result.metrics?.spot?.activeUsers || 'N/A',
         result.metrics?.reference?.activeUsers || 'N/A',
         `${result.impact?.activeUsers?.percentageChange >= 0 ? '+' : ''}${result.impact?.activeUsers?.percentageChange?.toFixed(1) || '0'}%`],
        ['Sesiones',
         result.metrics?.spot?.sessions || 'N/A', 
         result.metrics?.reference?.sessions || 'N/A',
         `${result.impact?.sessions?.percentageChange >= 0 ? '+' : ''}${result.impact?.sessions?.percentageChange?.toFixed(1) || '0'}%`],
        ['Vistas de Página',
         result.metrics?.spot?.pageviews || 'N/A',
         result.metrics?.reference?.pageviews || 'N/A', 
         `${result.impact?.pageviews?.percentageChange >= 0 ? '+' : ''}${result.impact?.pageviews?.percentageChange?.toFixed(1) || '0'}%`]
      ];

      slide.addTable(metrics, {
        x: 0.5, y: 1.8, w: 9, h: 3,
        fontSize: 12,
        border: { type: 'solid', color: 'e5e7eb', pt: 1 },
        fill: 'f9fafb',
        colW: [2.5, 2, 2, 2.5],
        valign: 'middle',
        fontFace: 'Arial'
      });

      // Interpretación
      slide.addText('📈 Interpretación de Resultados:', {
        x: 0.5, y: 5.2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });

      const usersImpact = result.impact?.activeUsers?.percentageChange || 0;
      let interpretation = '';
      
      if (usersImpact > 15) {
        interpretation = '✅ Vinculación Directa Confirmada: El spot generó un aumento significativo (>15%) en el tráfico web durante su transmisión.';
      } else if (usersImpact > 10) {
        interpretation = '⚠️ Impacto Significativo: El spot tuvo un impacto positivo (>10%) pero no cumple los criterios de vinculación directa.';
      } else if (usersImpact < -10) {
        interpretation = '❌ Impacto Negativo: El spot redujo el tráfico web, sugiriendo problemas en el mensaje o timing.';
      } else {
        interpretation = '🔄 Impacto Mínimo: El spot no generó cambios significativos en el tráfico web.';
      }

      slide.addText(interpretation, {
        x: 0.7, y: 5.7, w: 8.5, h: 1,
        fontSize: 12, color: '4b5563',
        valign: 'top'
      });
    }
  }

  addVideoAnalysisSlide(analysisData) {
    const slide = this.pptx.addSlide();
    
    // Título
    slide.addText('Análisis de Contenido del Video', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 28, bold: true, color: '1f2937'
    });

    const videoAnalysis = analysisData.videoAnalysis;
    let yPos = 1.5;

    // Efectividad
    if (videoAnalysis.analisis_efectividad) {
      slide.addText('🎯 Evaluación de Efectividad:', {
        x: 0.5, y: yPos, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });
      yPos += 0.5;

      const efectividad = videoAnalysis.analisis_efectividad;
      Object.entries(efectividad).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          slide.addText(`• ${displayName}: ${parseFloat(value).toFixed(1)}/10`, {
            x: 0.7, y: yPos, w: 8.5, h: 0.3,
            fontSize: 12, color: '4b5563'
          });
          yPos += 0.4;
        }
      });
      yPos += 0.3;
    }

    // Contenido visual
    if (videoAnalysis.contenido_visual) {
      slide.addText('🎨 Contenido Visual:', {
        x: 0.5, y: yPos, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });
      yPos += 0.5;

      if (videoAnalysis.contenido_visual.escenas_principales) {
        slide.addText(`• Escenas principales: ${videoAnalysis.contenido_visual.escenas_principales.join(', ')}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.3,
          fontSize: 12, color: '4b5563'
        });
        yPos += 0.4;
      }

      if (videoAnalysis.contenido_visual.colores_dominantes) {
        slide.addText(`• Colores dominantes: ${videoAnalysis.contenido_visual.colores_dominantes.join(', ')}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.3,
          fontSize: 12, color: '4b5563'
        });
        yPos += 0.4;
      }
      yPos += 0.3;
    }

    // Mensaje de marketing
    if (videoAnalysis.mensaje_marketing) {
      slide.addText('💬 Mensaje de Marketing:', {
        x: 0.5, y: yPos, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });
      yPos += 0.5;

      if (videoAnalysis.mensaje_marketing.call_to_action) {
        slide.addText(`• Call-to-Action: ${videoAnalysis.mensaje_marketing.call_to_action}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.3,
          fontSize: 12, color: '4b5563'
        });
        yPos += 0.4;
      }

      if (videoAnalysis.mensaje_marketing.propuesta_valor) {
        slide.addText(`• Propuesta de valor: ${videoAnalysis.mensaje_marketing.propuesta_valor}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.3,
          fontSize: 12, color: '4b5563'
        });
      }
    }
  }

  addRecommendationsSlide(analysisData) {
    const slide = this.pptx.addSlide();
    
    // Título
    slide.addText('Recomendaciones Estratégicas', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 28, bold: true, color: '1f2937'
    });

    let yPos = 1.5;

    // Generar recomendaciones basadas en los datos
    const recommendations = this.generateRecommendationsFromData(analysisData);

    recommendations.forEach((rec, index) => {
      // Categoría y prioridad
      slide.addText(`${rec.category} - Prioridad: ${rec.priority}`, {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 14, bold: true, color: this.getPriorityColor(rec.priority)
      });
      yPos += 0.4;

      // Texto de la recomendación
      slide.addText(rec.text, {
        x: 0.7, y: yPos, w: 8.5, h: 0.4,
        fontSize: 12, color: '374151'
      });
      yPos += 0.5;

      // Justificación
      slide.addText(rec.why, {
        x: 0.7, y: yPos, w: 8.5, h: 0.6,
        fontSize: 11, color: '6b7280',
        valign: 'top'
      });
      yPos += 0.8;

      if (yPos > 6) {
        yPos = 1.5;
        this.pptx.addSlide();
      }
    });
  }

  addTemporalAnalysisSlide(analysisData) {
    const slide = this.pptx.addSlide();
    
    // Título
    slide.addText('Análisis Temporal', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 28, bold: true, color: '1f2937'
    });

    if (analysisData.analysisResults && analysisData.analysisResults.length > 0) {
      const result = analysisData.analysisResults[0];
      const spotHour = result.spot?.dateTime?.getHours() || result.spot?.hora || 'N/A';
      
      slide.addText('⏰ Análisis de Timing:', {
        x: 0.5, y: 1.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });

      const isPrimeTime = spotHour >= 19 && spotHour <= 23;
      const isMorning = spotHour >= 6 && spotHour < 12;
      const isAfternoon = spotHour >= 12 && spotHour < 19;

      let timingAnalysis = `Horario de transmisión: ${spotHour}:00\n`;
      timingAnalysis += `Clasificación: ${isPrimeTime ? 'Prime Time (ÓPTIMO)' : isMorning ? 'Mañana (MEDIO)' : isAfternoon ? 'Tarde (MEJORABLE)' : 'Noche (BAJO)'}\n\n`;
      
      timingAnalysis += 'Horarios recomendados para maximizar impacto:\n';
      timingAnalysis += '• 19:00-23:00 (Prime Time) - Máxima audiencia\n';
      timingAnalysis += '• 12:00-14:00 (Almuerzo) - Audiencia media-alta\n';
      timingAnalysis += '• 20:00-22:00 (Nocturno) - Audiencia comprometida';

      slide.addText(timingAnalysis, {
        x: 0.7, y: 2, w: 8.5, h: 3,
        fontSize: 12, color: '4b5563',
        valign: 'top'
      });

      // Patrones de tráfico
      slide.addText('📊 Patrones de Tráfico Web:', {
        x: 0.5, y: 5.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });

      slide.addText('Los picos de tráfico web típicamente ocurren durante horarios de mayor actividad online, que no siempre coinciden con los horarios de mayor audiencia televisiva.', {
        x: 0.7, y: 6, w: 8.5, h: 1,
        fontSize: 12, color: '6b7280',
        valign: 'top'
      });
    }
  }

  addConclusionsSlide(analysisData) {
    const slide = this.pptx.addSlide();
    
    // Título
    slide.addText('Conclusiones y Próximos Pasos', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 28, bold: true, color: '1f2937'
    });

    let yPos = 1.5;

    // Conclusiones basadas en los datos
    if (analysisData.analysisResults && analysisData.analysisResults.length > 0) {
      const result = analysisData.analysisResults[0];
      const impact = result.impact?.activeUsers?.percentageChange || 0;

      slide.addText('🎯 Conclusiones Principales:', {
        x: 0.5, y: yPos, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '374151'
      });
      yPos += 0.5;

      let conclusions = [];
      
      if (impact > 20) {
        conclusions = [
          '✅ El spot demostró alta efectividad para generar tráfico web',
          '✅ La correlación TV-Web es fuerte y significativa',
          '✅ El timing y contenido fueron apropiados',
          '📈 Considerar replicar esta estrategia en futuros spots'
        ];
      } else if (impact > 10) {
        conclusions = [
          '⚠️ El spot tuvo impacto positivo pero mejorable',
          '📊 Existe correlación TV-Web moderada',
          '🎯 Oportunidades de optimización identificadas',
          '🔄 Ajustar timing y contenido para maximizar impacto'
        ];
      } else if (impact < -10) {
        conclusions = [
          '❌ El spot no fue efectivo para generar tráfico web',
          '🚫 Se detectó correlación negativa TV-Web',
          '🔍 Revisar mensaje, timing y targeting',
          '⚡ Implementar cambios urgentes en la estrategia'
        ];
      } else {
        conclusions = [
          '🔄 El spot no generó cambios significativos',
          '📊 Correlación TV-Web débil o nula',
          '🎯 Múltiples oportunidades de mejora',
          '📈 Requiere optimización integral de la estrategia'
        ];
      }

      conclusions.forEach(conclusion => {
        slide.addText(conclusion, {
          x: 0.7, y: yPos, w: 8.5, h: 0.4,
          fontSize: 12, color: '4b5563'
        });
        yPos += 0.5;
      });

      yPos += 0.5;
    }

    // Próximos pasos
    slide.addText('🚀 Próximos Pasos:', {
      x: 0.5, y: yPos, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });
    yPos += 0.5;

    const nextSteps = [
      '1. Implementar las recomendaciones prioritarias',
      '2. Monitorear el próximo spot con estos insights',
      '3. A/B testing de diferentes horarios y contenidos',
      '4. Establecer métricas de seguimiento continuo',
      '5. Optimizar basado en datos reales de performance'
    ];

    nextSteps.forEach(step => {
      slide.addText(step, {
        x: 0.7, y: yPos, w: 8.5, h: 0.3,
        fontSize: 12, color: '4b5563'
      });
      yPos += 0.4;
    });
  }

  generateRecommendationsFromData(analysisData) {
    const recommendations = [];
    
    if (analysisData.analysisResults && analysisData.analysisResults.length > 0) {
      const result = analysisData.analysisResults[0];
      const impact = result.impact?.activeUsers?.percentageChange || 0;
      const spotHour = result.spot?.dateTime?.getHours() || result.spot?.hora || new Date().getHours();
      const isPrimeTime = spotHour >= 19 && spotHour <= 23;

      // Recomendación de timing
      recommendations.push({
        priority: 'Alta',
        category: 'Timing',
        text: 'Evaluar diferentes horarios de transmisión',
        why: `El spot fue transmitido a las ${spotHour}:00. ${isPrimeTime ? 'Horario óptimo (prime time).' : 'Probar horarios 19:00-23:00 para maximizar impacto.'}`
      });

      // Análisis causal
      if (impact > 20) {
        recommendations.push({
          priority: 'Media',
          category: 'Análisis de Éxito',
          text: 'El spot SÍ funcionó - Incremento significativo en tráfico',
          why: `Impacto medido: +${impact.toFixed(1)}%. El spot generó correlación positiva entre TV y tráfico web.`
        });
      } else if (impact < -10) {
        recommendations.push({
          priority: 'Alta',
          category: 'Análisis de Fracaso',
          text: 'El spot NO funcionó - Impacto negativo en tráfico',
          why: `Impacto medido: ${impact.toFixed(1)}%. El spot generó correlación negativa entre TV y tráfico web.`
        });
      } else {
        recommendations.push({
          priority: 'Media',
          category: 'Análisis Neutral',
          text: 'Spot con impacto mínimo - Oportunidad de mejora',
          why: `Impacto medido: ${impact.toFixed(1)}%. El spot no generó cambios significativos en el tráfico web.`
        });
      }
    }

    return recommendations;
  }

  getPriorityColor(priority) {
    switch (priority) {
      case 'Alta': return 'dc2626';
      case 'Media': return 'd97706';
      case 'Baja': return '059669';
      default: return '6b7280';
    }
  }

  async downloadPresentation(filename = 'analisis-spot-tv.xlsx') {
    try {
      await this.pptx.writeFile({ fileName: filename });
      return true;
    } catch (error) {
      console.error('Error descargando presentación:', error);
      throw error;
    }
  }
}

export default PPTXExportService;