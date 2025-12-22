import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para exportar imágenes con posicionamiento inteligente
 * @param {Object} targetRef - Referencia al elemento a exportar
 * @param {string} filename - Nombre del archivo de descarga
 * @param {string} className - Clases CSS adicionales
 * @param {string} variant - Variante del botón ('default', 'minimal', 'floating')
 * @param {string} position - Posición inicial ('top-right', 'top-left', 'bottom-right', 'bottom-left')
 */
const ImageExportButton = ({
  targetRef,
  filename = 'analisis-spot',
  className = '',
  variant = 'floating', // 'default', 'minimal', 'floating'
  position = 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [finalPosition, setFinalPosition] = useState(position);
  const buttonRef = useRef(null);

  // Detectar colisiones y reposicionar automáticamente
  useEffect(() => {
    const detectAndResolveCollisions = () => {
      if (!buttonRef.current || !targetRef?.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const targetRect = targetRef.current.getBoundingClientRect();
      
      // Verificar si el botón está tapando contenido del elemento target
      const isColliding = (
        buttonRect.left < targetRect.right &&
        buttonRect.right > targetRect.left &&
        buttonRect.top < targetRect.bottom &&
        buttonRect.bottom > targetRect.top
      );

      if (isColliding) {
        console.log('🔄 Detectada colisión, reposicionando botón...');
        
        // Intentar posiciones alternativas en orden de prioridad
        const alternativePositions = [
          'top-left',
          'bottom-right', 
          'bottom-left'
        ];
        
        let newPosition = position;
        
        // Si la posición inicial es top-right, probar top-left primero
        if (position === 'top-right') {
          newPosition = 'top-left';
        }
        
        // Aplicar la nueva posición
        setFinalPosition(newPosition);
        
        // Verificar si la nueva posición también colisiona
        setTimeout(() => {
          if (buttonRef.current) {
            const newButtonRect = buttonRef.current.getBoundingClientRect();
            const stillColliding = (
              newButtonRect.left < targetRect.right &&
              newButtonRect.right > targetRect.left &&
              newButtonRect.top < targetRect.bottom &&
              newButtonRect.bottom > targetRect.top
            );
            
            if (stillColliding) {
              console.log('🔄 Siguiente posición alternativa...');
              setFinalPosition('bottom-right');
            }
          }
        }, 50);
      }
    };

    // Verificar después de que el DOM esté listo
    const timer = setTimeout(detectAndResolveCollisions, 200);
    
    // También verificar en resize de ventana
    const handleResize = () => {
      setTimeout(detectAndResolveCollisions, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [position, targetRef]);

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

  // Obtener clases de posicionamiento dinámico
  const getPositionClasses = () => {
    switch (finalPosition) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
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
          absolute z-10 inline-flex items-center justify-center
          ${getVariantStyles()}
          ${getPositionClasses()}
          ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title="Exportar como imagen en alta calidad"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        
        {variant === 'default' && !isExporting && (
          <span className="ml-2 text-sm font-medium">Exportar</span>
        )}
      </button>
    </div>
  );
};

export default ImageExportButton;