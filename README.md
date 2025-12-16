# 📊 TV Radio Analytics - Análisis de Impacto de Spots TV con IA

Una aplicación React para analizar el impacto de los spots de televisión en las métricas web usando Google Analytics y análisis inteligente con IA.

## 🚀 Características Principales

### 📈 Análisis de Spots de TV
- **Carga de archivos Excel/CSV** con datos de spots
- **Análisis automático** del impacto en usuarios activos, sesiones y vistas de página
- **Comparativa en tiempo real** con períodos anteriores (día anterior y semana pasada)
- **Parseo inteligente** de fechas de Excel (soporta números seriales)
- **Exportación de resultados** en formato CSV

### 🤖 Análisis Inteligente con IA
- **Análisis individual** de cada spot con insights personalizados
- **Análisis batch** para campañas completas
- **Recomendaciones estratégicas** generadas por IA
- **Powered by Groq** con modelo Llama 3.1-8b-instant

### 🔗 Integración con Google Analytics
- **Autenticación OAuth 2.0** con Google
- **Conexión segura** via proxy de Netlify
- **Soporte para múltiples cuentas** y propiedades
- **Métricas en tiempo real** de GA4

### 🎨 Interfaz Moderna
- **Diseño responsive** con Tailwind CSS
- **Componentes reutilizables** con Lucide Icons
- **Estados de carga** y progreso visual
- **Alertas y notificaciones** informativas

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Backend**: Netlify Functions (Node.js)
- **APIs**: Google Analytics Data API v1beta, Groq AI API
- **Herramientas**: XLSX.js para parseo de Excel, Axios para HTTP requests
- **Deployment**: Netlify

## 📋 Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Configuración de Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# Configuración de Groq AI
REACT_APP_GROQ_API_KEY=gsk_your-groq-api-key

# URL de funciones de Netlify
REACT_APP_NETLIFY_FUNCTIONS_URL=/.netlify/functions
```

### 2. Configuración de Google Cloud Console

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita la **Google Analytics Data API**
3. Crea credenciales OAuth 2.0
4. Configura las URLs de redirección autorizadas

### 3. Configuración de Groq

1. Regístrate en [Groq](https://groq.com/)
2. Obtén tu API key desde el dashboard
3. La aplicación usa el modelo `llama-3.1-8b-instant`

### 4. Configuración de Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en el dashboard de Netlify
3. El proxy de Analytics se desplegará automáticamente

## 🎯 Uso de la Aplicación

### Análisis de Spots

1. **Conecta tu cuenta de Google Analytics** haciendo clic en "Conectar con Google"
2. **Selecciona la cuenta y propiedad** que deseas analizar
3. **Carga tu archivo de spots** (Excel o CSV) con las columnas:
   - `fecha_aparicion`: Fecha del spot
   - `hora_megatime`: Hora del spot
4. **Ejecuta el análisis** haciendo clic en "Analizar Impacto"
5. **Revisa los resultados** con métricas y análisis de IA
6. **Exporta los resultados** en formato CSV

### Análisis con IA

- **Análisis Individual**: Haz clic en "IA" junto a cada spot para obtener insights personalizados
- **Análisis General**: Usa el botón "Análisis IA General" para insights de toda la campaña
- **Insights Automáticos**: La IA proporciona recomendaciones basadas en patrones de rendimiento

## 📊 Formato de Archivos

### Archivo CSV/Excel de Spots

```csv
fecha_aparicion,hora_megatime
15/12/2025,14:30:00
15/12/2025,16:45:00
16/12/2025,10:15:00
```

### Formatos de Fecha Soportados

- **DD/MM/YYYY** (formato latinoamericano)
- **YYYY-MM-DD** (formato ISO)
- **Números seriales de Excel** (ej: 45809 = 15/12/2025)
- **Combinaciones fecha-hora** flexibles

## 🔧 Funcionalidades Técnicas

### Parseo Inteligente de Fechas

La aplicación maneja automáticamente:
- Números seriales de Excel
- Múltiples formatos de fecha
- Zonas horarias
- Validación de datos

### Análisis Comparativo

Para cada spot se calcula:
- **Impacto durante el spot** vs **día anterior** (misma hora)
- **Impacto durante el spot** vs **semana pasada** (mismo día/hora)
- **Porcentajes de cambio** para usuarios, sesiones y vistas
- **Detección automática** de impacto significativo (>10%)

### Análisis de IA

La IA proporciona:
- **3 insights clave** sobre el rendimiento
- **2 recomendaciones accionables** para futuros spots
- **1 resumen ejecutivo** de máximo 2 líneas
- **Análisis contextual** basado en datos reales

## 🏗️ Arquitectura

```
src/
├── components/
│   ├── SpotAnalysis/          # Componente principal de análisis
│   ├── Analytics/             # Dashboard de métricas
│   ├── Auth/                  # Autenticación con Google
│   └── UI/                    # Componentes reutilizables
├── services/
│   ├── aiAnalysisService.js   # Servicio de IA con Groq
│   └── googleAnalyticsService.js # Servicio de Google Analytics
├── contexts/
│   └── GoogleAnalyticsContext.js # Estado global de GA
└── config/
    └── supabase.js           # Configuración de Supabase

netlify/
└── functions/
    └── analytics-proxy.js    # Proxy seguro para GA API
```

## 🚀 Deployment

### Desarrollo Local

```bash
npm install
npm start
```

### Deploy en Netlify

1. Conecta el repositorio a Netlify
2. Configura las variables de entorno
3. El deployment es automático en cada push

### Variables de Entorno en Netlify

Asegúrate de configurar:
- `REACT_APP_GROQ_API_KEY`
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 📈 Métricas Analizadas

### Métricas Principales
- **Usuarios Activos**: Número de usuarios únicos activos durante el spot
- **Sesiones**: Número de sesiones iniciadas
- **Vistas de Página**: Total de páginas vistas

### Métricas Calculadas
- **Porcentaje de cambio** vs períodos anteriores
- **Impacto promedio** de la campaña
- **Spots con impacto significativo** (>10%)
- **Patrones de rendimiento** por horario

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Verifica las variables de entorno
3. Consulta los logs de Netlify Functions
4. Abre un issue en GitHub

## 🔮 Próximas Funcionalidades

- [ ] Análisis predictivo con ML
- [ ] Integración con más plataformas de analytics
- [ ] Dashboard en tiempo real
- [ ] Alertas automáticas de impacto
- [ ] Análisis de audiencia detallado
- [ ] Exportación a Power BI/Tableau

---

**Desarrollado con ❤️ para optimizar el impacto de la publicidad televisiva**