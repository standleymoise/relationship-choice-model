# Tablas de resultados (generadas automáticamente)

Generado por `scripts/tablas-resultados.js` desde `experiments/results/*.json`. No editar a mano.
Cada celda es media ± 1,96·error estándar entre corridas independientes. **Son resultados de agentes ficticios con reglas programadas; no describen a personas reales.**

Unidades: utilidad en puntos de una escala nominal 0–100 (media 50, desvío 15 en la población ficticia). «Cambios que empeoran» = proporción de cambios tras los cuales el ajuste verdadero (que el agente no observa) es menor que antes.

## e6-mecanismos-psicologicos (exploratorio)

Desglose por mecanismo. Pregunta: ¿qué supuesto genera cambios que empeoran el ajuste verdadero? Cada serie activa un conjunto de mecanismos sobre el mismo mundo aleatorio (misma semilla). Valores de los mecanismos: focal γ = 3, novedad ν = 10 puntos con decaimiento de 5 períodos, aversión a la pérdida λ = 2,25 (referencia de Tversky y Kahneman, 1992, usada aquí como punto de partida de diseño, no como estimación para parejas).

Corridas por celda: 1000. Semilla base: 107. Hash de configuración: `b923cc973cb4a284`.

| Serie | Cambios | Cambios que empeoran | Ganancia verdadera por cambio | Sobreestimación al elegir | Bienestar vs. no cambiar | Neto de costes vs. no cambiar | Satisfacción percibida | Coste monetario |
|---|---|---|---|---|---|---|---|---|
| bayes_puro | 3.85 ± 0.15 | 0.289 ± 0.013 | 3.23 ± 0.15 | 0.07 ± 0.13 | 10.43 ± 0.39 | 10.43 ± 0.39 | 60.36 ± 0.15 | 120.00 ± 0.00 |
| naive_puro | 10.39 ± 0.25 | 0.449 ± 0.006 | 0.99 ± 0.05 | 6.23 ± 0.09 | 9.10 ± 0.39 | 9.10 ± 0.39 | 62.24 ± 0.15 | 120.00 ± 0.00 |
| bayes_focal | 8.17 ± 0.34 | 0.416 ± 0.008 | 1.51 ± 0.09 | 0.01 ± 0.09 | 10.22 ± 0.39 | 10.22 ± 0.39 | 60.14 ± 0.17 | 120.00 ± 0.00 |
| naive_focal | 16.74 ± 0.33 | 0.482 ± 0.005 | 0.50 ± 0.03 | 5.06 ± 0.08 | 7.74 ± 0.39 | 7.74 ± 0.39 | 61.21 ± 0.15 | 120.00 ± 0.00 |
| bayes_novedad | 16.74 ± 0.30 | 0.480 ± 0.005 | 0.52 ± 0.03 | -0.02 ± 0.06 | 8.26 ± 0.38 | 8.26 ± 0.38 | 65.80 ± 0.08 | 120.00 ± 0.00 |
| naive_novedad | 18.65 ± 0.21 | 0.486 ± 0.004 | 0.37 ± 0.03 | 5.18 ± 0.07 | 6.92 ± 0.37 | 6.92 ± 0.37 | 68.97 ± 0.10 | 120.00 ± 0.00 |
| bayes_focal_novedad | 24.19 ± 0.33 | 0.492 ± 0.004 | 0.29 ± 0.02 | -0.01 ± 0.05 | 6.90 ± 0.38 | 6.90 ± 0.38 | 65.39 ± 0.08 | 120.00 ± 0.00 |
| naive_perdida | 3.12 ± 0.10 | 0.268 ± 0.014 | 3.76 ± 0.17 | 7.84 ± 0.17 | 9.74 ± 0.38 | 9.74 ± 0.38 | 61.53 ± 0.18 | 120.00 ± 0.00 |
| naive_todo | 8.31 ± 0.17 | 0.432 ± 0.007 | 1.21 ± 0.06 | 6.51 ± 0.10 | 9.13 ± 0.38 | 9.13 ± 0.38 | 67.97 ± 0.12 | 120.00 ± 0.00 |

## e7-calidad-pareja-actual (exploratorio)

Variable independiente: cuánto mejor que la persona típica es la pareja actual (puntos sumados a todos sus factores verdaderos). 0 = una persona típica; +15 ≈ una pareja claramente por encima del promedio en todo. Es el caso más cercano a la intuición 80–20: la pareja actual ya es buena. Se comparan los dos tipos de agente.

Corridas por celda: 500. Semilla base: 108. Hash de configuración: `82b1384209585f02`.

