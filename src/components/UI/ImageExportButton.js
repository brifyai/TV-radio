import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Camera, Download, Loader2 } from 'lucide-react';

const ImageExportButton = ({ 
  targetRef, 
  filename = 'analisis-spot',
  className = '',
  variant = 'default' // 'default', 'minimal', 'floating'
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async () => {
    if (!targetRef?.current) {
      alert('No se puede capturar la imagen. Inténtalo nuevamente.');
      return;
    }

    setIsExporting(true);
    
    try {
      // Configuración para alta calidad
      const canvas = await html2canvas(targetRef.current, {
        scale: 2, // Duplicar la resolución para alta calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: targetRef.current.scrollWidth,
        height: targetRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: targetRef.current.scrollWidth,
        windowHeight: targetRef.current.scrollHeight,
        // Configuraciones adicionales para mejor calidad
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Asegurar que los estilos se preserven en el clone
          const clonedElement = clonedDoc.querySelector('[data-export-id]');
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.animation = 'none';
          }
        }
      });

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

  // Estilos según la variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100';
      case 'floating':
        return 'p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-gray-600 hover:text-gray-800 hover:shadow-xl';
      default:
        return 'p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all';
    }
  };

  return (
    <button
      onClick={exportAsImage}
      disabled={isExporting}
      className={`
        inline-flex items-center justify-center z-50
        ${getVariantStyles()}
        ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title="Exportar como imagen en alta calidad"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Camera className="h-4 w-4" />
      )}
      
      {variant === 'default' && !isExporting && (
        <span className="ml-2 text-sm font-medium">Exportar</span>
      )}
      
      {variant === 'floating' && !isExporting && (
        <span className="ml-2 text-sm font-medium">IMG</span>
      )}
    </button>
  );
};

export default ImageExportButton;