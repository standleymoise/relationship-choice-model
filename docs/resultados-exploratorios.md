# Resultados exploratorios

> **Qué son estos resultados.** Salidas de agentes ficticios con reglas programadas (ver [`modelo-matematico.md`](modelo-matematico.md)). Dependen enteramente de los supuestos de diseño y **no describen a personas reales**. No se presentan porcentajes de éxito, de abandono ni predicciones. Todas las cifras salen de los archivos de `experiments/results/` y están en [`tablas-resultados.md`](tablas-resultados.md) con intervalos de 95 %. Un resultado que contradice la hipótesis inicial es un resultado y se muestra con el mismo peso.

## Resumen en cinco frases

1. La **sobreestimación del candidato elegido** existe y es matemática (maldición del ganador): crece con el número de alternativas y con la falta de información, y **desaparece** si quien decide corrige por la incertidumbre.
2. Sin embargo, en el modelo **cambiar no empeora el bienestar verdadero en promedio** cuando la pareja actual es una persona típica: incluso el agente ingenuo sale ganando (+9 puntos) frente a no buscar.
3. La intuición inicial se sostiene en un **rango acotado**: cuando la pareja actual es *claramente mejor que la típica* (≈ +12 puntos o más en todos los factores) **y** quien decide toma sus impresiones como verdad, cambiar queda por debajo de quedarse.
4. Con corrección de la incertidumbre **no aparece ninguna «paradoja»** por información incompleta: aun así hay cambios que salen mal *por azar* (≈ 29 %), pero la ganancia media por cambio es positiva.
5. Para que el agente corrector cambie mucho y mal hace falta **un mecanismo psicológico adicional** (novedad o foco). Si esos mecanismos existen en personas reales, y con qué magnitud, es una pregunta empírica que este proyecto no responde.

## Resultados por pregunta

### 1. ¿Más opciones empeoran las cosas? (H1)

Subir los candidatos por período de 1 a 12:

| | Cambios | Sobreestimación al elegir | Bienestar vs. no cambiar |
|---|---|---|---|
| Ingenuo | 5,9 → 18,0 | 5,1 → 7,9 | **+7,0 → +10,1** |
| Bayesiano | 3,2 → 4,2 | ≈ 0 | **+8,1 → +12,5** |

Más opciones inflan lo que el ingenuo cree de quien elige, y lo llevan a cambiar mucho más. Pero el bienestar verdadero **mejora**. **Contradice** la hipótesis conceptual «más opciones, peor resultado»; coincide en espíritu con el metaanálisis de Scheibehenne et al. (2010) (efecto medio cercano a cero). El coste monetario sí crece linealmente (40 → 480 unidades), y qué ocurre «neto» depende de una conversión arbitraria.

### 2. ¿La información incompleta importa? (H2)

Para el ingenuo, subir la información por candidato de 1 a 12 unidades baja la sobreestimación de 6,2 a 0,8, los cambios de 10,3 a 3,9 y los cambios que empeoran de 45 % a 17,5 % (de los cambios realizados). **Respaldada**, y es el resultado más cercano a una consecuencia matemática.

### 3. ¿Los requisitos esenciales protegen? (H3a)

Un umbral más alto reduce los cambios que empeoran (ingenuo: 46 % → 28 %), pero **también elimina cambios buenos**: el bienestar vs. no cambiar baja de 9,1 a 3,1. Es un compromiso, no una mejora gratis.

### 4. Elevar expectativas (H4)

Aspiraciones bajas: casi no se busca. Entre 60 y 65 se alcanza el máximo; más arriba no cambia (el agente ya busca siempre) o, para el ingenuo, empeora levemente (neto de costes 9,30 → 8,44). Efecto modesto, dependiente de una conversión de costes arbitraria.

### 5. Comparación continua (H5)

Bajo el supuesto de que la comparación se hace con impresiones sin corregir, la satisfacción percibida cae hasta 2,3 puntos con 8 alternativas (η = 1). Con comparación sobre estimaciones corregidas, el efecto es nulo (−0,01). **No es evidencia sobre el mundo real**: es la magnitud de un supuesto programado y es muy sensible a cómo se define.

## Escenarios que contradicen o matizan la hipótesis inicial

| # | Escenario | Qué muestra |
|---|---|---|
| C1 | Agente bayesiano en todas las configuraciones | **No hay sobreestimación sistemática** ni cambios con ganancia media negativa; la «paradoja» no aparece sin supuestos psicológicos adicionales |
| C2 | Pareja actual típica (e7, shift = 0) | Incluso el ingenuo gana al cambiar (+8,8); no hay motivo para quedarse |
| C3 | Más opciones (H1) | El bienestar verdadero sube con N para ambos agentes |
| C4 | Aversión a la pérdida alta (e6, λ = 2,25) | **Protege** al agente ingenuo: menos cambios (3,1 frente a 10,4) y mejor bienestar (9,74 frente a 9,10) |
| C5 | Comparación sobre estimaciones corregidas (H5) | El efecto de comparar desaparece |
| C6 | Requisitos esenciales altos (H3a) | Reducen el arrepentimiento *y* los beneficios |

## Dónde sí aparece algo parecido a la intuición inicial

**e7 — Calidad de la pareja actual** (agente ingenuo, bienestar vs. no cambiar):

| Pareja actual por encima del promedio | 0 | +5 | +10 | +15 | +20 | +25 |
|---|---|---|---|---|---|---|
| Ingenuo | +8,8 | +4,1 | +0,4 ± 0,4 | **−2,0 ± 0,4** | **−2,5 ± 0,3** | **−1,7 ± 0,3** |
| Bayesiano | +10,5 | +6,1 | +2,7 | +0,8 | +0,2 | 0,0 |

El ingenuo cambia aunque no le convenga (en +15 aún cambia 6,4 veces por corrida y el 53 % de esos cambios empeora). El bayesiano casi no cambia y nunca queda por debajo de cero. Si además se activan novedad y foco, el efecto negativo es mucho mayor (−7,4 en +15). **Esto es un resultado del modelo**: depende de la elección de «+15 puntos», del ruido de las impresiones (σ = 15) y de que los factores sean independientes.

## El «80–20» determinista

Con A fuerte en el grupo G1 (85) y débil en G2 (45) y B con la impresión inversa (75 y 85):

- Con peso de G2 = 0,2 (el caso «80–20»), el agente ingenuo queda en **empate exacto** (neto 0). Ese empate es un efecto de los números ilustrativos elegidos, no una propiedad del 80/20.
- Con *foco* γ = 3 el ingenuo **cambia** (neto +5,2) aunque la esperanza matemática del valor verdadero del cambio, dada la información, es **−10,5**.
- El agente bayesiano **se queda** con A (−10,5 en 0,2) y solo cambia cuando G2 pesa ≈ 0,5 si hay 1 unidad de información sobre B, ≈ 0,3 con 3 unidades, y es indiferente en 0,2 con 8 unidades.
- Con aversión a la pérdida λ = 2,25, el ingenuo no cambia hasta que G2 pesa ≈ 0,4.

La proporción no tiene nada de especial: la decisión se invierte según cuánto pese lo que falta, cuánta información haya sobre B y qué mecanismos se activen. Ver [`tablas-resultados.md`](tablas-resultados.md#escenario-80-20-cálculo-determinista).

## Qué sería necesario para tomarlos en serio

Datos reales de personas, con consentimiento y protección de privacidad, que permitan estimar los parámetros (`σ`, `γ`, `ν`, `λ`) y comparar el modelo con alternativas. Ver [`plan-validacion-empirica.md`](plan-validacion-empirica.md).