| Serie | `initialQualityShift` | Cambios | Cambios que empeoran | Ganancia verdadera por cambio | Sobreestimación al elegir | Bienestar vs. no cambiar | Neto de costes vs. no cambiar | Satisfacción percibida | Coste monetario |
|---|---|---|---|---|---|---|---|---|---|
| bayes | 0 | 3.79 ± 0.21 | 0.297 ± 0.019 | 3.22 ± 0.23 | 0.05 ± 0.18 | 10.51 ± 0.58 | 10.51 ± 0.58 | 60.37 ± 0.22 | 120.00 ± 0.00 |
| bayes | 5 | 2.79 ± 0.21 | 0.324 ± 0.021 | 2.67 ± 0.23 | -0.03 ± 0.21 | 6.09 ± 0.50 | 6.09 ± 0.50 | 60.88 ± 0.24 | 120.00 ± 0.00 |
| bayes | 10 | 1.78 ± 0.20 | 0.376 ± 0.026 | 2.02 ± 0.26 | 0.09 ± 0.25 | 2.71 ± 0.38 | 2.71 ± 0.38 | 62.34 ± 0.31 | 120.00 ± 0.00 |
| bayes | 15 | 0.75 ± 0.14 | 0.392 ± 0.038 | 1.61 ± 0.37 | 0.09 ± 0.41 | 0.79 ± 0.22 | 0.79 ± 0.22 | 65.14 ± 0.41 | 120.00 ± 0.00 |
| bayes | 20 | 0.21 ± 0.08 | 0.388 ± 0.087 | 1.35 ± 0.65 | -0.02 ± 0.78 | 0.18 ± 0.10 | 0.18 ± 0.10 | 69.24 ± 0.47 | 120.00 ± 0.00 |
| bayes | 25 | 0.04 ± 0.05 | 0.381 ± 0.125 | 1.22 ± 1.29 | 0.26 ± 1.21 | 0.02 ± 0.03 | 0.02 ± 0.03 | 73.87 ± 0.49 | 120.00 ± 0.00 |
| naive | 0 | 10.68 ± 0.34 | 0.451 ± 0.009 | 0.94 ± 0.07 | 6.21 ± 0.13 | 8.81 ± 0.56 | 8.81 ± 0.56 | 62.01 ± 0.20 | 120.00 ± 0.00 |
| naive | 5 | 10.05 ± 0.36 | 0.475 ± 0.009 | 0.51 ± 0.07 | 6.38 ± 0.14 | 4.12 ± 0.53 | 4.12 ± 0.53 | 62.26 ± 0.21 | 120.00 ± 0.00 |
| naive | 10 | 8.47 ± 0.41 | 0.505 ± 0.009 | 0.08 ± 0.07 | 6.62 ± 0.15 | 0.39 ± 0.44 | 0.39 ± 0.44 | 63.20 ± 0.28 | 120.00 ± 0.00 |
| naive | 15 | 6.44 ± 0.44 | 0.531 ± 0.011 | -0.41 ± 0.09 | 6.96 ± 0.17 | -1.96 ± 0.35 | -1.96 ± 0.35 | 65.27 ± 0.40 | 120.00 ± 0.00 |
| naive | 20 | 4.05 ± 0.42 | 0.554 ± 0.015 | -0.84 ± 0.12 | 7.24 ± 0.22 | -2.46 ± 0.33 | -2.46 ± 0.33 | 68.96 ± 0.53 | 120.00 ± 0.00 |
| naive | 25 | 1.91 ± 0.33 | 0.597 ± 0.023 | -1.37 ± 0.22 | 7.61 ± 0.35 | -1.72 ± 0.30 | -1.72 ± 0.30 | 73.92 ± 0.60 | 120.00 ± 0.00 |
| naive_novedad_focal | 0 | 24.12 ± 0.34 | 0.495 ± 0.006 | 0.27 ± 0.03 | 4.25 ± 0.10 | 5.94 ± 0.53 | 5.94 ± 0.53 | 68.33 ± 0.14 | 120.00 ± 0.00 |
| naive_novedad_focal | 5 | 23.88 ± 0.35 | 0.506 ± 0.006 | 0.06 ± 0.03 | 4.29 ± 0.10 | 1.04 ± 0.52 | 1.04 ± 0.52 | 68.40 ± 0.14 | 120.00 ± 0.00 |
| naive_novedad_focal | 10 | 23.13 ± 0.38 | 0.519 ± 0.006 | -0.15 ± 0.03 | 4.33 ± 0.10 | -3.55 ± 0.49 | -3.55 ± 0.49 | 68.64 ± 0.15 | 120.00 ± 0.00 |
| naive_novedad_focal | 15 | 21.44 ± 0.48 | 0.527 ± 0.006 | -0.39 ± 0.04 | 4.41 ± 0.10 | -7.35 ± 0.43 | -7.35 ± 0.43 | 69.31 ± 0.20 | 120.00 ± 0.00 |
| naive_novedad_focal | 20 | 18.24 ± 0.65 | 0.536 ± 0.007 | -0.65 ± 0.05 | 4.53 ± 0.11 | -9.36 ± 0.41 | -9.36 ± 0.41 | 70.97 ± 0.33 | 120.00 ± 0.00 |
| naive_novedad_focal | 25 | 13.45 ± 0.79 | 0.546 ± 0.008 | -0.99 ± 0.07 | 4.68 ± 0.13 | -9.07 ± 0.53 | -9.07 ± 0.53 | 74.08 ± 0.50 | 120.00 ± 0.00 |

## h1-numero-de-opciones (H1)

Variable independiente: candidatos conocidos por período. Todo lo demás constante. Se compara un agente ingenuo (toma lo observado como verdadero) con uno bayesiano (corrige por la incertidumbre).

