# Hipótesis comprobables

> **Cómo leer este documento.** Cada hipótesis tiene dos partes bien separadas: la **formulación conceptual** (lo que se conjetura, antes de simular) y el **resultado de la simulación** (lo que salió, con sus límites). Un resultado de simulación solo describe lo que hacen **agentes ficticios con reglas programadas**; no es un hallazgo sobre personas reales y no confirma ni refuta nada empírico. Las cifras se generan en [`tablas-resultados.md`](tablas-resultados.md) y se discuten en [`resultados-exploratorios.md`](resultados-exploratorios.md).

## Definiciones comunes

- **Agente bayesiano:** corrige lo que observa por la incertidumbre (posterior). **Agente ingenuo:** toma lo observado como verdadero. Ven los mismos datos.
- **Ajuste verdadero:** `Σ wᵢ·xᵢ` de la pareja actual; existe solo dentro de la simulación.
- **Cambio que empeora:** tras el cambio, el ajuste verdadero es menor que antes.
- **Sobreestimación al elegir:** utilidad percibida de la persona elegida menos su ajuste verdadero.
- **Bienestar vs. no cambiar:** ajuste verdadero medio durante 40 períodos menos el de la pareja inicial.
- Valores por defecto y semillas: en cada archivo de `experiments/configuraciones/`. 500 corridas por punto (1000 en e6).

---

## H1 — Número de alternativas

**Conjetura conceptual.** Cuanto más candidatos se conocen, más cambios y más cambios que empeoran la situación.

| Campo | Contenido |
|---|---|
| Variable independiente | Candidatos conocidos por período (1, 2, 3, 5, 8, 12) |
| Variable dependiente | Cambios; proporción que empeora; sobreestimación al elegir; ganancia verdadera por cambio; bienestar vs. no cambiar |
| Constantes | Información sobre cada candidato (1 unidad), sobre la pareja actual (8), pesos, umbral esencial, mecanismos psicológicos apagados, 40 períodos, semilla 101 |
| Respaldaría H1 | Que, **para el agente que corrige**, la proporción de cambios que empeoran y el bienestar vs. no cambiar empeoren al subir N |
| Refutaría / no respaldaría | Que el bienestar vs. no cambiar **no baje** al subir N, o que las métricas de cambio sean planas |
| Limitaciones | Más candidatos también significa mejor máximo disponible; el coste monetario crece linealmente pero se registra aparte; la información por candidato se supone igual |

**Resultado de la simulación.**

- *Agente ingenuo:* los cambios pasan de 5,9 a 18,0; la sobreestimación al elegir de 5,1 a 7,9 puntos; la ganancia verdadera por cambio baja de 1,42 a 0,59; la proporción de cambios que empeoran sube de 0,425 a 0,473. **Pero el bienestar vs. no cambiar sube** de 7,0 a 10,1.
- *Agente bayesiano:* los cambios casi no varían (3,2 → 4,2), la proporción que empeora es casi plana (≈0,28–0,32), la sobreestimación es 0 y el bienestar sube de 8,1 a 12,5.
- **Estado: respaldada solo en parte.** Más opciones infla más la elección y aumenta el cambio del agente ingenuo (efecto de selección, esperable), **pero en este modelo más opciones no empeora el bienestar verdadero**: lo mejora, porque la persona típica no es especialmente buena. El resultado depende de que la pareja inicial sea típica (ver e7).

---

## H2 — Información incompleta

**Conjetura conceptual.** Cuanto menos se sabe de las alternativas, más se sobrevaloran y peor es el resultado de cambiar.

