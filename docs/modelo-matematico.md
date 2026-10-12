# Modelo matemático (versión 0.2)

> **Estado:** modelo exploratorio. Ninguna ecuación de este documento es una ley psicológica ni está validada con datos de personas. Cada regla de decisión es un **supuesto de diseño** que se puede discutir, cambiar o rechazar. El código que implementa estas ecuaciones está en [`src/model.js`](../src/model.js) y [`src/simulation.js`](../src/simulation.js) y tiene pruebas automatizadas.

## 1. Qué se modela (y qué no)

Una persona («el agente») tiene una pareja actual **A** y conoce, de a poco, a otras personas **B** con las que podría cambiar. Se quiere responder una pregunta acotada:

> Si compara lo que ve de A con lo que ve de B, y de B sabe poco, ¿bajo qué supuestos esa comparación lleva a cambiar cuando no convenía —y bajo cuáles no?

No se modela la reciprocidad (la otra persona no decide), ni el contexto, ni las emociones, ni la cultura. No se modela el «80–20» como una proporción real: es un caso particular de una configuración de pesos (sección 8).

## 2. Variables y escalas

| Símbolo | Significado | Escala |
|---|---|---|
| `i = 1…K` | factor de compatibilidad (honestidad, proyecto de vida, atracción…) | — |
| `E ⊂ {1…K}` | factores **esenciales** (requisitos; ver §5) | — |
| `wᵢ` | importancia del factor para el agente | `wᵢ ≥ 0`, se normaliza a `Σwᵢ = 1` |
| `xᵢⱼ` | valor **verdadero** de la persona `j` en el factor `i` (el agente no lo observa) | puntos; escala nominal 0–100, sin truncar |
| `yᵢⱼ,ₖ` | `k`-ésima observación (impresión) de ese factor | `yᵢⱼ,ₖ = xᵢⱼ + εₖ` |
| `nⱼ` | unidades de información sobre `j` (citas, conversaciones) | entero ≥ 0 |
| `μ, σ₀` | media y desvío del valor verdadero en la población | decisiones de diseño: 50 y 15 |
| `σ` | ruido de cada observación | decisión de diseño: 15 |
| `mᵢⱼ` | valor **percibido** (lo que el agente cree) | puntos |
| `θ, p_min` | umbral y probabilidad mínima de los esenciales | diseño: 35 y 0,5 |
| `γ` | foco en lo que le falta a A | `γ ≥ 0` (0 = apagado) |
| `λ` | aversión a la pérdida | `λ ≥ 1` (1 = apagada) |
| `ν, τ` | bonificación de novedad y su decaimiento | puntos y períodos (0 = apagada) |
| `η` | arrastre de la satisfacción por comparación | `η ≥ 0` (0 = apagado) |
| `a` | nivel de aspiración | puntos |
| `c_cambio` | coste psicológico o de transición de cambiar | puntos |
| `c_cita` | coste monetario por unidad de información | **unidades monetarias, separadas de la utilidad** |

Por qué cada factor se incluye: los factores son ejemplos genéricos (respeto, honestidad, comunicación, proyecto de vida, atracción, intereses, aspectos prácticos). **Que un factor esté en la lista no es una afirmación de que sea importante**: el peso `wᵢ` lo decide quien usa el modelo. Los factores físicos o económicos se tratan como cualquier otro: una preferencia posible, no un indicador del valor de una persona.

## 3. Utilidad de una persona (compensatoria)

```
U(j) = Σᵢ wᵢ · mᵢⱼ ,    Σᵢ wᵢ = 1
```

En lenguaje común: un promedio de lo que el agente cree que la persona ofrece en cada factor, ponderado por cuánto le importa cada uno. Es **compensatorio**: un factor alto compensa uno bajo. Por eso los requisitos esenciales **no** entran aquí (§5).

