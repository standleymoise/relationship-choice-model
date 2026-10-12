# Antecedentes científicos y novedad

> **Alcance.** Este documento se apoya en dos fuentes: (1) una primera búsqueda dirigida con verificación de cada DOI contra Crossref (`node scripts/verificar-referencias.js`: título, año, primer autor, volumen y página inicial), y (2) una **revisión sistemática** con protocolo, búsqueda reproducible en Semantic Scholar y Europe PMC, cribado documentado de 3 324 registros únicos y 265 incluidos: [`revision-sistematica/protocolo.md`](revision-sistematica/protocolo.md) y [`revision-sistematica/resultados.md`](revision-sistematica/resultados.md). **Esa revisión no cumple todos los estándares de una revisión formal** (una persona revisora asistida por IA, dos bases abiertas sin PsycINFO/Scopus/Web of Science, cribado por título y resumen, sin texto completo); sus limitaciones y desviaciones están declaradas allí. Las descripciones de hallazgos de este documento se basan en resúmenes y en conocimiento general, y están redactadas con cautela. La lista de referencias con DOI y estado está en [`referencias.md`](referencias.md); las **pendientes de verificación** no sustentan nada aquí.

> **Qué cambió con la revisión sistemática (resumen).** Se confirmó que (a) los modelos de búsqueda y cambio de pareja con agentes o con teoría económica **son abundantes**; (b) la información ruidosa con aprendizaje aparece en pocos trabajos (Becker et al., 1977; Wahhaj, 2018; Conroy-Beam, 2024); (c) **ninguno de los 265 incluidos** combina búsqueda/cambio, información ruidosa, sesgo de selección o contraste «corrige / no corrige» y aislamiento de mecanismos psicológicos; el más cercano es Conroy-Beam (2024). Eso no prueba que no exista un trabajo así; ver §4 y el veredicto de [`resultados.md` §5](revision-sistematica/resultados.md).

## 1. Lo esencial en pocas líneas

La idea inicial («al comparar con una alternativa que parece mejorar lo que falta, se sobrevalora lo nuevo y se desvalora lo que ya se tiene») **combina varios fenómenos ya estudiados**. Ninguna de sus piezas es nueva. Lo que podría aportar este proyecto es otra cosa: una **herramienta transparente y reproducible** para separar, dentro de un mismo modelo, qué parte del efecto la explica la *estadística de selección con información incompleta* (que no requiere ninguna irracionalidad) y qué parte requiere *supuestos psicológicos adicionales* (foco, novedad, aversión a la pérdida). Los resultados dependen de supuestos y no se contrastan con datos.

## 2. Qué ya ha sido estudiado

### 2.1 Sobrecarga de opciones

- Iyengar y Lepper (2000) popularizaron la idea de que más opciones pueden reducir la motivación y la satisfacción.
- Scheibehenne, Greifeneder y Todd (2010) hicieron un metaanálisis (50 experimentos, N = 5036) y encontraron un efecto medio **prácticamente nulo** con mucha variabilidad entre estudios, sin condiciones suficientes identificadas.
- Chernev, Böckenholt y Goodman (2015) reanalizaron 99 observaciones (N = 7202) e identificaron cuatro moderadores: complejidad del conjunto, dificultad de la tarea, **incertidumbre sobre las preferencias** y meta de decisión; con esos moderadores el efecto global es significativo. Jacob et al. (2024) publicaron una revisión sistemática posterior que describe el campo.
- **En parejas:** D'Angelo y Toma (2017) hallaron que quienes eligieron entre 24 perfiles estaban menos satisfechos una semana después y cambiaban más su elección que quienes eligieron entre 6. Pronk y Denissen (2020) describieron una «mentalidad de rechazo»: al ver más opciones online se acepta cada vez menos. Thomas, Binder y Matthes (2022) manipularon la disponibilidad (11, 31 o 91 perfiles) y encontraron más miedo a estar solo, menor autoestima momentánea y más sobrecarga. Finkel et al. (2012) hicieron un análisis crítico de las citas online. Lenton y Francesconi (2010) y Lenton, Fasolo y Todd (2008) estudiaron cómo se gestiona cognitivamente la abundancia de opciones de pareja.

**Implicación para este proyecto.** La evidencia sobre sobrecarga es **mixta**: un metaanálisis encuentra efecto cercano a cero, otro lo encuentra con moderadores. Por eso el modelo **no presupone** que más opciones empeora las cosas; es una de las preguntas (H1) y puede salir en cualquier dirección.