Corridas por celda: 500. Semilla base: 101. Hash de configuración: `2d490d7fb948c82c`.

| Serie | `candidatesPerPeriod` | Cambios | Cambios que empeoran | Ganancia verdadera por cambio | Sobreestimación al elegir | Bienestar vs. no cambiar | Neto de costes vs. no cambiar | Satisfacción percibida | Coste monetario |
|---|---|---|---|---|---|---|---|---|---|
| bayes | 1 | 3.19 ± 0.19 | 0.284 ± 0.019 | 3.22 ± 0.22 | -0.06 ± 0.22 | 8.13 ± 0.53 | 8.13 ± 0.53 | 58.26 ± 0.24 | 40.00 ± 0.00 |
| bayes | 2 | 3.73 ± 0.21 | 0.315 ± 0.017 | 3.08 ± 0.21 | 0.06 ± 0.19 | 9.49 ± 0.55 | 9.49 ± 0.55 | 59.66 ± 0.24 | 80.00 ± 0.00 |
| bayes | 3 | 3.76 ± 0.20 | 0.306 ± 0.017 | 3.21 ± 0.21 | 0.14 ± 0.17 | 10.13 ± 0.55 | 10.13 ± 0.55 | 60.34 ± 0.22 | 120.00 ± 0.00 |
| bayes | 5 | 3.95 ± 0.23 | 0.298 ± 0.017 | 3.28 ± 0.23 | 0.09 ± 0.18 | 11.14 ± 0.56 | 11.14 ± 0.56 | 61.28 ± 0.22 | 200.00 ± 0.00 |
| bayes | 8 | 4.01 ± 0.24 | 0.294 ± 0.018 | 3.40 ± 0.24 | -0.03 ± 0.18 | 11.94 ± 0.56 | 11.94 ± 0.56 | 62.11 ± 0.23 | 320.00 ± 0.00 |
| bayes | 12 | 4.20 ± 0.23 | 0.299 ± 0.017 | 3.39 ± 0.23 | 0.05 ± 0.17 | 12.51 ± 0.57 | 12.51 ± 0.57 | 62.68 ± 0.21 | 480.00 ± 0.00 |
| naive | 1 | 5.92 ± 0.23 | 0.425 ± 0.013 | 1.42 ± 0.13 | 5.13 ± 0.17 | 6.99 ± 0.54 | 6.99 ± 0.54 | 59.02 ± 0.27 | 40.00 ± 0.00 |
| naive | 2 | 8.61 ± 0.30 | 0.448 ± 0.010 | 1.06 ± 0.09 | 5.76 ± 0.14 | 8.16 ± 0.55 | 8.16 ± 0.55 | 60.98 ± 0.23 | 80.00 ± 0.00 |
| naive | 3 | 10.43 ± 0.34 | 0.450 ± 0.009 | 0.90 ± 0.08 | 6.20 ± 0.13 | 8.66 ± 0.55 | 8.66 ± 0.55 | 62.06 ± 0.22 | 120.00 ± 0.00 |
| naive | 5 | 13.13 ± 0.41 | 0.468 ± 0.008 | 0.76 ± 0.06 | 6.81 ± 0.12 | 9.32 ± 0.54 | 9.32 ± 0.54 | 63.53 ± 0.19 | 200.00 ± 0.00 |
| naive | 8 | 15.65 ± 0.45 | 0.465 ± 0.007 | 0.66 ± 0.05 | 7.32 ± 0.11 | 9.76 ± 0.55 | 9.76 ± 0.55 | 64.71 ± 0.18 | 320.00 ± 0.00 |
| naive | 12 | 18.04 ± 0.44 | 0.473 ± 0.007 | 0.59 ± 0.04 | 7.86 ± 0.10 | 10.12 ± 0.54 | 10.12 ± 0.54 | 65.82 ± 0.16 | 480.00 ± 0.00 |

## h2-informacion-incompleta (H2)

Variable independiente: unidades de información obtenidas al conocer a cada candidato (firstImpression). La pareja actual parte con 8 unidades de información.

Corridas por celda: 500. Semilla base: 102. Hash de configuración: `2db39dd2fcf9d557`.