*Ejemplo numérico (caso «80–20» ilustrativo).* Pesos 80 % en el grupo G1 y 20 % en el grupo G2. A vale 85 en G1 y 45 en G2: `U(A) = 0,8·85 + 0,2·45 = 77`. B observada vale 75 en G1 y 85 en G2: `U(B) = 0,8·75 + 0,2·85 = 77`. Empate exacto. (Los valores 85/45 y 75/85 son inventados para el ejemplo; el empate depende de ellos.)

Si todos los pesos son 0, la utilidad es **indefinida** y el código devuelve `null`, no 0.

## 4. Información e incertidumbre (por qué «poco conocida» importa)

El valor verdadero `x` es desconocido. Se modela con una previa normal y observaciones ruidosas:

```
x ~ N(μ, σ₀²)                     (previa: cómo es una persona típica)
yₖ = x + εₖ ,  εₖ ~ N(0, σ²)      (k = 1…n impresiones, media ȳ)
```

La posterior es normal (conjugada) con

```
precisión  = 1/σ₀² + n/σ²
media m    = ( μ/σ₀² + n·ȳ/σ² ) / precisión
desvío     = precisión^(−1/2)
fiabilidad = (n/σ²) / precisión          (cuánto pesan los datos frente a la previa)
```

En lenguaje común: con pocos datos, la mejor estimación **se encoge hacia lo típico**; con muchos, sigue a los datos. Con `n = 0` la estimación es la previa: **desconocer no equivale a «50»**; se conserva la incertidumbre completa (el simulador anterior confundía ambas cosas).

*Ejemplo:* `μ = 50`, `σ₀ = σ = 15`. Una impresión (`n = 1`) de 80 da `m = 65` (la fiabilidad es 0,5). Ocho impresiones de 80 dan `m = 76,7`.

Dos tipos de agente, que ven exactamente los mismos datos:

- **Bayesiano:** usa `m` (la media posterior).
- **Ingenuo:** usa `ȳ` tal cual, como si la impresión fuera la verdad.

Que existan personas «ingenuas» en este sentido es una **pregunta empírica**; aquí es un agente de contraste, no una afirmación sobre la gente.

## 5. Requisitos esenciales (no compensatorios)

Un candidato `B` es **admisible** si para todo factor esencial `i ∈ E`:

```
P( xᵢ,B ≥ θ | datos ) ≥ p_min
```

Si no es admisible, no se considera, **sin importar cuán alta sea su utilidad**. Es una regla de eliminación (inspirada en la «eliminación por aspectos» de Tversky, 1972; ver [antecedentes](antecedentes.md)). Con `p_min = 0,5` equivale a exigir que la media posterior supere `θ`. Con poca información la probabilidad se acerca a la de la previa, de modo que un requisito esencial desconocido no se da por cumplido ni por incumplido.

La pareja actual **no** se somete a este filtro en la simulación (§9.3).

## 6. Comparación de alternativas y decisión de cambio

Aquí entran los mecanismos «psicológicos», **todos apagados por defecto**.

**Foco en lo que falta (γ).** Los factores donde A queda por debajo de la aspiración `a` ganan peso al comparar:

```
wᵢ′ ∝ wᵢ · ( 1 + γ · max(0, a − mᵢ,A) / 100 )         (se renormaliza)
```

El mismo vector `w′` se aplica a A y a B: ambos se puntúan con el mismo criterio. Inspirado en el «focalismo» (Wilson et al., 2000), pero **la forma funcional es una decisión de diseño**.

**Ganancias y pérdidas (λ).** Se mide cuánto se gana y cuánto se pierde factor por factor al pasar de A a B:

```
G = Σᵢ wᵢ′ · max( mᵢ,B − mᵢ,A , 0 )
L = Σᵢ wᵢ′ · max( mᵢ,A − mᵢ,B , 0 )
neto = G − λ·L + [ν·e^(−edad_B/τ) − ν·e^(−edad_A/τ)]
```

Con `γ = 0`, `λ = 1` y `ν = 0` resulta `neto = U(B) − U(A)`. Con `λ > 1` las pérdidas pesan más que las ganancias (tendencia a quedarse). El valor típico `λ ≈ 2,25` proviene de estudios de apuestas monetarias (Tversky y Kahneman, 1992); **no hay estimación para parejas**.