### 2.2 Maximizar y satisfacer

Simon (1955) propuso la «racionalidad limitada» y la regla de «suficientemente bueno». Schwartz et al. (2002) mostraron que quienes tienden a maximizar reportan menos felicidad, más arrepentimiento y más comparación social (estudios correlacionales y experimentos acotados). En el modelo, el *nivel de aspiración* cumple el papel de umbral de satisfacción.

### 2.3 Búsqueda secuencial y parada óptima

- Stigler (1961) y McCall (1970) formalizaron la búsqueda con coste: se acepta lo que supere un **valor de reserva** que depende del coste de seguir buscando. Se incluye en el código (`reservationValue`) como vínculo entre coste y exigencia.
- Gilbert y Mosteller (1966) y Ferguson (1989) tratan el «problema de la secretaria» (parada óptima con rangos relativos). Se menciona como alternativa; el modelo actual usa valores cardinales.
- Miller y Todd (1998) y Todd y Gigerenzer (2000) llevaron estas ideas a la elección de pareja con heurísticas simples.

### 2.3 bis Modelos computacionales cercanos (los antecedentes más próximos)

- **Conroy-Beam (2024)** modela la búsqueda de pareja como un problema de **exploración–explotación** (bandidos multibrazo) con simulaciones de agentes y una muestra de k = 522 díadas reales, en entornos de búsqueda ruidosos. Es el antecedente metodológico más cercano: trata justamente el compromiso entre evaluar mejor a una persona y explorar alternativas.
- **Simão y Todd (2002)** modelan la elección de pareja monógama con **cortejo**: los agentes pueden *cambiarse a mejores parejas cuando aparecen* y comparan estrategias (búsqueda secuencial con niveles de aspiración frente a otras). Es el antecedente más próximo del «cambio de pareja» simulado aquí.

**Implicación.** Modelar agentes que buscan y cambian de pareja bajo información ruidosa **ya existe**. Este proyecto no puede reclamar originalidad en eso (ver §4).

### 2.4 Compromiso y alternativas

El modelo de inversión de Rusbult (1980; escala: Rusbult, Martz y Agnew, 1998) explica el compromiso por satisfacción, inversiones y **calidad de las alternativas**. Los metaanálisis (Le y Agnew, 2003; Tran, Judge y Kashima, 2019) encuentran asociaciones sólidas: satisfacción (r ≈ 0,65), inversiones (r ≈ 0,53) y calidad de las alternativas (r ≈ −0,43) con el compromiso. Johnson y Rusbult (1989) mostraron que quienes están más comprometidos **desvalorizan** a las alternativas atractivas; McNulty et al. (2018) encontraron sesgos atencionales y evaluativos que protegen la relación. Spielmann et al. (2013) estudiaron cómo el miedo a estar soltero lleva a conformarse con menos.

**Implicación.** El modelo actual **no incluye compromiso, inversiones ni desvalorización de alternativas**: el agente evalúa alternativas sin ese filtro motivacional. Es una limitación relevante: la literatura sugiere que las personas comprometidas *no* comparan de manera neutra.

### 2.5 Decisión bajo incertidumbre y sesgo de selección

- Kahneman y Tversky (1979) y Tversky y Kahneman (1992): la teoría de las perspectivas, con la aversión a la pérdida. Los parámetros típicos provienen de apuestas, no de parejas.
- Tversky (1972): «eliminación por aspectos», base de los requisitos esenciales como filtro no compensatorio.
- Smith y Winkler (2006): la **maldición del optimizador**: elegir la mejor opción según estimaciones ruidosas produce una evaluación sistemáticamente inflada. Es el fundamento estadístico de la sobreestimación del elegido.
- Berger y Calabrese (1975): la teoría de reducción de la incertidumbre en interacciones iniciales, que apoya modelar la información como algo que crece con el contacto.

### 2.6 Adaptación, previsión afectiva y comparación

- Wilson et al. (2000) y Wilson y Gilbert (2005): el *focalismo* y los errores de previsión afectiva; inspiran el mecanismo de foco en lo que falta (γ), aunque su forma funcional aquí es una decisión de diseño.
- Lucas et al. (2003) estudian la adaptación a cambios de estado civil; Jacobs Bao y Lyubomirsky (2013) aplican el modelo de prevención de la adaptación hedónica a las relaciones. Inspiran la bonificación de novedad que decae (ν, τ).
- Festinger (1954) y Lyubomirsky y Ross (1997): comparación social.