| Serie | `firstImpression` | Cambios | Cambios que empeoran | Ganancia verdadera por cambio | Sobreestimación al elegir | Bienestar vs. no cambiar | Neto de costes vs. no cambiar | Satisfacción percibida | Coste monetario |
|---|---|---|---|---|---|---|---|---|---|
| bayes | 1 | 3.61 ± 0.21 | 0.280 ± 0.018 | 3.53 ± 0.24 | 0.02 ± 0.19 | 10.90 ± 0.57 | 10.90 ± 0.57 | 60.56 ± 0.20 | 120.00 ± 0.00 |
| bayes | 2 | 3.74 ± 0.18 | 0.261 ± 0.017 | 3.68 ± 0.21 | -0.06 ± 0.16 | 11.77 ± 0.57 | 11.77 ± 0.57 | 61.34 ± 0.20 | 240.00 ± 0.00 |
| bayes | 3 | 3.78 ± 0.17 | 0.243 ± 0.017 | 3.74 ± 0.20 | 0.02 ± 0.13 | 12.09 ± 0.56 | 12.09 ± 0.56 | 61.74 ± 0.19 | 360.00 ± 0.00 |
| bayes | 5 | 3.72 ± 0.15 | 0.200 ± 0.016 | 3.90 ± 0.20 | 0.04 ± 0.11 | 12.50 ± 0.56 | 12.50 ± 0.56 | 62.13 ± 0.18 | 600.00 ± 0.00 |
| bayes | 8 | 3.70 ± 0.14 | 0.190 ± 0.017 | 3.96 ± 0.20 | -0.00 ± 0.09 | 12.67 ± 0.56 | 12.67 ± 0.56 | 62.32 ± 0.19 | 960.00 ± 0.00 |
| bayes | 12 | 3.62 ± 0.14 | 0.151 ± 0.015 | 4.11 ± 0.19 | -0.01 ± 0.07 | 12.88 ± 0.56 | 12.88 ± 0.56 | 62.50 ± 0.18 | 1440.00 ± 0.00 |
| naive | 1 | 10.31 ± 0.35 | 0.449 ± 0.009 | 1.01 ± 0.08 | 6.21 ± 0.13 | 9.33 ± 0.59 | 9.33 ± 0.59 | 62.25 ± 0.21 | 120.00 ± 0.00 |
| naive | 2 | 6.87 ± 0.26 | 0.396 ± 0.012 | 1.85 ± 0.12 | 4.02 ± 0.13 | 11.00 ± 0.57 | 11.00 ± 0.57 | 62.71 ± 0.20 | 240.00 ± 0.00 |
| naive | 3 | 5.51 ± 0.21 | 0.344 ± 0.014 | 2.45 ± 0.14 | 3.00 ± 0.12 | 11.68 ± 0.57 | 11.68 ± 0.57 | 62.89 ± 0.20 | 360.00 ± 0.00 |
| naive | 5 | 4.52 ± 0.17 | 0.272 ± 0.016 | 3.16 ± 0.16 | 1.91 ± 0.10 | 12.36 ± 0.56 | 12.36 ± 0.56 | 63.12 ± 0.20 | 600.00 ± 0.00 |
| naive | 8 | 4.11 ± 0.15 | 0.222 ± 0.016 | 3.53 ± 0.18 | 1.22 ± 0.09 | 12.62 ± 0.56 | 12.62 ± 0.56 | 63.10 ± 0.19 | 960.00 ± 0.00 |
| naive | 12 | 3.86 ± 0.14 | 0.175 ± 0.014 | 3.83 ± 0.18 | 0.83 ± 0.07 | 12.81 ± 0.56 | 12.81 ± 0.56 | 63.08 ± 0.19 | 1440.00 ± 0.00 |

## h3a-requisitos-esenciales (H3)

Variable independiente: umbral mínimo de los 2 factores esenciales (no compensatorio). Un candidato por debajo del umbral con probabilidad >= 0,5 queda excluido aunque el resto sea excelente.

Corridas por celda: 500. Semilla base: 103. Hash de configuración: `6a96597db6a49b15`.

| Serie | `essentialThreshold` | Cambios | Cambios que empeoran | Ganancia verdadera por cambio | Sobreestimación al elegir | Bienestar vs. no cambiar | Neto de costes vs. no cambiar | Satisfacción percibida | Coste monetario |
|---|---|---|---|---|---|---|---|---|---|
| bayes | 20 | 3.63 ± 0.22 | 0.287 ± 0.018 | 3.41 ± 0.26 | -0.17 ± 0.19 | 10.66 ± 0.59 | 10.66 ± 0.59 | 60.59 ± 0.23 | 120.00 ± 0.00 |
| bayes | 35 | 3.63 ± 0.22 | 0.288 ± 0.018 | 3.41 ± 0.25 | -0.14 ± 0.19 | 10.55 ± 0.58 | 10.55 ± 0.58 | 60.49 ± 0.23 | 120.00 ± 0.00 |
| bayes | 45 | 3.41 ± 0.20 | 0.275 ± 0.018 | 3.52 ± 0.26 | -0.09 ± 0.20 | 10.13 ± 0.59 | 10.13 ± 0.59 | 60.03 ± 0.24 | 120.00 ± 0.00 |
| bayes | 55 | 2.37 ± 0.14 | 0.222 ± 0.022 | 4.36 ± 0.31 | -0.11 ± 0.23 | 7.90 ± 0.56 | 7.90 ± 0.56 | 57.85 ± 0.28 | 120.00 ± 0.00 |
| bayes | 65 | 0.45 ± 0.06 | 0.160 ± 0.047 | 6.69 ± 0.89 | 0.25 ± 0.57 | 1.62 ± 0.32 | 1.62 ± 0.32 | 51.67 ± 0.50 | 120.00 ± 0.00 |
| bayes | 75 | 0.01 ± 0.01 | 0.250 ± 0.425 | 13.65 ± 10.02 | 0.70 ± 3.97 | 0.10 ± 0.13 | 0.10 ± 0.13 | 50.12 ± 0.52 | 120.00 ± 0.00 |
| naive | 20 | 11.49 ± 0.38 | 0.462 ± 0.009 | 0.89 ± 0.07 | 6.27 ± 0.12 | 9.13 ± 0.56 | 9.13 ± 0.56 | 62.54 ± 0.20 | 120.00 ± 0.00 |
| naive | 35 | 10.30 ± 0.35 | 0.453 ± 0.009 | 0.97 ± 0.08 | 6.17 ± 0.13 | 9.01 ± 0.57 | 9.01 ± 0.57 | 62.12 ± 0.21 | 120.00 ± 0.00 |
| naive | 45 | 8.72 ± 0.31 | 0.445 ± 0.011 | 1.10 ± 0.09 | 6.09 ± 0.14 | 8.58 ± 0.58 | 8.58 ± 0.58 | 61.35 ± 0.24 | 120.00 ± 0.00 |
| naive | 55 | 6.07 ± 0.23 | 0.408 ± 0.013 | 1.51 ± 0.13 | 6.11 ± 0.18 | 7.76 ± 0.57 | 7.76 ± 0.57 | 59.91 ± 0.28 | 120.00 ± 0.00 |
| naive | 65 | 3.19 ± 0.15 | 0.356 ± 0.019 | 2.53 ± 0.24 | 5.86 ± 0.28 | 6.20 ± 0.53 | 6.20 ± 0.53 | 57.46 ± 0.33 | 120.00 ± 0.00 |
| naive | 75 | 1.17 ± 0.09 | 0.284 ± 0.032 | 4.44 ± 0.54 | 6.02 ± 0.46 | 3.12 ± 0.43 | 3.12 ± 0.43 | 53.70 ± 0.47 | 120.00 ± 0.00 |

