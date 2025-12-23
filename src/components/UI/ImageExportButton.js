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
        transition: element.style.transition,
        overflow: element.style.overflow
      };
      
      // Forzar layout fijo para exportación
      element.style.position = 'relative';
      element.style.width = '100%';
      element.style.height = `${element.scrollHeight}px`; // Usar altura real del contenido
      element.style.transform = 'none';
      element.style.animation = 'none';
      element.style.transition = 'none';
      element.style.overflow = 'visible';
      
      // Resetear estilos en todos los elementos hijos
      const allElements = element.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.transform = 'none';
        el.style.animation = 'none';
        el.style.transition = 'none';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      });
      
      // Esperar renderizado completo (más tiempo para componentes complejos)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Configuración mejorada para exportación
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false,
        imageTimeout: 20000, // Más tiempo para componentes complejos
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-export-id]');
          if (clonedElement) {
            // Aplicar estilos de exportación al elemento clonado
            clonedElement.style.position = 'relative';
            clonedElement.style.width = '100%';
            clonedElement.style.height = 'auto';
            clonedElement.style.transform = 'none';
            clonedElement.style.animation = 'none';
            clonedElement.style.transition = 'none';
            clonedElement.style.overflow = 'visible';
            
            // Resetear estilos en todos los elementos hijos del clon
            const clonedChildren = clonedElement.querySelectorAll('*');
            clonedChildren.forEach(child => {
              child.style.transform = 'none';
              child.style.animation = 'none';
              child.style.transition = 'none';
              child.style.opacity = '1';
              child.style.visibility = 'visible';
            });
          }
        }
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