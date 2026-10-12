# ¿Cuándo comparar con alternativas poco conocidas lleva a cambiar para peor? Un modelo de agentes abierto y reproducible sobre decisiones de pareja bajo información incompleta

**Standley Moise** (usuario de GitHub: standleymoise)
Modelo standleymoise · versión del software 0.3.0 · octubre de 2026

> **Estado del documento: borrador de preprint, sin revisión por pares.** Todos los resultados provienen de agentes ficticios con reglas programadas. No hay datos de personas. Las conclusiones valen para el modelo, no para relaciones reales.

**Código y datos:** <https://github.com/standleymoise/relationship-choice-model> · **Archivo con DOI (Zenodo):** 10.5281/zenodo.23310487 (todas las versiones) · 10.5281/zenodo.23310488 (versión 0.3.0) · **Simulador en línea:** <https://standleymoise.github.io/relationship-choice-model/>

---

## Resumen

Una idea popular, conocida como «80–20», sostiene que quien tiene una pareja que cubre lo importante puede arruinarla por fijarse en lo que le falta y compararla con personas de las que sabe poco. Este trabajo la traduce a un modelo matemático explícito y falsable, la implementa como simulador abierto en JavaScript y la prueba con agentes ficticios. El modelo combina utilidad ponderada por factores, información ruidosa con inferencia bayesiana normal–normal, requisitos esenciales no compensatorios y cuatro mecanismos psicológicos que pueden apagarse uno a uno (foco en lo que falta, aversión a la pérdida, novedad y comparación continua). Cada agente «ingenuo» toma sus impresiones como verdad; su contraparte «bayesiana» ve los mismos datos y los corrige por incertidumbre.

Los resultados contradicen en parte la intuición de partida. (1) La sobreestimación de la alternativa elegida es un efecto de selección (la «maldición del ganador»): aparece solo en el agente ingenuo, crece con el número de alternativas y con la falta de información, y se anula con corrección bayesiana. (2) Aun así, en el modelo cambiar **no** empeora el bienestar verdadero en promedio cuando la pareja actual es típica; más alternativas tampoco lo reducen. (3) La «paradoja» solo aparece cuando la pareja actual es claramente mejor que la típica (unos 15 puntos por encima, con ruido de impresión de 15 puntos) **y** el agente es ingenuo; con el agente bayesiano no aparece. (4) La proporción 80–20 no tiene nada de especial: la decisión se invierte según el peso de lo que falta, la información disponible y los mecanismos activos.

Una revisión sistemática asistida por IA (3324 registros únicos, 265 incluidos) muestra que la búsqueda y el cambio de pareja con modelos formales ya están ampliamente estudiados. No se propone una teoría nueva: la contribución defendible es una herramienta abierta y reproducible con ablación explícita de mecanismos. Esa afirmación depende de límites declarados de la revisión. El proyecto incluye un plan de validación empírica; ningún parámetro psicológico está estimado con datos humanos.

**Palabras clave:** elección de pareja; información incompleta; maldición del ganador; sobrecarga de opciones; modelo basado en agentes; inferencia bayesiana; reproducibilidad.

## Abstract

A popular "80–20" idea holds that someone whose partner covers what matters can damage the relationship by focusing on what is missing and comparing the partner with poorly known alternatives. We turn it into an explicit, falsifiable model, implement it as an open JavaScript simulator, and test it with artificial agents. The model combines weighted-factor utility, noisy information with normal–normal Bayesian updating, non-compensatory essential requirements, and four psychological mechanisms that can be switched off one at a time (focalism, loss aversion, novelty, continuous comparison). A "naive" agent treats impressions as truth; a "Bayesian" counterpart sees the same data and corrects for uncertainty.