Dos referencias clásicas sobre adaptación (Brickman y Campbell, 1971; Frederick y Loewenstein, 1999) figuran como **pendientes de verificación** (capítulos sin DOI localizado).

### 2.7 Preferencias declaradas y reveladas

Eastwick y Finkel (2008), Todd et al. (2007), Hitsch, Hortaçsu y Ariely (2010) y Fisman et al. (2006) comparan lo que las personas dicen que quieren con lo que eligen. Joel, Teper y MacDonald (2014) analizan cómo las personas sobrestiman su disposición a rechazar parejas potenciales. Joel et al. (2017, 2020) aplican aprendizaje automático a la atracción inicial y a la calidad de las relaciones. Bruch y Newman (2018) estudian la persecución «aspiracional» de parejas en plataformas. **Estos trabajos son la base del plan de validación** ([`plan-validacion-empirica.md`](plan-validacion-empirica.md)).

### 2.8 Metodología de modelos basados en agentes

Grimm et al. (2010) proponen el protocolo ODD para describir modelos basados en agentes de forma reproducible; [`metodologia.md`](metodologia.md) sigue su estructura. Gigerenzer y Goldstein (1996) discuten la racionalidad acotada en modelos computacionales.

## 3. Qué diferencia posible tiene este proyecto

| Aspecto | Antecedentes | Este proyecto |
|---|---|---|
| Elegir al mejor de varios con datos ruidosos infla la elección | Smith y Winkler (2006), literatura general | Se muestra con ecuación verificada contra simulación, en contexto de cambio de pareja |
| Búsqueda y cambio de pareja con agentes | Simão y Todd (2002); Conroy-Beam (2024) | Aquí el foco es comparar *agentes que corrigen* con *agentes que no*, y **aislar** mecanismos uno por uno |
| Sobrecarga en parejas | D'Angelo y Toma (2017); Pronk y Denissen (2020); Thomas et al. (2022) | Se examina qué ocurre con el *bienestar verdadero* simulado (que en estudios reales no se observa) |
| Herramienta | Modelos publicados, a menudo sin código abierto ejecutable en el navegador | Código abierto en JS, pruebas, experimentos reproducibles y una calculadora didáctica |

## 4. Evaluación honesta de la novedad

1. **No hay teoría nueva.** La «paradoja de la elección de pareja» descrita en la idea inicial es una combinación de selección sobre estimaciones ruidosas (Smith y Winkler, 2006), sobrecarga (con evidencia mixta), focalismo y adaptación. No se propone un mecanismo que no esté ya en la literatura.
2. **Modelos de búsqueda y cambio de pareja con agentes ya existen** (Simão y Todd, 2002; Conroy-Beam, 2024). En la búsqueda acotada de este proyecto **no se localizó** un modelo que haga exactamente el contraste «agente que corrige vs. agente que no» con ablación de mecanismos psicológicos para el caso de cambio de pareja actual; **eso no prueba que no exista** y debe comprobarse con una revisión sistemática.
3. **Contribución defendible hoy:** (a) la implementación abierta y verificable; (b) la separación explícita de lo que explica la estadística de selección frente a lo que exige supuestos psicológicos; (c) los escenarios en que el resultado *contradice* la intuición inicial (ver [`resultados-exploratorios.md`](resultados-exploratorios.md)); (d) la herramienta didáctica.
4. **Qué habría que demostrar para una contribución teórica:** que algún mecanismo no capturado por los modelos existentes (por ejemplo, focalismo + novedad en pares conocido/nuevo) predice mejor datos reales que las alternativas. Eso requiere datos (ver el plan de validación).
5. **Recomendación de encuadre:** presentar el proyecto como **modelo exploratorio y herramienta didáctica**, no como una teoría nueva.

## 5. Brechas conocidas

- La revisión sistemática no consultó PsycINFO, Scopus ni Web of Science, y no leyó texto completo; ver sus limitaciones.
- Literatura transcultural y sobre parejas del mismo género: el modelo no distingue y la búsqueda estuvo centrada en inglés.
- Siguen pendientes de verificación las referencias marcadas como tales en [`referencias.md`](referencias.md).
