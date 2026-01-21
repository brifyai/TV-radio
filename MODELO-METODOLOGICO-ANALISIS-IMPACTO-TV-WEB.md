# Modelo Metodológico para Análisis de Impacto de Spots TV en Tráfico Web

## 📋 Resumen Ejecutivo

Este documento presenta la metodología estadística rigurosa utilizada para determinar el impacto causal de los spots de televisión en las visitas al sitio web. El modelo combina técnicas de inferencia causal avanzadas con controles estadísticos robustos para proporcionar resultados confiables y accionables.

**Objetivo:** Estimar el efecto causal de los spots TV en el tráfico web con validez estadística y interpretabilidad empresarial.

---

## 🎯 Marco Conceptual

### Problema de Investigación
**Pregunta Principal:** ¿Los spots de televisión causan un aumento significativo en el tráfico del sitio web?

**Hipótesis:**
- **H₀ (Null):** Los spots TV no tienen efecto causal en el tráfico web
- **H₁ (Alternativa):** Los spots TV causan un aumento significativo en el tráfico web

### Variables del Modelo

#### Variable Dependiente (Y)
- **Métrica principal:** Usuarios activos durante la emisión del spot
- **Métricas secundarias:** Sesiones y vistas de página
- **Unidad de análisis:** Minutos durante la emisión del spot

#### Variable Independiente (X)
- **Tratamiento:** Emisión de spot TV
- **Intensidad:** Duración del spot (segundos)
- **Momento:** Fecha y hora de emisión

#### Variables de Control (Z)
- **Temporales:** Hora del día, día de la semana, mes, temporada
- **Comportamentales:** Patrones históricos de tráfico
- **Técnicas:** Velocidad de carga, disponibilidad del sitio

---

## 🔬 Metodología Estadística

### 1. Diseño Experimental

#### Enfoque: Quasi-Experimental con Controles Múltiples
```javascript
// Estructura del diseño experimental
const experimentalDesign = {
  treatment_group: {
    description: "Períodos durante emisión de spots TV",
    observations: "n_spots × duration_minutes"
  },
  control_groups: {
    temporal_control: "Mismo horario día anterior",
    weekly_control: "Mismo horario día semana anterior", 
    synthetic_control: "Combinación ponderada de períodos similares"
  },
  matching_criteria: {
    time_of_day: "±30 minutos",
    day_of_week: "Mismo día ±1",
    seasonality: "Misma época del año"
  }
};
```

#### Criterios de Inclusión
- Spots con fecha y hora válidas
- Datos de Google Analytics disponibles
- Duración del spot entre 10-120 segundos
- Período de análisis: últimos 90 días

### 2. Modelo Estadístico Principal

#### Difference-in-Differences (DiD)
```
Y_it = α + β₁(Treatment_i) + β₂(Post_t) + β₃(Treatment_i × Post_t) + ε_it
```

Donde:
- **Y_it:** Métrica de tráfico web para unidad i en tiempo t
- **Treatment_i:** Indicador de spot TV (1=con spot, 0=sin spot)
- **Post_t:** Indicador temporal (1=durante/después del spot, 0=antes)
- **β₃:** Efecto causal de interés (Difference-in-Differences)

#### Validaciones del Modelo DiD
1. **Paralel Trends:** Verificar que grupos tratamiento y control siguen tendencias similares pre-tratamiento
2. **Common Shock:** Identificar eventos externos que afecten ambos grupos
3. **SUTVA:** Stable Unit Treatment Value Assumption

### 3. Controles de Calidad y Robustez

#### Validación de Supuestos
```javascript
const statisticalValidations = {
  // 1. Normalidad de residuos
  normality: {
    test: "Shapiro-Wilk",
    threshold: "p > 0.05",
    action: "Si falla, usar métodos no paramétricos"
  },
  
  // 2. Homoscedasticidad
  homoscedasticity: {
    test: "Breusch-Pagan",
    threshold: "p > 0.05", 
    action: "Si falla, usar errores estándar robustos"
  },
  
  // 3. Independencia
  independence: {
    test: "Durbin-Watson",
    threshold: "1.5 < DW < 2.5",
    action: "Si falla, modelar estructura de correlación"
  },
  
  // 4. Linealidad
  linearity: {
    test: "Component-residual plots",
    threshold: "Relación lineal visible",
    action: "Si falla, transformar variables o usar GAM"
  }
};
```

