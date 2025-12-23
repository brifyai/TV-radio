import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para exportar imágenes - VERSIÓN DEFINITIVA
 * Soluciona completamente problemas de parpadeo, bucles infinitos y posicionamiento
 * @param {Object} targetRef - Referencia al elemento a exportar
 * @param {string} filename - Nombre del archivo de descarga
 * @param {string} className - Clases CSS adicionales
 */
const ImageExportButton = ({
  targetRef,
  filename = 'analisis-spot',
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const buttonRef = useRef();
  const isProcessingRef = useRef(false); // Prevenir doble clic y bucles

  const exportAsImage = useCallback(async () => {
    // Prevención de bucles infinitos - múltiples capas de protección
    if (!targetRef?.current || isProcessingRef.current || isExporting) {
      console.log('⚠️ Exportación bloqueada - ya en proceso o sin referencia válida');
      return;
    }

    isProcessingRef.current = true;
    setIsExporting(true);
    
    let element = null;
    let button = null;
    let originalElementStyle = {};
    let originalButtonStyle = {};
    let originalChildStyles = new Map(); // Para almacenar estilos originales de hijos

    try {
      element = targetRef.current;
      button = buttonRef.current;
      
      console.log('🚀 Iniciando exportación de imagen...');
      
      // GUARDAR ESTADO ORIGINAL CON VALORES PREDETERMINADOS SEGUROS
      originalElementStyle = {
        position: element.style.position || '',
        width: element.style.width || '',
        height: element.style.height || '',
        transform: element.style.transform || '',
        animation: element.style.animation || '',
        transition: element.style.transition || '',
        overflow: element.style.overflow || ''
      };
      
      // Guardar estilo original del botón con valor predeterminado
      originalButtonStyle = {
        display: button.style.display || 'inline-flex' // Valor por defecto para botones
      };
      
      // OCULTAR BOTÓN DE FORMA SEGURA - usar visibility en lugar de display
      button.style.visibility = 'hidden';
      button.style.opacity = '0';
      button.style.pointerEvents = 'none'; // Prevenir interacciones
      
      // Forzar layout fijo para exportación con valores seguros
      element.style.position = 'relative';
      element.style.width = '100%';
      element.style.height = `${Math.max(element.scrollHeight, 300)}px`; // Altura mínima segura
      element.style.transform = 'none';
      element.style.animation = 'none';
      element.style.transition = 'none';
      element.style.overflow = 'visible';
      
      // Resetear estilos en elementos hijos de forma segura
      const allElements = element.querySelectorAll('*');
      allElements.forEach(el => {
        // Guardar estilos originales solo si no se han guardado antes
        if (!originalChildStyles.has(el)) {
          originalChildStyles.set(el, {
            transform: el.style.transform || '',
            animation: el.style.animation || '',
            transition: el.style.transition || '',
            opacity: el.style.opacity || '',
            visibility: el.style.visibility || ''
          });
        }
        
        // Aplicar estilos seguros
        el.style.transform = 'none';
        el.style.animation = 'none';
        el.style.transition = 'none';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      });
      
      // Esperar renderizado completo con tiempo mínimo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('📸 Capturando imagen con html2canvas...');
      
      // CONFIGURACIÓN MEJORADA PARA EXPORTACIÓN
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false,
        imageTimeout: 10000, // Reducido para evitar timeouts
        ignoreElements: (el) => {
          // Ignorar este botón de exportación y elementos con clase 'no-export'
          return el === button || el.classList.contains('no-export');
        },
        onclone: (clonedDoc) => {
          // Asegurar que el botón clonado también esté oculto
          const clonedButton = clonedDoc.querySelector(`[data-export-button="${filename}"]`);
          if (clonedButton) {
            clonedButton.style.display = 'none';
            clonedButton.style.visibility = 'hidden';
          }
        }
      });
      
      console.log('✅ Imagen capturada exitosamente');
      
      // CREAR ENLACE DE DESCARGA DE FORMA SEGURA
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Forzar descarga con método seguro
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Pequeña pausa antes del clic
      await new Promise(resolve => setTimeout(resolve, 100));
      
      link.click();
      
      // Remover enlace después de un tiempo seguro
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
      }, 1000);
      
      console.log('✅ Descarga iniciada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al exportar imagen:', error);
      
      // Mostrar error solo si no es un error de cancelación
      if (!error.message?.includes('cancelled') && !error.message?.includes('aborted')) {
        alert('Error al exportar la imagen. Por favor, inténtalo nuevamente.');
      }
      
    } finally {
      // RESTAURACIÓN SEGURA DE ESTILOS - SIEMPRE se ejecuta
      console.log('🔄 Restaurando estilos originales...');
      
      try {
        // Restaurar estilo original del elemento principal
        if (element) {
          Object.keys(originalElementStyle).forEach(key => {
            if (originalElementStyle[key] === '') {
              element.style.removeProperty(key);
            } else {
              element.style[key] = originalElementStyle[key];
            }
          });
        }
        
        // Restaurar estilos de hijos
        originalChildStyles.forEach((styles, el) => {
          if (el && el.style) {
            Object.keys(styles).forEach(key => {
              if (styles[key] === '') {
                el.style.removeProperty(key);
              } else {
                el.style[key] = styles[key];
              }
            });
          }
        });
        
        // Restaurar botón de forma segura
        if (button) {
          // Remover estilos de ocultación
          button.style.removeProperty('visibility');
          button.style.removeProperty('opacity');
          button.style.removeProperty('pointer-events');
          
          // Restaurar display original
          if (originalButtonStyle.display === '') {
            button.style.removeProperty('display');
          } else {
            button.style.display = originalButtonStyle.display;
          }
        }
        
        console.log('✅ Estilos restaurados exitosamente');
        
      } catch (restoreError) {
        console.error('❌ Error al restaurar estilos:', restoreError);
        // En caso de error crítico, forzar restauración manual
        if (button) {
          button.style.display = 'inline-flex';
          button.style.visibility = 'visible';
          button.style.opacity = '1';
        }
      }
      
      // Liberar referencias y resetear estado
      isProcessingRef.current = false;
      setIsExporting(false);
      
      // Limpiar referencias
      element = null;
      button = null;
      originalChildStyles.clear();
    }
  }, [targetRef, filename, isExporting]);

  return (
    <button
      ref={buttonRef}
      onClick={exportAsImage}
      disabled={isExporting || isProcessingRef.current}
      className={`
        inline-flex items-center justify-center
        px-3 py-1.5 bg-blue-600 text-white rounded-md
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:opacity-70 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        ${isExporting ? 'animate-pulse' : ''}
        ${className}
      `}
      title={isExporting ? "Exportando imagen..." : "Exportar como imagen en alta calidad"}
      data-export-button={filename} // Identificador único para el botón
      style={{
        willChange: 'transform', // Optimización de rendimiento
        contain: 'layout style' // Contención de layout para mejor rendimiento
      }}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </>
      )}
    </button>
  );
};

export default ImageExportButton;