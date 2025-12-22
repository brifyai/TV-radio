import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para exportar imágenes con posicionamiento fijo en esquina superior derecha
 * @param {Object} targetRef - Referencia al elemento a exportar
 * @param {string} filename - Nombre del archivo de descarga
 * @param {string} className - Clases CSS adicionales
 * @param {string} variant - Variante del botón ('default', 'minimal', 'floating')
 */
const ImageExportButton = ({
  targetRef,
  filename = 'analisis-spot',
  className = '',
  variant = 'minimal' // 'default', 'minimal', 'floating'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const buttonRef = useRef(null);

  // Verificar que el botón esté visible en el viewport
  useEffect(() => {
    const checkVisibility = () => {
      if (!buttonRef.current) return;
      
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const isVisible = (
        buttonRect.top >= 0 &&
        buttonRect.left >= 0 &&
        buttonRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        buttonRect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      if (!isVisible) {
        console.log('Botón no visible en viewport');
      }
    };

    const timer = setTimeout(checkVisibility, 100);
    return () => clearTimeout(timer);
  }, []);

  const exportAsImage = async () => {
    if (!targetRef?.current) {
      alert('No se puede capturar la imagen. Inténtalo nuevamente.');
      return;
    }

    // Ocultar botón durante la descarga
    setIsVisible(false);
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
      // Mostrar botón nuevamente después de un breve delay
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
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

  // Si no está visible durante la descarga, no renderizar
  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={exportAsImage}
        disabled={isExporting}
        className={`
          absolute top-0 right-0 z-10 inline-flex items-center justify-center
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
        
        {variant === 'default' && !isExporting && (
          <span className="ml-1 text-xs font-medium">Exportar</span>
        )}
      </button>
    </div>
  );
};

export default ImageExportButton;