| Campo | Contenido |
|---|---|
| Variable independiente | Unidades de información por candidato (1, 2, 3, 5, 8, 12) |
| Variable dependiente | Las mismas que H1 |
| Constantes | 3 candidatos por período, información de la pareja actual 8, resto como H1, semilla 102 |
| Respaldaría H2 | Que la sobreestimación y la proporción de cambios que empeoran **bajen** al aumentar la información, para el agente ingenuo |
| Refutaría | Que no cambien, o que suban |
| Limitaciones | El «ruido de las impresiones» (σ = 15) es un supuesto; en la realidad la información no llega en unidades iguales ni independientes; conseguir más información cuesta (se registra aparte) |

**Resultado de la simulación.**

- *Ingenuo:* de 1 a 12 unidades, la sobreestimación baja de 6,21 a 0,83; los cambios de 10,3 a 3,9; la proporción que empeora de 0,449 a 0,175; el bienestar vs. no cambiar sube de 9,3 a 12,8.
- *Bayesiano:* sobreestimación ≈ 0 siempre; la proporción que empeora baja de 0,280 a 0,151 (sigue habiendo arrepentimiento *ex post* por azar, no por sesgo); bienestar de 10,9 a 12,9.
- **Estado: respaldada** dentro del modelo. Es la parte más sólida y la más cercana a una consecuencia matemática (maldición del ganador: el sesgo es proporcional a σ_e²/s).

---

## H3 — Importancia de las preferencias y requisitos esenciales

**Conjetura conceptual.** Si los requisitos esenciales funcionan como filtro no compensatorio, un umbral más alto reduce los cambios que empeoran.

| Campo | Contenido |
|---|---|
| H3a — variable independiente | Umbral mínimo de los 2 factores esenciales (20, 35, 45, 55, 65, 75) |
| H3b — variable independiente | Desigualdad entre las importancias, `weightConcentration` (0 a 2,5) |
| Variable dependiente | Cambios; proporción que empeora; ganancia por cambio; bienestar vs. no cambiar |
| Constantes | Resto por defecto; semillas 103 y 104 |
| Respaldaría H3a | Menos cambios que empeoran **y** que el bienestar no caiga |
| Refutaría H3a | Que la proporción que empeora no baje, o que el filtro elimine buenas oportunidades |
| Limitaciones | El filtro solo se aplica a candidatos (la pareja actual está exenta); los 2 factores esenciales tienen la misma distribución que los demás; `θ` es arbitrario |

**Resultado de la simulación.**

- *H3a:* al subir el umbral de 20 a 75, el agente ingenuo reduce los cambios (11,5 → 1,2), la proporción que empeora baja de 0,462 a 0,284 y la ganancia por cambio sube de 0,89 a 4,44. **Pero el bienestar vs. no cambiar baja** de 9,1 a 3,1: el filtro elimina cambios malos *y buenos*. El agente bayesiano muestra el mismo patrón (en 65: 0,5 cambios, bienestar 1,6).
- *H3b:* concentrar las importancias en pocos factores **no** altera la proporción de cambios que empeoran (≈0,30 bayesiano, ≈0,44 ingenuo) y **aumenta** el bienestar potencial (bayesiano 9,6 → 18,4), porque hay más que ganar si lo que importa varía más entre personas. La sobreestimación del ingenuo crece (5,6 → 10,4) porque las utilidades se vuelven más variables en términos absolutos.
- **Estado: H3a respaldada en la reducción de arrepentimientos, con un coste:** menos cambios malos, pero también menos cambios buenos. H3b: no respalda un efecto sobre el arrepentimiento.

---

## H4 — Expectativas

**Conjetura conceptual.** Elevar las expectativas mínimas aumenta la búsqueda y el cambio, sin mejorar el resultado.

| Campo | Contenido |
|---|---|
| Variable independiente | Nivel de aspiración (40, 50, 55, 60, 65, 70, 80); el agente busca solo si su satisfacción percibida es menor |
| Variable dependiente | Cambios; coste monetario; proporción que empeora; bienestar vs. no cambiar; neto de costes |
| Constantes | Coste de cambio 1 punto; conversión dinero → puntos 0,1 (**arbitraria**); semilla 105 |
| Respaldaría H4 | Más búsqueda y cambios, y bienestar neto que no sube o baja a partir de cierto nivel |
| Refutaría | Que el bienestar neto suba monótonamente con la aspiración |
| Limitaciones | La satisfacción percibida del agente es ~60 en promedio, de modo que aspiraciones de 65 o más *saturan* (el agente siempre busca); la conversión de dinero a puntos no tiene fundamento |