#### Análisis de Sensibilidad
```javascript
const sensitivityAnalysis = {
  // Placebo Tests
  placebo_tests: {
    time_placebo: "Probar en períodos sin spots",
    unit_placebo: "Probar en sitios web similares sin campaña",
    outcome_placebo: "Probar métricas no relacionadas"
  },
  
  // Rosenbaum Bounds
  rosenbaum_bounds: {
    description: "Sensibilidad a confusores no observados",
    interpretation: "Γ > 2.0 = robusto a confusores moderados"
  },
  
  // Análisis de subgrupos
  subgroup_analysis: {
    by_time: "Hora del día, día de la semana",
    by_spot: "Duración, canal, tipo de comercial",
    by_audience: "Segmentos demográficos"
  }
};
```

### 4. Estimación del Efecto Causal

#### Método Principal: Synthetic Control
```javascript
// Para cada spot, crear control sintético
const syntheticControl = {
  donor_pool: "Períodos sin spots con características similares",
  weights: "Optimizados para minimizar diferencia pre-tratamiento",
  validation: "Placebo tests en donor pool",
  effect: "Diferencia post-tratamiento entre tratamiento y control sintético"
};
```

#### Método Secundario: Matching
```javascript
// Propensity Score Matching
const propensityScore = {
  model: "Logistic regression",
  covariates: "Hora, día, mes, tráfico histórico",
  matching: "Nearest neighbor con caliper 0.1",
  balance: "Standardized differences < 0.1"
};
```

#### Método Terciario: Bootstrap
```javascript
// Intervalos de confianza bootstrap
const bootstrapCI = {
  n_bootstrap: 10000,
  confidence_level: 0.95,
  method: "Percentile bootstrap",
  bias_correction: "BCa (Bias-Corrected and Accelerated)"
};
```

---

## 📊 Análisis Temporal

### 1. Análisis de Lag Óptimo

#### Cross-Correlation Function
```javascript
const lagAnalysis = {
  method: "Cross-correlation between spot times and traffic spikes",
  max_lag: "24 hours",
  optimal_lag: "Lag with maximum correlation",
  significance: "Bootstrap confidence intervals for correlations"
};
```

#### Modelado de Decay Temporal
```javascript
// Función de decaimiento exponencial
const decayModel = {
  functional_form: "Traffic(t) = Baseline + A × exp(-λ × t)",
  parameters: {
    A: "Magnitud del impacto inicial",
    λ: "Tasa de decaimiento",
    half_life: "ln(2) / λ"
  },
  estimation: "Non-linear least squares",
  validation: "AIC/BIC comparison with alternative models"
};
```

### 2. Ventanas Temporales de Análisis

#### Definición Basada en Datos
```javascript
const temporalWindows = {
  immediate: {
    definition: "0-5 minutes post-spot",
    hypothesis: "Respuesta automática/inconsciente",
    expected_pattern: "Spike inmediato"
  },
  short_term: {
    definition: "5 minutes - 2 hours", 
    hypothesis: "Consideración activa",
    expected_pattern: "Decay gradual"
  },
  medium_term: {
    definition: "2-24 hours",
    hypothesis: "Decisión de visita",
    expected_pattern: "Efecto sostenido"
  },
  long_term: {
    definition: "1-7 days",
    hypothesis: "Recordación y word-of-mouth", 
    expected_pattern: "Efecto residual"
  }
};
```

---

## 🎯 Métricas de Impacto

### 1. Métricas Primarias

#### Average Treatment Effect (ATE)
```
ATE = E[Y(1) - Y(0)]
```
**Interpretación:** Incremento promedio en tráfico atribuible al spot TV

