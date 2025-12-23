import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para exportar imágenes - VERSIÓN ULTRA-SIMPLIFICADA
 * Elimina TODO el sistema complejo que causaba problemas de posicionamiento
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
    // Prevención de bucles infinitos
    if (!targetRef?.current || isProcessingRef.current || isExporting) {
      console.log('⚠️ Exportación bloqueada - ya en proceso o sin referencia válida');
      return;
    }

    isProcessingRef.current = true;
    setIsExporting(true);
    
    let element = null;
    let button = null;

    try {
      element = targetRef.current;
      button = buttonRef.current;
      
      console.log('🚀 Iniciando exportación de imagen...');
      
      // OCULTAR BOTÓN - MÉTODO MÁS SIMPLE Y SEGURO
      if (button) {
        button.style.visibility = 'hidden';
      }
      
      // Pequeña pausa para el renderizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('📸 Capturando imagen con html2canvas...');
      
      // CONFIGURACIÓN BÁSICA - sin manipulación de estilos compleja
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 10000,
        ignoreElements: (el) => {
          // Ignorar solo este botón de exportación
          return el === button;
        }
      });
      
      console.log('✅ Imagen capturada exitosamente');
      
      // CREAR ENLACE DE DESCARGA
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Forzar descarga
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Descarga iniciada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al exportar imagen:', error);
      alert('Error al exportar la imagen. Por favor, inténtalo nuevamente.');
    } finally {
      // RESTAURACIÓN ULTRA-SIMPLE - solo restaurar visibility
      if (button) {
        button.style.visibility = 'visible';
      }
      
      // Liberar estado
      isProcessingRef.current = false;
      setIsExporting(false);
    }
  }, [targetRef, filename]);

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
        ${isExporting ? 'opacity-70' : ''}
        ${className}
      `}
      title={isExporting ? "Exportando imagen..." : "Exportar como imagen en alta calidad"}
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