## h3b-concentracion-de-pesos (H3)

Variable independiente: desigualdad entre las importancias de los factores (0 = todas iguales).

Corridas por celda: 500. Semilla base: 104. Hash de configuración: `f853798b03c4662e`.

| Serie | `weightConcentration` | Cambios | Cambios que empeoran | Ganancia verdadera por cambio | Sobreestimación al elegir | Bienestar vs. no cambiar | Neto de costes vs. no cambiar | Satisfacción percibida | Coste monetario |
|---|---|---|---|---|---|---|---|---|---|
| bayes | 0 | 3.77 ± 0.22 | 0.300 ± 0.018 | 2.98 ± 0.21 | 0.02 ± 0.16 | 9.55 ± 0.50 | 9.55 ± 0.50 | 59.46 ± 0.19 | 120.00 ± 0.00 |
| bayes | 0.5 | 3.83 ± 0.23 | 0.294 ± 0.019 | 3.24 ± 0.23 | 0.11 ± 0.18 | 10.51 ± 0.56 | 10.51 ± 0.56 | 60.39 ± 0.21 | 120.00 ± 0.00 |
| bayes | 1 | 3.96 ± 0.24 | 0.303 ± 0.017 | 3.84 ± 0.28 | 0.16 ± 0.22 | 12.71 ± 0.73 | 12.71 ± 0.73 | 62.59 ± 0.32 | 120.00 ± 0.00 |
| bayes | 1.5 | 3.85 ± 0.23 | 0.303 ± 0.017 | 4.70 ± 0.34 | 0.14 ± 0.26 | 15.03 ± 0.89 | 15.03 ± 0.89 | 64.91 ± 0.42 | 120.00 ± 0.00 |
| bayes | 2.5 | 3.82 ± 0.23 | 0.298 ± 0.018 | 5.72 ± 0.42 | 0.11 ± 0.33 | 18.36 ± 1.12 | 18.36 ± 1.12 | 68.17 ± 0.52 | 120.00 ± 0.00 |
| naive | 0 | 10.77 ± 0.33 | 0.446 ± 0.009 | 0.88 ± 0.07 | 5.62 ± 0.12 | 8.15 ± 0.53 | 8.15 ± 0.53 | 61.09 ± 0.18 | 120.00 ± 0.00 |
| naive | 0.5 | 10.60 ± 0.34 | 0.438 ± 0.009 | 0.98 ± 0.08 | 6.16 ± 0.14 | 8.97 ± 0.57 | 8.97 ± 0.57 | 62.12 ± 0.21 | 120.00 ± 0.00 |
| naive | 1 | 10.45 ± 0.35 | 0.439 ± 0.009 | 1.16 ± 0.10 | 7.34 ± 0.18 | 10.74 ± 0.71 | 10.74 ± 0.71 | 64.46 ± 0.32 | 120.00 ± 0.00 |
| naive | 1.5 | 10.27 ± 0.35 | 0.444 ± 0.010 | 1.39 ± 0.12 | 8.53 ± 0.24 | 12.60 ± 0.87 | 12.60 ± 0.87 | 66.91 ± 0.42 | 120.00 ± 0.00 |
| naive | 2.5 | 10.05 ± 0.36 | 0.447 ± 0.009 | 1.70 ± 0.15 | 10.41 ± 0.31 | 15.27 ± 1.09 | 15.27 ± 1.09 | 70.45 ± 0.54 | 120.00 ± 0.00 |

