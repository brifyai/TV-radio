import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para exportar imágenes - VERSIÓN MEJORADA
 * Soluciona problemas de parpadeo y posicionamiento
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

  const exportAsImage = async () => {
    if (!targetRef?.current) {
      alert('No se puede capturar la imagen. Inténtalo nuevamente.');
      return;
    }

    setIsExporting(true);
    
    try {
      const element = targetRef.current;
      
      // Guardar estado original para restaurar después
      const originalStyle = {
        position: element.style.position,
        width: element.style.width,
        height: element.style.height,
        transform: element.style.transform,
        animation: element.style.animation,
        transition: element.style.transition
      };
      
      // Forzar layout fijo para exportación
      element.style.position = 'relative';
      element.style.width = '100%';
      element.style.height = 'auto';
      element.style.transform = 'none';
      element.style.animation = 'none';
      element.style.transition = 'none';
      
      // Esperar renderizado completo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Configuración simplificada para exportación
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false,
        imageTimeout: 15000
      });
      
      // Restaurar estilo original
      Object.assign(element.style, originalStyle);

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Simular clic en el enlace
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Imagen exportada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al exportar imagen:', error);
      alert('Error al exportar la imagen. Por favor, inténtalo nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportAsImage}
      disabled={isExporting}
      className={`
        relative inline-flex items-center justify-center
        px-3 py-1.5 bg-blue-600 text-white rounded-md
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      title="Exportar como imagen en alta calidad"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Descargar Imagen
        </>
      )}
    </button>
  );
};

export default ImageExportButton;