**Resultado de la simulación.**

- Con aspiración baja (40–50) casi no se busca ni se cambia. El bienestar sube hasta unos 60–65 y luego se **estanca** para el bayesiano (9,6 en 65–80) y **baja levemente** para el ingenuo (neto de costes: 9,30 en 60 → 8,44 en 80; proporción que empeora 0,366 → 0,433).
- **Estado: respaldada débilmente.** Subir la exigencia más allá del punto en que ya se busca no mejora el resultado y para el ingenuo lo empeora algo; el efecto es modesto y depende de una conversión de costes inventada.

---

## H5 — Comparación continua

**Conjetura conceptual.** Comparar constantemente con alternativas reduce la satisfacción con la pareja actual aunque no cambie su valor verdadero.

| Campo | Contenido |
|---|---|
| Variable independiente | Peso de la comparación η (0 a 1) y número de alternativas (1, 3, 8) |
| Variable dependiente | Satisfacción percibida con la pareja actual |
| Constantes | Agente bayesiano; resto por defecto; semilla 106 |
| Respaldaría H5 | Satisfacción percibida que baja con η y con el número de alternativas |
| Refutaría | Que no baje |
| Limitaciones | **Bajo este supuesto, el descenso es una consecuencia del mecanismo programado: la simulación mide su magnitud, no lo contrasta con la realidad.** Resultó muy sensible a la definición (ver abajo) |

**Resultado de la simulación.**

- Con la comparación sobre la *impresión inicial sin corregir*, η = 1 reduce la satisfacción percibida en 0,75 (1 alternativa), 1,39 (3) y 2,27 puntos (8). El ajuste verdadero **no cambia** (por construcción).
- Con la comparación sobre la *media corregida*, el efecto es −0,01: **casi nulo**.
- **Estado: no informativa sobre el mundo real.** Muestra que el efecto de «comparar» depende por completo de si se compara con impresiones vívidas o con estimaciones ya corregidas. La definición sin corregir se agregó **después** de ver el resultado nulo de la otra; ese orden se declara en [`limitaciones.md`](limitaciones.md).

---

## Exploratorios (no son hipótesis previas)

- **e6 — Qué mecanismo genera cambios que empeoran.** El agente bayesiano *puro* tiene 28,9 % de cambios que empeoran (ex post, por azar) pero una ganancia verdadera media de +3,2 por cambio. Con *novedad* sube a 16,7 cambios y 48,0 % que empeoran, con ganancia +0,52. Con *foco* se duplican los cambios (8,2). La *aversión a la pérdida* (λ = 2,25) reduce los cambios del ingenuo de 10,4 a 3,1 y **mejora** su bienestar (9,74 vs. 9,10): aquí funciona como protección.
- **e7 — Calidad de la pareja actual.** Es el caso más cercano a la intuición 80–20. Con una pareja actual 15 puntos por encima del promedio, el **agente ingenuo queda por debajo de no cambiar**: −1,96 ± 0,35 puntos de bienestar (con 10 puntos: +0,39 ± 0,44). El bayesiano nunca queda por debajo de cero (0,79 con +15). Es decir: **la intuición inicial se sostiene solo si se combinan dos condiciones: una pareja actual claramente mejor que la típica y un agente que toma las impresiones como verdad.**
- **Escenario 80–20 determinista.** El punto de inversión de la decisión depende de la proporción del peso en lo que falta y de `γ`, `λ` y la información sobre B; no hay nada especial en 80/20 ([resultados](resultados-exploratorios.md)).