#### Confidence Intervals
```
CI = ATE ± t_(α/2,n-2) × SE(ATE)
```
**Interpretación:** Rango de valores plausibles para el efecto verdadero

### 2. Métricas de Significancia

#### Statistical Significance
```javascript
const significance = {
  p_value: "Probabilidad de observar efecto si H₀ es verdadera",
  threshold: "p < 0.05",
  interpretation: "Evidencia contra H₀ (no effect)"
};
```

#### Practical Significance
```javascript
const practicalSignificance = {
  effect_size: "Cohen's d = (ATE) / SD_pooled",
  thresholds: {
    small: "d = 0.2",
    medium: "d = 0.5", 
    large: "d = 0.8"
  },
  business_relevance: "Minimum detectable effect = 10% increase"
};
```

### 3. Métricas de Robustez

#### Sensitivity Analysis
```javascript
const robustness = {
  rosenbaum_bounds: "Γ parameter indicating sensitivity",
  placebo_tests: "Number of false positives in controls",
  subcategory_consistency: "Effect consistency across subgroups"
};
```

---

## 🔍 Validaciones Específicas

### 1. Validez Interna

#### Causal Identification
```javascript
const causalValidation = {
  temporal_precedence: "Spot occurs before traffic increase",
  covariation: "Spots associated with traffic changes", 
  alternative_explanations: "Controlled for confounds",
  dose_response: "Longer spots → larger effects"
};
```

#### Statistical Validity
```javascript
const statisticalValidation = {
  sample_size: "Power analysis: n ≥ 30 per group",
  effect_size: "Minimum detectable effect = 10%",
  confidence_level: "95% CI",
  multiple_testing: "Bonferroni correction for multiple spots"
};
```

### 2. Validez Externa

#### Generalizability
```javascript
const externalValidity = {
  population: "Similar websites and audiences",
  time_period: "Contemporary TV advertising",
  context: "Similar competitive environment",
  measurement: "Comparable web analytics tools"
};
```

#### Transportability
```javascript
const transportability = {
  similar_campaigns: "Effect consistency across spot types",
  different_markets: "Cross-market validation",
  temporal_stability: "Effect stability over time"
};
```

---

## 📈 Interpretación Empresarial

### 1. Reporte de Resultados

#### Dashboard de Métricas
```javascript
const businessMetrics = {
  // Impacto Principal
  causal_impact: {
    metric: "Incremento atribuible al spot TV",
    unit: "Usuarios adicionales por spot",
    confidence: "Intervalo de confianza 95%"
  },
  
  // Significancia Estadística
  statistical_significance: {
    p_value: "Probabilidad de efecto por azar",
    power: "Capacidad de detectar efecto real",
    sample_size: "Número de observaciones"
  },
  
  // Significancia Práctica
  business_significance: {
    roi_estimate: "Retorno de inversión estimado",
    incremental_value: "Valor incremental generado",
    break_even: "Punto de equilibrio"
  }
};
```

#### Interpretación para Stakeholders
```javascript
const stakeholderInterpretation = {
  ceo_marketing: {
    key_metric: "ROI y incrementality",
    interpretation: "Cada peso invertido en TV genera X pesos en tráfico web",
    action: "Optimizar inversión en spots con mayor impacto"
  },
  
  media_planner: {
    key_metric: "Effectiveness por canal y horario",
    interpretation: "Mejor performance por canal TV",
    action: "Redistribuir presupuesto hacia canales efectivos"
  },
  
  web_analytics: {
    key_metric: "Attribution y timing",
    interpretation: "Cuándo y cómo los usuarios responden",
    action: "Optimizar landing pages para momentos de alta demanda"
  }
};
```

### 2. Limitaciones y Disclaimers

#### Limitaciones Metodológicas
```javascript
const limitations = {
  observational_data: "No randomization - potential selection bias",
  unobserved_confounds: "Possible hidden variables affecting both TV and web traffic",
  external_validity: "Results may not generalize to different contexts",
  measurement_error: "Web analytics may not capture all website visits"
};
```