## h4-expectativas (H4)

Variable independiente: nivel de aspiración. El agente solo busca cuando su satisfacción percibida cae por debajo de ese nivel. Costes: 1 unidad monetaria por unidad de información; conversión a puntos (moneyToUtility = 0,1) y coste de cambio 1 punto son supuestos de diseño arbitrarios.

Corridas por celda: 500. Semilla base: 105. Hash de configuración: `bed7834f23e59be7`.

| Serie | `aspiration` | Cambios | Cambios que empeoran | Ganancia verdadera por cambio | Sobreestimación al elegir | Bienestar vs. no cambiar | Neto de costes vs. no cambiar | Satisfacción percibida | Coste monetario |
|---|---|---|---|---|---|---|---|---|---|
| bayes | 40 | 0.06 ± 0.02 | 0.000 ± 0.000 | 16.64 ± 1.85 | -0.33 ± 1.55 | 0.85 ± 0.32 | 0.85 ± 0.32 | 50.93 ± 0.41 | 0.17 ± 0.06 |
| bayes | 50 | 0.80 ± 0.08 | 0.093 ± 0.029 | 7.01 ± 0.60 | 0.02 ± 0.40 | 5.23 ± 0.55 | 5.20 ± 0.54 | 55.27 ± 0.27 | 2.66 ± 0.28 |
| bayes | 55 | 1.99 ± 0.13 | 0.195 ± 0.023 | 4.63 ± 0.32 | -0.00 ± 0.26 | 8.36 ± 0.53 | 8.28 ± 0.53 | 58.50 ± 0.20 | 13.55 ± 1.19 |
| bayes | 60 | 2.91 ± 0.16 | 0.236 ± 0.019 | 3.90 ± 0.24 | 0.19 ± 0.22 | 9.58 ± 0.53 | 9.35 ± 0.53 | 59.76 ± 0.19 | 66.16 ± 3.43 |
| bayes | 65 | 2.97 ± 0.16 | 0.238 ± 0.019 | 3.85 ± 0.24 | 0.21 ± 0.22 | 9.61 ± 0.53 | 9.26 ± 0.53 | 59.79 ± 0.20 | 111.65 ± 1.91 |
| bayes | 70 | 2.97 ± 0.16 | 0.238 ± 0.019 | 3.85 ± 0.24 | 0.21 ± 0.22 | 9.61 ± 0.53 | 9.24 ± 0.53 | 59.79 ± 0.20 | 119.44 ± 0.37 |
| bayes | 80 | 2.97 ± 0.16 | 0.238 ± 0.019 | 3.85 ± 0.24 | 0.21 ± 0.22 | 9.61 ± 0.53 | 9.24 ± 0.53 | 59.79 ± 0.20 | 120.00 ± 0.00 |
| naive | 40 | 0.07 ± 0.02 | 0.000 ± 0.000 | 14.14 ± 1.77 | 2.88 ± 1.69 | 0.88 ± 0.31 | 0.87 ± 0.31 | 50.99 ± 0.42 | 0.22 ± 0.08 |
| naive | 50 | 0.85 ± 0.09 | 0.124 ± 0.029 | 6.54 ± 0.58 | 3.82 ± 0.44 | 5.15 ± 0.54 | 5.12 ± 0.54 | 55.69 ± 0.29 | 3.28 ± 0.38 |
| naive | 55 | 2.24 ± 0.17 | 0.246 ± 0.023 | 3.94 ± 0.32 | 4.68 ± 0.28 | 7.98 ± 0.54 | 7.90 ± 0.53 | 59.09 ± 0.22 | 10.97 ± 0.90 |
| naive | 60 | 5.52 ± 0.31 | 0.366 ± 0.015 | 2.09 ± 0.16 | 5.72 ± 0.18 | 9.54 ± 0.55 | 9.30 ± 0.55 | 61.70 ± 0.19 | 41.69 ± 2.49 |
| naive | 65 | 8.40 ± 0.33 | 0.424 ± 0.011 | 1.31 ± 0.10 | 6.29 ± 0.15 | 9.24 ± 0.57 | 8.80 ± 0.57 | 62.25 ± 0.22 | 93.07 ± 2.74 |
| naive | 70 | 8.92 ± 0.31 | 0.432 ± 0.010 | 1.17 ± 0.09 | 6.44 ± 0.14 | 8.99 ± 0.55 | 8.47 ± 0.55 | 62.17 ± 0.21 | 116.07 ± 1.07 |
| naive | 80 | 8.97 ± 0.31 | 0.433 ± 0.010 | 1.15 ± 0.09 | 6.46 ± 0.14 | 8.96 ± 0.55 | 8.44 ± 0.55 | 62.17 ± 0.21 | 120.00 ± 0.00 |

## h5-comparacion-continua (H5)