Results partly contradict the initial intuition. Overestimation of the chosen alternative is a selection effect (winner's curse): it appears only for the naive agent, grows with the number of alternatives and with missing information, and vanishes under Bayesian correction. In the model, switching does not on average reduce true welfare when the current partner is typical, and more options do not reduce it either. The "paradox" appears only when the current partner is clearly above average (about 15 points, with impression noise of 15 points) and the agent is naive. The 80/20 proportion is not special. A systematic review assisted by AI (3,324 unique records, 265 included) shows that formal models of search and switching are well established, so we claim no new theory; the defensible contribution is an open, reproducible tool with explicit mechanism ablation. All results come from artificial agents and are not evidence about real people.

---

## 1. Introducción

La literatura popular sobre relaciones repite una advertencia: quien tiene una pareja que cubre «el 80 %» de lo que le importa puede dejarse llevar por el «20 %» que le falta, y cambiar por alguien de quien conoce apenas lo mejor. La advertencia es atractiva, pero tiene tres problemas como afirmación científica: la proporción 80–20 no está definida; no se dice qué parte del resultado se debe a estadística pura y cuál a psicología; y casi nunca se enuncia qué observación la refutaría.

Este trabajo hace tres cosas acotadas:

1. **Formaliza** la idea con un modelo matemático explícito, en el que cada supuesto es un parámetro que puede apagarse (sección 3).
2. **Separa** dos explicaciones que suelen mezclarse: un efecto de **selección estadística** (si se elige el mejor de varios candidatos según impresiones ruidosas, el elegido parece mejor de lo que es) y **mecanismos psicológicos** adicionales (foco, aversión a la pérdida, novedad, comparación).
3. **Publica todo** —código, pruebas, resultados, revisión bibliográfica— para que se reproduzca y se critique (sección 11).

No es una teoría de las relaciones ni una herramienta para decidir sobre ninguna relación concreta. El texto declara en la sección 8 lo que el modelo no demuestra y en la sección 9 sus limitaciones. El nombre «Modelo standleymoise» es una atribución de autoría, no una afirmación de novedad teórica.

## 2. Antecedentes

**Sobrecarga de opciones.** El estudio de Iyengar y Lepper (2000) popularizó la idea de que más opciones pueden desmotivar. Los metaanálisis posteriores muestran un panorama matizado: Scheibehenne et al. (2010) hallaron un efecto medio cercano a cero con gran heterogeneidad, y Chernev et al. (2015) identificaron condiciones moderadoras. En contextos de pareja la evidencia es mixta: Wu y Chiou (2009), D'Angelo y Toma (2017), Pronk y Denissen (2020) y Thomas et al. (2022) informan efectos negativos de la abundancia; Hu y Markowitz (2024, preprint) informan que aumentar la elección impulsa la búsqueda relacional; Rosenfeld (2017) contrasta con datos longitudinales la idea de que internet produzca inestabilidad. Finkel et al. (2012) ofrecen un análisis crítico de las citas en línea. De ahí que el modelo **no presuponga** que más opciones empeoran las cosas.

**Búsqueda y decisión bajo información incompleta.** La búsqueda secuencial tiene una larga tradición: el nivel de aspiración de Simon (1955), el valor de reserva de Stigler (1961) y McCall (1970), y el problema de la secretaria de Gilbert y Mosteller (1966). En parejas, Becker et al. (1977) explican la disolución por nueva información y por oportunidades alternativas; Todd y Billari (2005) estudian heurísticas de búsqueda; Wahhaj (2018) modela señales ruidosas sobre la calidad de la pareja; y Simão y Todd (2002) simulan elección con cortejo, donde los agentes pueden cambiar a mejores parejas. El antecedente más cercano que encontró la revisión sistemática es Conroy-Beam (2024), que modela la búsqueda de pareja como un problema de exploración–explotación con muestreo bayesiano de Thompson en entornos ruidosos.

**Selección y sesgo.** La «maldición del optimizador» (Smith y Winkler, 2006) formaliza por qué elegir el máximo de estimaciones ruidosas produce decepción posterior. El modelo la usa como referencia analítica (sección 3.5).

**Mecanismos psicológicos.** El foco en lo que falta se inspira en el focalismo (Wilson et al., 2000); la aversión a la pérdida, en la teoría de las perspectivas (Kahneman y Tversky, 1979; Tversky y Kahneman, 1992); la novedad, en la discusión sobre adaptación hedónica en el matrimonio (Lucas et al., 2003); la eliminación por requisitos, en Tversky (1972). Frente a ello, la literatura sobre compromiso (Rusbult, 1980; Le y Agnew, 2003; Tran et al., 2019) y la desvalorización de alternativas por parte de personas comprometidas (Johnson y Rusbult, 1989) sugieren que los agentes reales no comparan como lo hacen los del modelo; esta tensión se discute en la sección 7.

**Lo que aporta la revisión sistemática de este proyecto.** De 3324 registros únicos, 265 cumplieron los criterios. Ninguno combinaba los cuatro rasgos de la propuesta: (M1) búsqueda o cambio, (M2) información ruidosa con aprendizaje, (M3) sesgo de selección o contraste «corrige / no corrige» y (M4) aislamiento de mecanismos psicológicos. Conroy-Beam (2024) cumple bien M1 y M2 y parcialmente M3; M4 no consta en ningún trabajo formal incluido. Esto describe lo encontrado en esta búsqueda y **no prueba** que no exista (sección 9).

## 3. El modelo

El código que implementa estas ecuaciones está en `src/model.js` y `src/simulation.js`, con pruebas automatizadas. La especificación completa está en `docs/modelo-matematico.md`.

### 3.1 Utilidad

Cada persona `j` tiene un valor verdadero `x_ij` en cada factor `i = 1…K` (respeto, honestidad, proyecto de vida, atracción, etc.) que el agente no observa. Su utilidad es compensatoria:

`U(j) = Σ_i w_i · m_ij`, con `Σ w_i = 1`,

donde `m_ij` es el valor **percibido** y `w_i` la importancia del factor para quien decide. Que un factor esté en la lista no afirma que sea importante: el peso lo decide quien usa el modelo.

### 3.2 Información e incertidumbre

El valor verdadero tiene una previa normal, `x ~ N(μ, σ₀²)`, y cada unidad de información (una cita, una conversación) aporta una impresión `y_k = x + ε_k`, con `ε_k ~ N(0, σ²)`. La posterior es normal:

`precisión = 1/σ₀² + n/σ²`, `m = (μ/σ₀² + n·ȳ/σ²) / precisión`.

Con pocos datos la mejor estimación se encoge hacia lo típico; con `n = 0` la estimación es la previa, es decir, **desconocer no equivale a «50»**. Se comparan dos agentes que ven los mismos datos: el **bayesiano** usa `m`; el **ingenuo** usa `ȳ`, como si la impresión fuera la verdad. Que haya personas reales que razonen de forma «ingenua» es una pregunta empírica; el agente ingenuo es aquí un contraste.

### 3.3 Requisitos esenciales

Un candidato es admisible si, para todo factor esencial `i ∈ E`, `P(x_i ≥ θ | datos) ≥ p_min`. Es una regla de eliminación no compensatoria, inspirada en Tversky (1972). Wang y Ma (2022) señalan que la evidencia experimental reciente suele encontrar estrategias compensatorias en la elección de pareja, por lo que este filtro se trata como supuesto de diseño con umbral explícito. En la simulación la pareja actual queda exenta del filtro (sección 5.3).

### 3.4 Comparación y mecanismos psicológicos

Todos están **apagados por defecto**:

- **Foco (γ):** los factores donde la pareja actual queda por debajo de la aspiración `a` ganan peso, `w′_i ∝ w_i · (1 + γ · max(0, a − m_iA)/100)`, igual para A y B.
- **Aversión a la pérdida (λ):** `neto = G − λ·L + bono de novedad`, con `G` y `L` las ganancias y pérdidas ponderadas al pasar de A a B.
- **Novedad (ν, τ):** una bonificación que decae con el tiempo de relación.
- **Comparación (η):** arrastre de la satisfacción percibida hacia la mejor alternativa conocida, sobre la impresión sin corregir o sobre la media posterior.

El agente cambia a la mejor alternativa admisible si `neto > c_cambio`. Con `γ = 0`, `λ = 1` y `ν = 0`, `neto = U(B) − U(A)`.

### 3.5 Resultado analítico: la maldición del ganador

Si se elige el mejor de `N` candidatos independientes con valor verdadero `V ~ N(μ, σ_v²)` según el valor observado `V + e`, `e ~ N(0, σ_e²)`, y `s² = σ_v² + σ_e²`:

`E[observado − verdadero | elegido] = (σ_e² / s) · E[máx de N normales estándar]`.

Con `σ_v = σ_e = 15` y `N = 5`: `s = 21,2`, `E[máx de 5] = 1,163`, y el sesgo esperado es unos 12,3 puntos; el valor verdadero esperado del elegido es 62,3 y no 74,7. Es estadística de selección, no un hecho psicológico: no demuestra que las personas cometan este error. Las pruebas automatizadas comprueban que la simulación reproduce esta fórmula.

### 3.6 El «80–20» como parámetro

En la metáfora original, una pareja cubre el 80 % de lo que importa y otra parece cubrir el 20 % restante. En el modelo esto es una configuración de pesos entre dos grupos de factores (G1 con peso `1 − s`, G2 con peso `s`), con `s = 0,2` como caso particular. El proyecto barre `s` entre 0,05 y 0,5 para ver dónde se invierte la decisión.

## 4. Hipótesis

Las hipótesis se formularon antes de ver los resultados y cada una indica qué resultado la refutaría (`docs/hipotesis.md`):

- **H1:** cuantos más candidatos se conocen, más cambios y más cambios que empeoran la situación.
- **H2:** menos información por candidato aumenta la sobreestimación y los cambios que empeoran.
- **H3a:** un umbral más alto en los requisitos esenciales reduce los cambios que empeoran sin que el bienestar caiga. **H3b** explora cómo cambia el resultado con la desigualdad entre las importancias.
- **H4:** elevar las expectativas mínimas aumenta la búsqueda y el cambio sin mejorar el resultado.
- **H5:** la comparación continua reduce la satisfacción percibida.
- **Exploratorios:** e6 (qué mecanismo genera cambios que empeoran) y e7 (calidad de la pareja actual).

## 5. Método

### 5.1 Simulación

Cada corrida simula 40 períodos. En cada uno, la pareja actual aporta una unidad más de información y el agente conoce unos candidatos nuevos (por defecto 3 por período, con 1 unidad de información cada uno). Se calcula `neto` para cada candidato admisible, se elige el mejor y se cambia si `neto` supera el coste de cambiar. Se registra el **ajuste verdadero** `Σ w_i·x_i` de la pareja con la que termina el período, una cantidad que solo existe en la simulación. Valores por defecto: `μ = 50`, `σ₀ = σ = 15`, 2 factores esenciales (umbral 35, probabilidad mínima 0,5) y 6 deseables, 8 unidades de información iniciales sobre la pareja actual. Las configuraciones están en `experiments/configuraciones/*.json`.

### 5.2 Métricas

- **Sobreestimación al elegir:** lo observado menos lo verdadero del candidato elegido.
- **Cambios que empeoran:** proporción de cambios tras los cuales el ajuste verdadero es menor que antes.
- **Bienestar vs. no cambiar:** ajuste verdadero medio frente a un agente que nunca cambia en el mismo mundo.
- **Costes:** el dinero de las citas se registra aparte y no entra en la utilidad; solo con una conversión arbitraria dinero→puntos se calcula un neto.

Las métricas «por cambio» se agrupan **por evento** (todos los cambios de todas las corridas) con error estándar agrupado por corrida. Promediar promedios por corrida pesa igual corridas con 1 y con 20 cambios y sesga el resultado: esa definición inicial dio una sobreestimación bayesiana de −0,9 en lugar de 0, y se corrigió.

### 5.3 Reproducibilidad y decisiones post hoc

Generador pseudoaleatorio con semilla; cada persona usa su propio flujo (semilla + identificador), de modo que agentes distintos enfrentan **exactamente el mismo mundo** y las comparaciones son pareadas. Cada serie informa media ± 1,96·error estándar entre corridas independientes.

Hubo decisiones de diseño tomadas **después** de ver resultados, y se declaran: (a) eximir a la pareja actual del filtro esencial, porque aplicarlo producía un artefacto de la primera implementación; (b) agrupar las métricas por evento en vez de promediar por corrida; (c) añadir una base «cruda» para la comparación `η`, porque con la base posterior el efecto era nulo. No hay preregistro, así que los resultados son exploratorios.

### 5.4 Revisión sistemática

Protocolo en `docs/revision-sistematica/protocolo.md`. Fuentes: Semantic Scholar y Europe PMC (32 consultas; el protocolo preveía OpenAlex, cuyo presupuesto diario se agotó, y no se usó ningún registro suyo). Cribado por título y resumen con una sola persona revisora asistida por IA. Una muestra de control de 60 registros del nivel menos prioritario mostró que el 10,0 % eran elegibles (intervalo de Wilson 4,7 %–20,1 %), por lo que se cribó **todo** ese nivel por título; esa decisión fue posterior al protocolo. Todas las desviaciones están en el documento de resultados de la revisión.

## 6. Resultados

Todas las cifras salen de `experiments/results/` y están en `docs/tablas-resultados.md`. Unidades: puntos de una escala nominal 0–100. Cada celda tiene un intervalo de 95 %.

### 6.1 Más opciones (H1)

Al subir los candidatos por período de 1 a 12, el agente ingenuo pasa de 5,9 a 18,0 cambios por corrida y su sobreestimación al elegir de 5,1 a 7,9 puntos; el agente bayesiano pasa de 3,2 a 4,2 cambios y su sobreestimación es aproximadamente cero. Pero el bienestar verdadero frente a no cambiar **sube** en ambos: de +7,0 a +10,1 (ingenuo) y de +8,1 a +12,5 (bayesiano). H1 queda **parcialmente respaldada** (más cambios y mayor sobreestimación en el agente ingenuo) y **contradicha** en lo esencial: el bienestar verdadero no empeora. El coste monetario crece linealmente (de 40 a 480 unidades).

### 6.2 Información incompleta (H2)

Subir la información por candidato de 1 a 12 unidades baja, para el agente ingenuo, la sobreestimación de 6,2 a 0,8, los cambios de 10,3 a 3,9 y la proporción de cambios que empeoran de 45 % a 17,5 %. **Respaldada.** Es el resultado más cercano a una consecuencia matemática.

### 6.3 Requisitos esenciales (H3a)

Un umbral más alto reduce los cambios que empeoran en el agente ingenuo (de 46 % a 28 %), pero **también elimina cambios buenos**: el bienestar frente a no cambiar baja de +9,1 a +3,1. Es un compromiso, no una mejora gratuita.

### 6.4 Expectativas y comparación (H4, H5)

Con aspiraciones bajas casi no se busca; entre 60 y 65 se alcanza el máximo, y más arriba no cambia o, para el ingenuo, empeora levemente (neto de costes de 9,30 a 8,44), con una conversión de costes arbitraria. Si la comparación se hace con impresiones sin corregir (`η = 1`), la satisfacción percibida cae hasta 2,3 puntos con 8 alternativas; con comparación sobre estimaciones corregidas el efecto es nulo (−0,01). Es la magnitud de un supuesto programado, muy sensible a cómo se define.

### 6.5 Qué mecanismo genera cambios que empeoran (e6)

Con 1000 corridas por serie (mismo mundo para todas):

| Serie | Cambios | Cambios que empeoran | Sobreestimación | Bienestar vs. no cambiar |
|---|---|---|---|---|
| Bayesiano puro | 3,85 | 28,9 % | 0,07 | +10,43 |
| Ingenuo puro | 10,39 | 44,9 % | 6,23 | +9,10 |
| Ingenuo con aversión a la pérdida (λ = 2,25) | 3,12 | 26,8 % | 7,84 | +9,74 |
| Bayesiano con foco (γ = 3) | 8,17 | 41,6 % | 0,01 | +10,22 |
| Bayesiano con novedad (ν = 10) | 16,74 | 48,0 % | −0,02 | +8,26 |
| Bayesiano con foco y novedad | 24,19 | 49,2 % | −0,01 | +6,90 |
| Ingenuo con todos los mecanismos | 8,31 | 43,2 % | 6,51 | +9,13 |

Tres lecturas. La sobreestimación depende **solo** del tipo de agente (ingenuo o bayesiano) y no de los mecanismos psicológicos. Para que el agente corrector cambie mucho y mal hace falta un mecanismo adicional (novedad o foco). Y la aversión a la pérdida, lejos de empeorar, **protege** al ingenuo (menos cambios, mejor bienestar). Incluso el agente bayesiano puro tiene ≈ 29 % de cambios que empeoran: ocurren por azar, pero su ganancia media por cambio es positiva. Que existan mecanismos así en personas reales, y con qué magnitud, es una pregunta empírica que este estudio no responde.

### 6.6 Dónde aparece algo parecido a la intuición inicial (e7)

Bienestar frente a no cambiar según cuánto mejor que la típica sea la pareja actual:

| Pareja actual sobre el promedio | 0 | +5 | +10 | +15 | +20 | +25 |
|---|---|---|---|---|---|---|
| Ingenuo | +8,8 | +4,1 | +0,4 ± 0,4 | **−2,0 ± 0,4** | **−2,5 ± 0,3** | **−1,7 ± 0,3** |
| Bayesiano | +10,5 | +6,1 | +2,7 | +0,8 | +0,2 | 0,0 |

El agente ingenuo sigue cambiando aunque no le convenga (con +15 todavía cambia 6,4 veces por corrida y el 53 % de esos cambios empeora). El agente bayesiano casi no cambia y nunca queda por debajo de cero. Con novedad y foco activos, el efecto negativo del ingenuo es mucho mayor (−7,4 con +15). Es un resultado del modelo: depende del valor «+15», del ruido de las impresiones (σ = 15) y de que los factores sean independientes.

### 6.7 El caso determinista 80–20

Con una pareja A fuerte en el grupo G1 (85) y débil en G2 (45), y una B observada con la impresión inversa (75 y 85):

- Con peso de G2 = 0,2, el agente ingenuo queda en **empate exacto**. Ese empate es un efecto de los números ilustrativos, no una propiedad del 80/20.
- Con foco γ = 3 el ingenuo **cambia** (neto +5,2), aunque la esperanza matemática del valor verdadero del cambio, dada la información, es **−10,5**.
- El agente bayesiano **se queda** y solo cambia cuando G2 pesa unos 0,5 (con 1 unidad de información sobre B), unos 0,3 (con 3) o es indiferente en 0,2 (con 8).
- Con λ = 2,25 el ingenuo no cambia hasta que G2 pesa unos 0,4.

La decisión se invierte según cuánto pese lo que falta, cuánta información haya sobre B y qué mecanismos estén activos; la proporción 80/20 no tiene nada de especial.

### 6.8 Resultados de la revisión sistemática

La búsqueda y el cambio de pareja con modelos formales ya constituyen una literatura amplia; la parte de «búsqueda y cambio» de la idea inicial no es novedosa. Información ruidosa con aprendizaje aparece en pocos trabajos (Becker et al., 1977; Wahhaj, 2018; Conroy-Beam, 2024). La evidencia empírica sobre sobrecarga de opciones en parejas es abundante y mixta, lo que coincide con la decisión de no presuponer que más opciones empeoran las cosas. Ninguno de los 265 incluidos combina los cuatro rasgos M1–M4.

## 7. Discusión

**Qué sostienen los resultados.** El núcleo es una distinción: lo que en el lenguaje cotidiano parece una sola «paradoja» son al menos dos fenómenos separables. El primero es **estadístico**: comparar con impresiones ruidosas y quedarse con la mejor infla lo elegido, y se corrige con información o con corrección bayesiana. El segundo es **psicológico**: para que un agente que corrige cambie mucho y mal hacen falta supuestos adicionales sobre foco, novedad o comparación. En el modelo, esos supuestos son los que generan el patrón que describe la intuición 80–20, y por separado ninguno lo hace con la fuerza que se esperaría.

**Qué no sostienen.** La intuición inicial «más opciones y menos información empeoran la decisión» no se sostiene en general: el bienestar verdadero mejora con más opciones, y la parte negativa solo aparece con una pareja actual claramente superior a la típica. Esta contradicción de la hipótesis de partida es un resultado, y se presenta con el mismo peso que los resultados a favor.

**Posible exageración de los cambios.** El modelo no incluye compromiso, inversiones ni desvalorización motivada de las alternativas (Johnson y Rusbult, 1989; Rusbult, 1980), que según la literatura reducen la tentación. Es probable que el modelo **exagere** los cambios que harían agentes reales.

**Relación con trabajos cercanos.** Conroy-Beam (2024) estudia algoritmos de exploración en entornos ruidosos con agentes y díadas reales, pero no modela una pareja actual que se abandona ni separa mecanismos psicológicos. Simão y Todd (2002) permiten cambiar de pareja durante el cortejo, pero su resumen no menciona información ruidosa. Este trabajo se distingue por la combinación de una pareja actual, información ruidosa con corrección explícita y ablación de mecanismos. Esa distinción es provisional hasta leer ambos textos completos (sección 9).

**Utilidad prevista.** La utilidad del proyecto es metodológica: da un lugar donde enunciar con precisión una idea popular, ver qué supuestos necesita y qué observaciones la refutarían. No es una herramienta de consejo sentimental. El simulador incluye además una calculadora comparativa y un cuestionario («Índice de Relación de Pareja») inspirado en una hoja de cálculo previa del autor, con alertas de seguridad cuando se marcan conductas de violencia; es un instrumento de reflexión, no de diagnóstico, y no forma parte de los resultados de este artículo.

## 8. Lo que este modelo NO demuestra

- **No** evalúa objetivamente el valor de una persona ni de una relación.
- **No** determina la pareja ideal ni dice a nadie qué hacer.
- **No** predice el éxito o el fracaso de ninguna relación real.
- **No** demuestra que las personas cometan los errores de los agentes «ingenuos»: ese comportamiento es un supuesto programado.
- **No** estima porcentajes de abandono, arrepentimiento o éxito en poblaciones reales; toda cifra aquí es una propiedad de reglas inventadas.
- **No** distingue culturas, géneros, orientaciones, edades ni contextos.
- **No** valida los parámetros psicológicos (γ, ν, λ, η): son puntos de partida de diseño.
- **No** prueba que la combinación descrita sea nueva en la literatura: solo informa lo hallado en una búsqueda con límites declarados.

## 9. Limitaciones

**Del modelo.** Sin reciprocidad (la otra persona siempre «acepta»); sin compromiso ni inversiones; factores independientes, normales y sin truncar, con lo cual la corrección bayesiana es exacta pero poco realista; un valor «verdadero» que solo existe en la simulación; pesos estables; formas funcionales de los mecanismos no estimadas para parejas; la pareja inicial es un sorteo y los resultados dependen mucho de ese supuesto (e7); información en unidades iguales e independientes, cuando las impresiones reales están correlacionadas y sesgadas; costes arbitrarios; sin dinámica de mercado.

**Del proceso.** Resultados exploratorios sin preregistro; decisiones post hoc declaradas en 5.3; los intervalos reflejan solo la variabilidad de muestreo de la simulación, no la incertidumbre sobre el modelo; sin revisión por pares.

**De la revisión sistemática.** Una sola persona revisora asistida por IA, sin acuerdo entre revisores; bases abiertas sin PsycINFO, Scopus ni Web of Science; recuperación limitada por consulta, que favorece lo más citado; cribado por título y resumen sin texto completo; parte de los registros sin resumen (clasificados entonces por conocimiento previo, que es menos fiable); sin evaluación del riesgo de sesgo; términos de búsqueda en inglés. Antes de afirmar novedad en una publicación formal hacen falta un segundo revisor independiente, consultas en esas bases y la lectura completa de Conroy-Beam (2024) y de Simão y Todd (2002).

## 10. Validación empírica propuesta

El plan completo está en `docs/plan-validacion-empirica.md`. Resumido: estimar con datos reales, con consentimiento y protección de la privacidad, el ruido de las impresiones (σ), los pesos, el foco (γ), la aversión a la pérdida (λ), la novedad (ν, τ) y la comparación (η), y comparar el modelo con alternativas. Las fuentes posibles incluyen experimentos que manipulen la saliencia de lo que falta y seguimientos longitudinales de la satisfacción. Los trabajos sobre preferencias declaradas y reveladas (Eastwick y Finkel, 2008; Fisman et al., 2006; Hitsch et al., 2010; Todd et al., 2007) y los de aprendizaje automático sobre atracción y calidad de la relación (Joel et al., 2017; Joel et al., 2020) son referencias metodológicas. Ningún dato humano se ha recogido hasta ahora.

## 11. Disponibilidad de código, datos y reproducibilidad

El software es de código abierto (licencia MIT); la documentación y los resultados, CC BY 4.0. No tiene dependencias en ejecución. Los resultados guardados se generaron en Windows con Node 24 y la integración continua los recalculó y comparó en Linux y Windows con Node 20, 22 y 24, con los seis trabajos en verde. Eso respalda la reproducibilidad entre esas plataformas para la versión 0.2.0; no garantiza otras versiones ni motores. Para reproducir:

```bash
npm test                 # pruebas automatizadas
npm run experiments      # recalcula los experimentos y compara con lo guardado
```

Cada resultado incluye un hash de configuración y semilla base. Las 69 referencias del repositorio se comprobaron contra Crossref (título, año, primer autor, volumen y primera página); las 6 pendientes de verificación están marcadas y este texto no se apoya en ellas.

## Agradecimientos y declaración de uso de IA

La revisión sistemática, la implementación del código y la redacción de este borrador se realizaron con asistencia de un modelo de lenguaje (Claude, de Anthropic), bajo la dirección y supervisión del autor. El autor asume la responsabilidad del contenido. Los errores del proceso detectados y corregidos están documentados en el repositorio. No hay conflictos de interés ni financiamiento que declarar.

## Referencias

Solo se listan trabajos con metadatos comprobados en Crossref (título, año, primer autor, volumen y primera página). No se leyeron los textos completos de todos; cuando una afirmación proviene del resumen o del título, el texto lo indica.

- Becker, G. S., Landes, E. M., y Michael, R. T. (1977). An economic analysis of marital instability. *Journal of Political Economy*. https://doi.org/10.1086/260631
- Chernev, A., Böckenholt, U., y Goodman, J. (2015). Choice overload: A conceptual review and meta-analysis. *Journal of Consumer Psychology, 25*(2), 333–358. https://doi.org/10.1016/j.jcps.2014.08.002
- Conroy-Beam, D. (2024). Mating with multi-armed bandits: Reinforcement learning models of human mate search. *Open Mind*. https://doi.org/10.1162/opmi_a_00156
- D'Angelo, J. D., y Toma, C. L. (2017). There are plenty of fish in the sea: The effects of choice overload and reversibility on online daters' satisfaction with selected partners. *Media Psychology, 20*(1). https://doi.org/10.1080/15213269.2015.1121827
- Eastwick, P. W., y Finkel, E. J. (2008). Sex differences in mate preferences revisited: Do people know what they initially desire in a romantic partner? *Journal of Personality and Social Psychology, 94*(2). https://doi.org/10.1037/0022-3514.94.2.245
- Finkel, E. J., Eastwick, P. W., Karney, B. R., Reis, H. T., y Sprecher, S. (2012). Online dating: A critical analysis from the perspective of psychological science. *Psychological Science in the Public Interest, 13*(1). https://doi.org/10.1177/1529100612436522
- Fisman, R., Iyengar, S. S., Kamenica, E., y Simonson, I. (2006). Gender differences in mate selection: Evidence from a speed dating experiment. *The Quarterly Journal of Economics, 121*(2). https://doi.org/10.1162/qjec.2006.121.2.673
- Gilbert, J. P., y Mosteller, F. (1966). Recognizing the maximum of a sequence. *Journal of the American Statistical Association, 61*(313). https://doi.org/10.1080/01621459.1966.10502008
- Hitsch, G. J., Hortaçsu, A., y Ariely, D. (2010). What makes you click? Mate preferences in online dating. *Quantitative Marketing and Economics, 8*. https://doi.org/10.1007/s11129-010-9088-6
- Hu, J., y Markowitz, D. M. (2024). Increasing choice boosts relational pursuit in online dating: Testing three competing mechanisms of interpersonal evaluation. *PsyArXiv* (preprint). https://doi.org/10.31234/osf.io/6zhju
- Iyengar, S. S., y Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? *Journal of Personality and Social Psychology, 79*(6), 995–1006. https://doi.org/10.1037/0022-3514.79.6.995
- Joel, S., Eastwick, P. W., y Finkel, E. J. (2017). Is romantic desire predictable? Machine learning applied to initial romantic attraction. *Psychological Science, 28*(10). https://doi.org/10.1177/0956797617714580
- Joel, S., Eastwick, P. W., Allison, C. J., et al. (2020). Machine learning uncovers the most robust self-report predictors of relationship quality across 43 longitudinal couples studies. *Proceedings of the National Academy of Sciences, 117*(32). https://doi.org/10.1073/pnas.1917036117
- Johnson, D. J., y Rusbult, C. E. (1989). Resisting temptation: Devaluation of alternative partners as a means of maintaining commitment in close relationships. *Journal of Personality and Social Psychology, 57*(6). https://doi.org/10.1037/0022-3514.57.6.967
- Kahneman, D., y Tversky, A. (1979). Prospect theory: An analysis of decision under risk. *Econometrica, 47*(2). https://doi.org/10.2307/1914185
- Le, B., y Agnew, C. R. (2003). Commitment and its theorized determinants: A meta-analysis of the Investment Model. *Personal Relationships, 10*(1). https://doi.org/10.1111/1475-6811.00035
- Lucas, R. E., Clark, A. E., Georgellis, Y., y Diener, E. (2003). Reexamining adaptation and the set point model of happiness: Reactions to changes in marital status. *Journal of Personality and Social Psychology, 84*(3). https://doi.org/10.1037/0022-3514.84.3.527
- McCall, J. J. (1970). Economics of information and job search. *The Quarterly Journal of Economics, 84*(1). https://doi.org/10.2307/1879403
- Pronk, T. M., y Denissen, J. J. A. (2020). A rejection mind-set: Choice overload in online dating. *Social Psychological and Personality Science, 11*(3). https://doi.org/10.1177/1948550619866189
- Rosenfeld, M. J. (2017). Marriage, choice, and couplehood in the age of the Internet. *Sociological Science*. https://doi.org/10.15195/v4.a20
- Rusbult, C. E. (1980). Commitment and satisfaction in romantic associations: A test of the investment model. *Journal of Experimental Social Psychology, 16*(2). https://doi.org/10.1016/0022-1031(80)90007-4
- Scheibehenne, B., Greifeneder, R., y Todd, P. M. (2010). Can there ever be too many options? A meta-analytic review of choice overload. *Journal of Consumer Research, 37*(3), 409–425. https://doi.org/10.1086/651235
- Simão, J., y Todd, P. M. (2002). Modeling mate choice in monogamous mating systems with courtship. *Adaptive Behavior, 10*(2), 113–136. https://doi.org/10.1177/1059712302010002003
- Simon, H. A. (1955). A behavioral model of rational choice. *The Quarterly Journal of Economics, 69*(1). https://doi.org/10.2307/1884852
- Smith, J. E., y Winkler, R. L. (2006). The optimizer's curse: Skepticism and postdecision surprise in decision analysis. *Management Science, 52*(3). https://doi.org/10.1287/mnsc.1050.0451
- Stigler, G. J. (1961). The economics of information. *Journal of Political Economy, 69*(3). https://doi.org/10.1086/258464
- Thomas, M. F., Binder, A., y Matthes, J. (2022). The agony of partner choice: The effect of excessive partner availability on fear of being single, self-esteem, and partner choice overload. *Computers in Human Behavior, 126*. https://doi.org/10.1016/j.chb.2021.106977
- Todd, P. M., y Billari, F. C. (2005). Aggregate age-at-marriage patterns from individual mate-search heuristics. *Demography*. https://doi.org/10.1353/dem.2005.0027
- Todd, P. M., Penke, L., Fasolo, B., y Lenton, A. P. (2007). Different cognitive processes underlie human mate choices and mate preferences. *Proceedings of the National Academy of Sciences, 104*(38). https://doi.org/10.1073/pnas.0705290104
- Tran, J., Judge, M., y Kashima, E. S. (2019). Commitment in relationships: An updated meta-analysis of the Investment Model. *Personal Relationships, 26*(2). https://doi.org/10.1111/pere.12268
- Tversky, A. (1972). Elimination by aspects: A theory of choice. *Psychological Review, 79*(4). https://doi.org/10.1037/h0032955
- Tversky, A., y Kahneman, D. (1992). Advances in prospect theory: Cumulative representation of uncertainty. *Journal of Risk and Uncertainty, 5*. https://doi.org/10.1007/BF00122574
- Wahhaj, Z. (2018). An economic model of early marriage. *Journal of Economic Behavior & Organization*. https://doi.org/10.1016/j.jebo.2018.06.001
- Wang, H., y Ma, J. (2022). Value-directed information search in partner choice. *Judgment and Decision Making*. https://doi.org/10.1017/s1930297500009426
- Wilson, T. D., Wheatley, T., Meyers, J. M., Gilbert, D. T., y Axsom, D. (2000). Focalism: A source of durability bias in affective forecasting. *Journal of Personality and Social Psychology, 78*(5). https://doi.org/10.1037/0022-3514.78.5.821
- Wu, P.-L., y Chiou, W.-B. (2009). More options lead to more searching and worse choices in finding partners for romantic relationships online: An experimental study. *CyberPsychology & Behavior*. https://doi.org/10.1089/cpb.2008.0182

**Software citable:** Moise, S. (2026). *Modelo standleymoise: modelo y simulador abierto de decisiones de elección de pareja bajo información incompleta* (v0.3.0) [Software]. Zenodo. https://doi.org/10.5281/zenodo.23310488