#### Supuestos Críticos
```javascript
const assumptions = {
  stable_unit_treatment: "Spots don't interfere with each other",
  no_other_campaigns: "No other marketing activities during analysis period",
  consistent_measurement: "Web analytics tracking remains constant",
  temporal_stability: "User behavior patterns remain stable"
};
```

---

## 🚀 Implementación Técnica

### 1. Pipeline de Análisis

```javascript
const analysisPipeline = {
  // Fase 1: Preparación de Datos
  data_preparation: {
    spot_data_parsing: "Validate and clean spot schedule data",
    analytics_data_extraction: "Extract traffic data for relevant periods",
    data_integration: "Merge spot and traffic data by timestamp"
  },
  
  // Fase 2: Análisis Exploratorio
  exploratory_analysis: {
    descriptive_statistics: "Summary statistics for all variables",
    correlation_analysis: "Initial correlation structure",
    outlier_detection: "Identify and handle anomalous observations"
  },
  
  // Fase 3: Análisis Principal
  main_analysis: {
    causal_estimation: "DiD, Synthetic Control, Matching",
    robustness_checks: "Sensitivity and placebo tests",
    temporal_analysis: "Lag structure and decay patterns"
  },
  
  // Fase 4: Validación
  validation: {
    assumption_testing: "Test model assumptions",
    sensitivity_analysis: "Assess robustness to assumptions",
    external_validation: "Cross-validate with holdout data"
  },
  
  // Fase 5: Reporte
  reporting: {
    statistical_results: "Formal statistical inference",
    business_interpretation: "Actionable insights for stakeholders",
    limitations: "Clear statement of limitations and caveats"
  }
};
```

### 2. Criterios de Calidad

#### Data Quality Checks
```javascript
const dataQuality = {
  completeness: "Missing data < 5% for key variables",
  consistency: "No contradictory information across sources",
  validity: "All values within expected ranges",
  timeliness: "Data current within analysis window"
};
```

#### Statistical Quality
```javascript
const statisticalQuality = {
  power_analysis: "Adequate sample size for detection",
  assumption_validation: "All key assumptions tested",
  multiple_testing: "Appropriate corrections applied",
  effect_size: "Practically meaningful effects detected"
};
```

---

## 📋 Checklist de Validación

### Antes del Análisis
- [ ] Datos de spots validados (fechas, horas, duración)
- [ ] Datos de Google Analytics extraídos correctamente
- [ ] Período de análisis definido y justificado
- [ ] Variables de control identificadas
- [ ] Supuestos del modelo documentados

### Durante el Análisis
- [ ] Análisis exploratorio completado
- [ ] Supuestos estadísticos validados
- [ ] Métodos de robustez aplicados
- [ ] Análisis de sensibilidad ejecutado
- [ ] Placebo tests realizados

### Después del Análisis
- [ ] Resultados interpretados en contexto empresarial
- [ ] Limitaciones claramente documentadas
- [ ] Recomendaciones específicas proporcionadas
- [ ] Validación cruzada completada
- [ ] Reporte final revisado por experto

---

## 📚 Referencias Metodológicas

### Métodos de Inferencia Causal
1. **Angrist & Pischke (2009)** - "Mostly Harmless Econometrics"
2. **Imbens & Rubin (2015)** - "Causal Inference in Statistics"
3. **Abadie et al. (2010)** - "Synthetic Control Methods"

### Análisis de Series Temporales
4. **Box & Jenkins (2015)** - "Time Series Analysis"
5. **Hamilton (1994)** - "Time Series Analysis"

### Validación y Robustez
6. **Rosenbaum (2002)** - "Observational Studies"
7. **Campbell & Stanley (1963)** - "Experimental and Quasi-Experimental Designs"

---

## 📞 Contacto Metodológico

**Responsable del Modelo:** [Nombre del Experto en Estadística]
**Validación:** [Nombre del Revisor Externo]
**Fecha de Última Validación:** [Fecha]
**Próxima Revisión:** [Fecha]

---

*Este documento constituye la base metodológica para el análisis de impacto de spots TV en tráfico web. Cualquier modificación debe ser aprobada por el equipo metodológico y documentada apropiadamente.*