Variable independiente: peso de la comparación con la mejor alternativa conocida (η) sobre la satisfacción percibida con la pareja actual. Series: 1, 3 y 8 alternativas por período con la comparación hecha sobre la impresión inicial SIN corregir (supuesto: la impresión vívida afecta al ánimo aunque la decisión use la media corregida), y 3 alternativas con la comparación hecha sobre la media corregida. OJO: bajo estos supuestos el descenso de satisfacción percibida es consecuencia del propio mecanismo programado; el experimento mide su magnitud y su sensibilidad a la definición, no lo contrasta con la realidad. La definición con media corregida se probó primero y produjo un efecto casi nulo; la variante sin corregir se añadió después de ver ese resultado (decisión posterior al dato, ver docs/limitaciones.md).

Corridas por celda: 500. Semilla base: 106. Hash de configuración: `aa7ff8f44477675f`.

| Serie | `mechanisms.comparison` | Cambios | Cambios que empeoran | Ganancia verdadera por cambio | Sobreestimación al elegir | Bienestar vs. no cambiar | Neto de costes vs. no cambiar | Satisfacción percibida | Coste monetario |
|---|---|---|---|---|---|---|---|---|---|
| 1_alt_sin_corregir | 0 | 3.13 ± 0.19 | 0.278 ± 0.018 | 3.29 ± 0.23 | -0.10 ± 0.20 | 8.35 ± 0.53 | 8.35 ± 0.53 | 58.55 ± 0.25 | 40.00 ± 0.00 |
| 1_alt_sin_corregir | 0.25 | 3.13 ± 0.19 | 0.278 ± 0.018 | 3.29 ± 0.23 | -0.10 ± 0.20 | 8.35 ± 0.53 | 8.35 ± 0.53 | 58.36 ± 0.25 | 40.00 ± 0.00 |
| 1_alt_sin_corregir | 0.5 | 3.13 ± 0.19 | 0.278 ± 0.018 | 3.29 ± 0.23 | -0.10 ± 0.20 | 8.35 ± 0.53 | 8.35 ± 0.53 | 58.17 ± 0.26 | 40.00 ± 0.00 |
| 1_alt_sin_corregir | 0.75 | 3.13 ± 0.19 | 0.278 ± 0.018 | 3.29 ± 0.23 | -0.10 ± 0.20 | 8.35 ± 0.53 | 8.35 ± 0.53 | 57.99 ± 0.26 | 40.00 ± 0.00 |
| 1_alt_sin_corregir | 1 | 3.13 ± 0.19 | 0.278 ± 0.018 | 3.29 ± 0.23 | -0.10 ± 0.20 | 8.35 ± 0.53 | 8.35 ± 0.53 | 57.80 ± 0.27 | 40.00 ± 0.00 |
| 3_alt_sin_corregir | 0 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 60.55 ± 0.23 | 120.00 ± 0.00 |
| 3_alt_sin_corregir | 0.25 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 60.20 ± 0.23 | 120.00 ± 0.00 |
| 3_alt_sin_corregir | 0.5 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 59.86 ± 0.24 | 120.00 ± 0.00 |
| 3_alt_sin_corregir | 0.75 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 59.51 ± 0.25 | 120.00 ± 0.00 |
| 3_alt_sin_corregir | 1 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 59.16 ± 0.26 | 120.00 ± 0.00 |
| 8_alt_sin_corregir | 0 | 4.11 ± 0.22 | 0.296 ± 0.018 | 3.32 ± 0.22 | -0.09 ± 0.18 | 11.86 ± 0.55 | 11.86 ± 0.55 | 62.10 ± 0.22 | 320.00 ± 0.00 |
| 8_alt_sin_corregir | 0.25 | 4.11 ± 0.22 | 0.296 ± 0.018 | 3.32 ± 0.22 | -0.09 ± 0.18 | 11.86 ± 0.55 | 11.86 ± 0.55 | 61.53 ± 0.23 | 320.00 ± 0.00 |
| 8_alt_sin_corregir | 0.5 | 4.11 ± 0.22 | 0.296 ± 0.018 | 3.32 ± 0.22 | -0.09 ± 0.18 | 11.86 ± 0.55 | 11.86 ± 0.55 | 60.97 ± 0.24 | 320.00 ± 0.00 |
| 8_alt_sin_corregir | 0.75 | 4.11 ± 0.22 | 0.296 ± 0.018 | 3.32 ± 0.22 | -0.09 ± 0.18 | 11.86 ± 0.55 | 11.86 ± 0.55 | 60.40 ± 0.26 | 320.00 ± 0.00 |
| 8_alt_sin_corregir | 1 | 4.11 ± 0.22 | 0.296 ± 0.018 | 3.32 ± 0.22 | -0.09 ± 0.18 | 11.86 ± 0.55 | 11.86 ± 0.55 | 59.83 ± 0.28 | 320.00 ± 0.00 |
| 3_alt_media_corregida | 0 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 60.55 ± 0.23 | 120.00 ± 0.00 |
| 3_alt_media_corregida | 0.25 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 60.55 ± 0.23 | 120.00 ± 0.00 |
| 3_alt_media_corregida | 0.5 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 60.54 ± 0.23 | 120.00 ± 0.00 |
| 3_alt_media_corregida | 0.75 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 60.54 ± 0.23 | 120.00 ± 0.00 |
| 3_alt_media_corregida | 1 | 3.66 ± 0.20 | 0.283 ± 0.018 | 3.28 ± 0.22 | -0.17 ± 0.18 | 10.36 ± 0.53 | 10.36 ± 0.53 | 60.54 ± 0.23 | 120.00 ± 0.00 |

