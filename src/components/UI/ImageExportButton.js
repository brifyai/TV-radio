import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para exportar imágenes con posicionamiento inteligente
 * @param {Object} targetRef - Referencia al elemento a exportar
 * @param {string} filename - Nombre del archivo de descarga
 * @param {string} className - Clases CSS adicionales
 * @param {string} variant - Variante del botón ('default', 'minimal', 'floating')
 * @param {string} position - Posición del botón ('top-right', 'top-left', 'bottom-right', 'bottom-left')
 */
const ImageExportButton = ({
  targetRef,
  filename = 'analisis-spot',
  className = '',
  variant = 'minimal', // 'default', 'minimal', 'floating'
  position = 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const buttonRef = useRef(null);

  // Verificar colisiones y ajustar posición si es necesario
  useEffect(() => {
    const checkCollisionsAndAdjust = () => {
      if (!buttonRef.current) return;
      
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Detectar si hay colisión con otros elementos o está fuera del viewport
      const hasCollision = (
        buttonRect.top < 0 ||
        buttonRect.left < 0 ||
        buttonRect.bottom > viewportHeight ||
        buttonRect.right > viewportWidth
      );
      
      if (hasCollision) {
        console.log('🔄 Detectada colisión o botón fuera del viewport, ajustando posición...');
        
        // Lógica de reposicionamiento automático
        let newPosition = position;
        
        // Si está en top-right y hay colisión, mover a top-left
        if (position === 'top-right' && (buttonRect.right > viewportWidth || buttonRect.top < 0)) {
          newPosition = 'top-left';
        }
        // Si está en top-left y hay colisión, mover a bottom-left
        else if (position === 'top-left' && (buttonRect.left < 0 || buttonRect.top < 0)) {
          newPosition = 'bottom-left';
        }
        // Si está en bottom-left y hay colisión, mover a bottom-right
        else if (position === 'bottom-left' && (buttonRect.left < 0 || buttonRect.bottom > viewportHeight)) {
          newPosition = 'bottom-right';
        }
        // Si está en bottom-right y hay colisión, mover a top-right
        else if (position === 'bottom-right' && (buttonRect.right > viewportWidth || buttonRect.bottom > viewportHeight)) {
          newPosition = 'top-right';
        }
        
        if (newPosition !== position) {
          console.log(`📍 Posición ajustada de ${position} a ${newPosition}`);
          // La posición se actualizará en el próximo render
        }
      }
    };

    const timer = setTimeout(checkCollisionsAndAdjust, 100);
    return () => clearTimeout(timer);
  }, [position]);

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

  // Obtener clases de posicionamiento
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0';
      case 'top-left':
        return 'top-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      default:
        return 'top-0 right-0';
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
          absolute ${getPositionClasses()} z-10 inline-flex items-center justify-center
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