**Novedad (ν, τ).** Una persona recién conocida recibe una bonificación que decae con el tiempo de relación. Es el mecanismo del «brillo de lo nuevo»; su existencia y magnitud en parejas son una pregunta empírica (la adaptación hedónica en el matrimonio se discute en Lucas et al., 2003).

**Regla.** El agente cambia a la mejor alternativa admisible si `neto > c_cambio`.

*Ejemplo numérico (agente ingenuo, `n_B = 1`, escenario 80–20 ilustrativo).* Con `γ = 0, λ = 1`: `neto = 0` (empate; se queda). Con `γ = 3`: el grupo G2, donde A está en 45 por debajo de la aspiración 70, pasa a pesar más (peso efectivo ≈ 0,30 en vez de 0,20) y `neto = +5,2`: **cambia**. Pero la esperanza matemática del cambio en el valor verdadero (corrigiendo por incertidumbre) es **−10,5** puntos: el agente cambió contra lo que decían sus propios datos bien interpretados. Reproducible con la calculadora o con [`experiments/results/escenario-80-20.json`](../experiments/results/escenario-80-20.json).

## 7. Maldición del ganador (resultado analítico)

Si se elige el mejor de `N` candidatos según el valor *observado*, el elegido está inflado por el ruido. Con `V ~ N(μ, σ_v²)` y observación `V + e`, `e ~ N(0, σ_e²)`, `s² = σ_v² + σ_e²`:

```
E[ observado − verdadero | elegido ] = (σ_e² / s) · E[ máx de N normales estándar ]
E[ verdadero | elegido ]             = μ + (σ_v² / s) · E[ máx de N normales estándar ]
```