## escenario-80-20 (cálculo determinista)

Cálculo determinista del caso A fuerte en G1 / B fuerte en G2. Ilustra bajo qué supuestos la decisión de cambiar se invierte. No hay datos reales.

Valores fijos: A observado G1 = 85, G2 = 45 con 8 unidades de información; B observado G1 = 75, G2 = 85; aspiración 70. Cada celda es la utilidad neta de cambiar; ▲ = el agente cambiaría. «E[ganancia verdadera]» es la esperanza de U_B − U_A dado lo observado (referencia racional).

### Información sobre B = 1 unidad(es)

| Peso de G2 | E[ganancia verdadera] | bayes λ=1 γ=0 | bayes λ=1 γ=3 | bayes λ=2.25 γ=0 | naive λ=1 γ=0 | naive λ=1 γ=3 | naive λ=2.25 γ=0 | naive λ=2.25 γ=3 |
|---|---|---|---|---|---|---|---|---|
| 0.05 | -16.6 | -16.6 | -15.2 | -38.7 | -7.5 | -5.8 | -19.4 | -17.2 |
| 0.1 | -14.6 | -14.6 | -12.1 | -35.5 | -5.0 | -1.9 | -16.3 | -12.3 |
| 0.2 | -10.5 | -10.5 | -6.4 | -29.1 | 0.0 | 5.2 ▲ | -10.0 | -3.5 |
| 0.3 | -6.4 | -6.4 | -1.3 | -22.7 | 5.0 ▲ | 11.4 ▲ | -3.8 | 4.3 ▲ |
| 0.4 | -2.4 | -2.4 | 3.1 ▲ | -16.3 | 10.0 ▲ | 16.9 ▲ | 2.5 ▲ | 11.2 ▲ |
| 0.5 | 1.7 | 1.7 ▲ | 7.1 ▲ | -10.0 | 15.0 ▲ | 21.8 ▲ | 8.8 ▲ | 17.3 ▲ |

### Información sobre B = 3 unidad(es)

| Peso de G2 | E[ganancia verdadera] | bayes λ=1 γ=0 | bayes λ=1 γ=3 | bayes λ=2.25 γ=0 | naive λ=1 γ=0 | naive λ=1 γ=3 | naive λ=2.25 γ=0 | naive λ=2.25 γ=3 |
|---|---|---|---|---|---|---|---|---|
| 0.05 | -10.2 | -10.2 | -8.8 | -24.9 | -7.5 | -5.8 | -19.4 | -17.2 |
| 0.1 | -8.1 | -8.1 | -5.4 | -22.0 | -5.0 | -1.9 | -16.3 | -12.3 |
| 0.2 | -3.8 | -3.8 | 0.7 ▲ | -16.1 | 0.0 | 5.2 ▲ | -10.0 | -3.5 |
| 0.3 | 0.6 | 0.6 ▲ | 6.0 ▲ | -10.3 | 5.0 ▲ | 11.4 ▲ | -3.8 | 4.3 ▲ |
| 0.4 | 4.9 | 4.9 ▲ | 10.7 ▲ | -4.4 | 10.0 ▲ | 16.9 ▲ | 2.5 ▲ | 11.2 ▲ |
| 0.5 | 9.2 | 9.2 ▲ | 14.9 ▲ | 1.4 ▲ | 15.0 ▲ | 21.8 ▲ | 8.8 ▲ | 17.3 ▲ |

### Información sobre B = 8 unidad(es)

| Peso de G2 | E[ganancia verdadera] | bayes λ=1 γ=0 | bayes λ=1 γ=3 | bayes λ=2.25 γ=0 | naive λ=1 γ=0 | naive λ=1 γ=3 | naive λ=2.25 γ=0 | naive λ=2.25 γ=3 |
|---|---|---|---|---|---|---|---|---|
| 0.05 | -6.7 | -6.7 | -5.2 | -17.2 | -7.5 | -5.8 | -19.4 | -17.2 |
| 0.1 | -4.4 | -4.4 | -1.7 | -14.4 | -5.0 | -1.9 | -16.3 | -12.3 |
| 0.2 | 0.0 | 0.0 | 4.5 ▲ | -8.9 | 0.0 | 5.2 ▲ | -10.0 | -3.5 |
| 0.3 | 4.4 | 4.4 ▲ | 10.1 ▲ | -3.3 | 5.0 ▲ | 11.4 ▲ | -3.8 | 4.3 ▲ |
| 0.4 | 8.9 | 8.9 ▲ | 14.9 ▲ | 2.2 ▲ | 10.0 ▲ | 16.9 ▲ | 2.5 ▲ | 11.2 ▲ |
| 0.5 | 13.3 | 13.3 ▲ | 19.3 ▲ | 7.8 ▲ | 15.0 ▲ | 21.8 ▲ | 8.8 ▲ | 17.3 ▲ |

