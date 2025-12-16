# Análisis de Impacto de Spots TV

## Overview

Esta funcionalidad permite analizar el impacto de los spots de televisión en las visitas al sitio web utilizando datos de Google Analytics. Compara las métricas durante la emisión del spot con períodos de referencia (día anterior y semana pasada) para determinar el impacto real.

## Características Principales

### 📊 Análisis Comparativo
- **Durante el spot**: Métricas recopiladas durante la emisión del spot TV
- **Día anterior**: Mismo horario del día previo como referencia
- **Semana anterior**: Mismo horario y día de la semana pasada como referencia
- **Cálculo de impacto**: Diferencia porcentual respecto al baseline promedio

### 📁 Procesamiento de Archivos
- **Formatos soportados**: Excel (.xlsx, .xls) y CSV
- **Parser inteligente**: Maneja múltiples formatos de fecha y hora
- **Validación automática**: Filtra spots inválidos y formatea datos
- **Flexibilidad**: Adapta diferentes estructuras de columnas

### 📈 Métricas Analizadas
- **Usuarios Activos**: Visitantes únicos durante el spot
- **Sesiones**: Número de sesiones iniciadas
- **Vistas de Página**: Total de páginas vistas
- **Impacto significativo**: Cambios > 10% se marcan como significativos

### 🎥 Funcionalidades Adicionales
- **Subida de videos**: Opcional para análisis visual complementario
- **Exportación de resultados**: CSV con todos los datos de impacto
- **Interfaz intuitiva**: Dashboard fácil de usar con indicadores visuales

## Guía de Uso

### 1. Acceder al Análisis de Spots
1. Inicia sesión en la aplicación
2. Conecta tu cuenta de Google Analytics
3. Haz clic en "Análisis de Spots" en el menú de navegación

### 2. Configurar el Análisis
1. **Selecciona propiedad**: Elige la propiedad de Google Analytics a analizar
2. **Sube archivo de spots**: 
   - Formato Excel o CSV
   - Columnas requeridas: fecha, hora, nombre del spot
   - Columnas opcionales: duración (segundos), canal
3. **Sube video (opcional)**: Archivo MP4 del spot para referencia visual

### 3. Formato del Archivo de Spots

#### Formato Esperado
```
fecha,hora,nombre,duracion,canal
15/12/2024,20:30,Spot Navidad,30,Televisión
15/12/2024,21:15,Spot Oferta,45,TV Cable
```

#### Formatos de Fecha Soportados
- `DD/MM/YYYY` o `DD-MM-YYYY` (formato latinoamericano)
- `YYYY/MM/DD` o `YYYY-MM-DD` (formato ISO)
- `MM/DD/YYYY` o `MM-DD-YYYY` (formato americano)

#### Formatos de Hora Soportados
- `HH:MM` (ej: 20:30)
- `HH:MM:SS` (ej: 20:30:00)

#### Nombres de Columnas Flexibles
El sistema reconoce múltiples variaciones:
- **Fecha**: fecha, date, fecha_spot
- **Hora**: hora, time, hora_spot, horario
- **Nombre**: nombre, nombre_spot, spot_name, descripción
- **Duración**: duracion, duracion_segundos (default: 30 segundos)
- **Canal**: canal, channel, medio (default: TV)

### 4. Ejecutar el Análisis
1. Haz clic en "Analizar Impacto"
2. El sistema procesará cada spot automáticamente
3. Verás el progreso en tiempo real
4. Los resultados aparecerán en el dashboard

### 5. Interpretar Resultados

#### Indicadores Visuales
- 🟢 **Impacto Detectado**: Cambio > 10% (positivo o negativo)
- ⚪ **Sin Impacto Significativo**: Cambio ≤ 10%

#### Métricas por Spot
- **Valor durante spot**: Métricas reales durante la emisión
- **Baseline**: Promedio de día anterior y semana pasada
- **Cambio**: Diferencia absoluta
- **% Cambio**: Porcentaje de cambio respecto al baseline

#### Colores de Indicadores
- 🟢 **Verde**: Impacto positivo (aumento en métricas)
- 🔴 **Rojo**: Impacto negativo (disminución en métricas)

### 6. Exportar Resultados
1. Haz clic en "Exportar" en la esquina superior derecha
2. Se descargará un archivo CSV con:
   - Nombre del spot
   - Fecha y hora
   - Métricas detalladas
   - Porcentajes de impacto
   - Indicadores de significancia

## Consideraciones Técnicas

### Requisitos
- ✅ Conexión a Google Analytics 4
- ✅ Permisos de lectura de datos
- ✅ Archivo de spots en formato válido

### Procesamiento
- **Granularidad**: Datos por minuto para análisis preciso
- **Períodos de referencia**: Automáticos según fecha/hora del spot
- **Manejo de errores**: Continúa procesando si algún spot falla
- **Rendimiento**: Pausas entre solicitudes para no sobrecargar la API

### Limitaciones
- Los spots deben tener fecha y hora válidas
- La duración máxima recomendada: 5 minutos por spot
- Análisis limitado a datos disponibles en Google Analytics

## Troubleshooting

### Errores Comunes

#### "No se encontraron spots válidos"
- ✅ Verifica formato de fecha y hora
- ✅ Confirma nombres de columnas
- ✅ Revisa que el archivo tenga datos

#### "Error al procesar el archivo"
- ✅ Usa formato .xlsx, .xls o .csv
- ✅ Verifica que el archivo no esté corrupto
- ✅ Revisa tamaño del archivo (< 10MB)

#### "Sin datos de Analytics"
- ✅ Verifica conexión a Google Analytics
- ✅ Confirma permisos de la propiedad
- ✅ Revisa que el período tenga datos disponibles

#### "Fechas inválidas"
- ✅ Usa formatos de fecha soportados
- ✅ Verifica valores numéricos válidos
- ✅ Confirma fechas dentro del rango disponible

### Tips de Uso
1. **Archivo limpio**: Elimina filas vacías y formatea consistentemente
2. **Nombres descriptivos**: Usa nombres claros para los spots
3. **Duración real**: Especifica duración exacta en segundos
4. **Período reciente**: Analiza spots de los últimos 90 días para mejor datos
5. **Validación previa**: Revisa el archivo antes de subirlo

## Ejemplo Práctico

### Escenario: Campaña Navideña

#### Archivo de Spots
```
fecha,hora,nombre,duracion,canal
15/12/2024,20:30,Navidad Regalos,30,Televisión
15/12/2024,21:15,Navidad Ofertas,45,TV Cable
16/12/2024,18:00,Navidad Kids,30,Cartoon Network
```

#### Resultados Esperados
- **Spot 1**: +25% usuarios, +30% sesiones, +28% vistas 🟢
- **Spot 2**: +15% usuarios, +18% sesiones, +12% vistas 🟢
- **Spot 3**: +5% usuarios, +8% sesiones, +3% vistas ⚪

#### Interpretación
- Los spots de prime time (20:30, 21:15) tienen mayor impacto
- El segmento infantil muestra impacto moderado
- Todos los spots generan aumento en tráfico web

## Soporte

Para problemas técnicos o preguntas:
1. Revisa esta documentación
2. Verifica logs del navegador para errores específicos
3. Contacta al equipo de soporte con detalles del archivo y errores

---

**Versión**: 1.0  
**Última actualización**: Diciembre 2024