(Es el «optimizer's curse» de Smith y Winkler, 2006.) Consecuencias: el sesgo **crece con el ruido** (poca información) y **con N** (más opciones), y es **cero** para quien corrige con la posterior. Las pruebas automatizadas comprueban que la simulación reproduce esta fórmula (`tests/simulation.test.js`).

*Ejemplo:* `σ_v = σ_e = 15`, `N = 5`: `s = 21,2`, `E[máx de 5] = 1,163`; el sesgo esperado es `225/21,2 · 1,163 = 12,3` puntos, y el valor verdadero esperado del elegido es `50 + 12,3 = 62,3`, no `74,7`.

Esto es **estadística de selección**, no un hecho psicológico: demuestra que la comparación con muchas alternativas poco conocidas *infla* la alternativa elegida si no se corrige, no que las personas la cometan.

## 8. El «80–20» como parámetro

En la metáfora original, una pareja cubre el 80 % de lo que importa y otra parece cubrir el 20 % restante. En el modelo eso es una configuración de pesos: dos grupos de factores G1 (peso `1−s`) y G2 (peso `s`), con `s = 0,2` como caso particular. **No hay nada especial en 0,2**: el script [`experiments/scripts/escenario-80-20.js`](../experiments/scripts/escenario-80-20.js) barre `s` de 0,05 a 0,5 y muestra en qué punto la decisión se invierte, según el tipo de agente, `λ`, `γ` y la información sobre B. Los resultados están en [`resultados-exploratorios.md`](resultados-exploratorios.md).

## 9. Simulación de agentes

### 9.1 Un período

1. La pareja actual aporta una unidad más de información (`n += 1`, `edad += 1`).
2. El agente conoce `e` candidatos nuevos con `n₀` unidades de información cada uno (tiempo de búsqueda; opcionalmente solo si su satisfacción percibida está por debajo de `a`).
3. Para cada candidato admisible calcula `neto`; elige el mejor; cambia si `neto > c_cambio`.
4. Se registra el **ajuste verdadero** `Σ wᵢ·xᵢ` de la pareja con la que termina el período, una cantidad que solo existe en la simulación.

### 9.2 Costes (separados de la psicología)

El dinero de las citas (`c_cita · n₀` por candidato) se acumula en un registro **aparte**: no entra en la utilidad ni en la compatibilidad. Solo si se define una conversión `κ` (dinero → puntos), arbitraria, se calcula un «ajuste neto de costes». Esta conversión no tiene fundamento empírico: el coste económico de una cita no dice nada sobre la compatibilidad.

### 9.3 Decisiones de diseño

- La pareja actual está exenta del filtro esencial. *Motivo:* aplicarlo hacía que, cuando A lo incumplía, el agente cambiara a cualquier candidato que pasara el filtro sin comparar el ajuste global; era un artefacto de mi primera implementación, detectado al ver los resultados (ver [limitaciones](limitaciones.md)).
- Cada persona tiene su propio flujo aleatorio (semilla + identificador), de modo que agentes distintos enfrentan **exactamente el mismo mundo** (mismos candidatos, mismo ruido): las comparaciones entre agentes son pareadas.
- Los factores son independientes y normales, sin truncar. Con ello la posterior es exacta.

### 9.4 Métricas «por cambio»

«Proporción de cambios que empeoran», «ganancia verdadera por cambio» y «sobreestimación al elegir» se calculan **por evento** (todos los cambios de todas las corridas, con error estándar agrupado por corrida). Promediar promedios por corrida pesa igual a corridas con 1 y con 20 cambios y sesga el resultado; esa definición inicial dio una sobreestimación bayesiana de −0,9 en lugar de 0 y se corrigió (ver [metodología](metodologia.md)).

## 10. Parámetros: decisiones de diseño y parámetros estimables

| Parámetro | Naturaleza | Cómo podría estimarse |
|---|---|---|
| `μ, σ₀` (población previa) | **diseño** (50, 15) | no necesitan estimarse: fijan la escala |
| `σ` (ruido de impresiones) | diseño; **estimable** | fiabilidad test-retest de impresiones iniciales y concordancia con juicios posteriores |
| `wᵢ` (importancias) | **estimable por persona** | comparar preferencias declaradas con elecciones observadas (Eastwick y Finkel, 2008; Hitsch et al., 2010) |
| `θ, p_min` | diseño; estimable | entrevistas sobre «innegociables» frente a conducta real |
| `γ` (foco) | diseño; **estimable** | experimentos que manipulen la saliencia de lo que falta |
| `λ` (pérdida) | diseño; estimable | tareas de elección con costes de cambio |
| `ν, τ` (novedad) | diseño; estimable | seguimiento longitudinal de la satisfacción tras conocer a alguien |
| `η` (comparación) | diseño; estimable | experimentos con exposición controlada a alternativas |
| `c_cambio, κ` | diseño | — |

## 11. Modelos alternativos considerados

| Alternativa | Qué haría distinto | Por qué no se eligió en esta versión |
|---|---|---|
| Problema de la secretaria (Gilbert y Mosteller, 1966; Ferguson, 1989) | Parada óptima con rangos relativos, sin volver atrás | No usa valores cardinales ni información parcial; útil como referencia teórica |
| Valor de reserva (Stigler, 1961; McCall, 1970) | Acepta al primero que supere un umbral que depende del coste | Se incluye como función (`reservationValue`) para relacionar coste y exigencia, no como agente |
| Heurísticas de satisfacción (Simon, 1955; Todd y Miller) | Umbral fijo de aspiración | Es el nivel de aspiración `a` del modelo |
| Utilidad no lineal o con complementariedades | Interacciones entre factores | Añade parámetros sin datos que los ajusten |
| Modelos de cambio de pareja con reciprocidad (mercados) | Ambos deciden | Fuera del alcance de una primera versión |

## 12. Referencias y verificación

Las referencias citadas están en [`referencias.md`](referencias.md) y se verifican con `node scripts/verificar-referencias.js`. Las que no se pudieron verificar están marcadas como pendientes y el proyecto no se apoya en ellas.
