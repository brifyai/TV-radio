import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para exportar imágenes con posicionamiento fijo
 * @param {Object} targetRef - Referencia al elemento a exportar
 * @param {string} filename - Nombre del archivo de descarga
 * @param {string} className - Clases CSS adicionales
 * @param {string} variant - Variante del botón ('default', 'minimal', 'floating')
 */
const ImageExportButton = ({
  targetRef,
  filename = 'analisis-spot',
  className = '',
  variant = 'floating'
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
      
      // Asegurar que esté visible
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
      
      // Esperar renderizado completo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Configuración específica para componentes complejos
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 25000,
        removeContainer: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-export-id]');
          if (clonedElement) {
            // Eliminar todas las transformaciones que pueden distorsionar
            clonedElement.style.transform = 'none';
            clonedElement.style.animation = 'none';
            clonedElement.style.transition = 'none';
            
            // Forzar layout de desktop para grids responsivos
            const grids = clonedElement.querySelectorAll('[class*="grid"]');
            grids.forEach(grid => {
              // Grid de 4 columnas (métricas principales)
              if (grid.classList.contains('grid-cols-1') && grid.classList.contains('md:grid-cols-4')) {
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                grid.style.gap = '1rem';
              }
              // Grid de 2 columnas (análisis detallado)
              if (grid.classList.contains('grid-cols-1') && grid.classList.contains('md:grid-cols-2')) {
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                grid.style.gap = '1.5rem';
              }
            });
            
            // Asegurar que todos los elementos internos mantengan su tamaño
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach(el => {
              el.style.transform = 'none';
              el.style.animation = 'none';
              el.style.transition = 'none';
            });
          }
        }
      });
      
      // Restaurar estilo original
      Object.assign(element.style, originalStyle);

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0); // Máxima calidad
      
      // Simular clic en el enlace
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Mostrar mensaje de éxito
      console.log('✅ Imagen exportada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al exportar imagen:', error);
      alert('Error al exportar la imagen. Por favor, inténtalo nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Estilos según la variante - más pequeños y discretos
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded';
      case 'floating':
        return 'p-1.5 bg-white border border-gray-200 rounded shadow-sm text-gray-500 hover:text-gray-700 hover:shadow-md';
      default:
        return 'p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-all';
    }
  };

  return (
    <button
      onClick={exportAsImage}
      disabled={isExporting}
      className={`
        absolute top-2 right-2 z-20 inline-flex items-center justify-center
        ${getVariantStyles()}
        ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title="Exportar como imagen en alta calidad"
    >
      {isExporting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Download className="h-3 w-3" />
      )}
    </button>
  );
};

export default ImageExportButton;