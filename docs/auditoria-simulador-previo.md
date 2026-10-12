# Auditoría del simulador previo

**Archivo auditado:** `simulador_compatibilidad_pareja.html` (327 líneas, 32 849 bytes, versión autodenominada «experimental 0.1»).
**Método:** lectura completa del código más comprobaciones numéricas ejecutadas con Node 24 sobre las funciones y datos reales del archivo (extraídos sin modificarlos). Las cifras citadas abajo salen de esas ejecuciones.
**Alcance:** esta auditoría describe lo que el código hace, no si el modelo es correcto científicamente.

## Resumen

El simulador tiene una interfaz cuidada y advertencias prudentes en los textos, pero **varias funciones que anuncia no están implementadas**: los límites personales no limitan nada, la confianza en los datos no entra en ningún cálculo y la pestaña «Paradoja 80–20» no modela ninguna paradoja ni ninguna proporción 80–20. Además, la curva del gráfico está construida de modo que ya contiene la conclusión que parece mostrar.

## 1. Errores críticos

Son discrepancias entre lo que el programa afirma y lo que hace.

| # | Hallazgo | Evidencia |
|---|----------|-----------|
| C1 | **Los «límites personales» (dealbreakers) son decorativos.** Se guardan en `state.dealbreakers` y se pueden marcar, pero ningún cálculo los lee. El texto afirma que «una puntuación alta no compensa una falta de respeto o una incompatibilidad esencial», y eso no es cierto en el código. | `dealbreakers` aparece solo en las líneas 237, 254 y 255 (definición, render y escritura). Con respeto y consentimiento marcados como no negociables, una persona con 100 en todo salvo respeto, consentimiento y honestidad = 0 obtiene **89/100**. |
| C2 | **Los requisitos esenciales no se distinguen de los deseables en el cálculo.** Todo entra en un promedio ponderado totalmente compensatorio. «Esencial» solo cambia una etiqueta y un peso sugerido. La métrica «Valores esenciales» mezcla las categorías `essential` y `core`, por lo que la etiqueta no describe lo que calcula (hay 6 factores `essential`, 44 en total). | `score()`, línea 259. Dos de los seis límites de la interfaz (`violence`, `addiction`) ni siquiera tienen un factor asociado. |
| C3 | **La «confianza en los datos» se muestra pero no se puede editar ni afecta nada.** Valores fijos A = 65 %, B = 45 %, sin control en pantalla. Con confianza de B = 0 el puntaje no cambia. | `state.confidence` aparece en la línea 237 y se lee solo para mostrarla (línea 260). Es el centro de la hipótesis (información desigual entre la pareja actual y la nueva), y no está modelado. |
| C4 | **«Desconocido» se confunde con «neutro».** La ayuda dice «usá 50 como desconocido», pero 50 es también un valor legítimo. El modelo no distingue ignorancia de evaluación media, y tampoco ajusta un valor incierto hacia una expectativa previa. | Texto de la línea 70; `score()` trata todo valor como medición exacta. |
| C5 | **El slider de incertidumbre tiene semántica contradictoria y no entra en los puntajes.** Se describe como «cuánto penalizás lo desconocido» y como «tolerancia a la incertidumbre» (conceptos opuestos). En la simulación, subirlo **reduce** la «incertidumbre relativa» (55 → 40 → 18 con el slider en 0, 40 y 100). No modifica los puntajes de A y B. | Líneas 122–123, 298. |
| C6 | **La pestaña «Paradoja 80–20» no modela la paradoja.** No hay agentes, ni candidatos con puntajes, ni cambio de pareja, ni proporción 80/20 en el código. Está desconectada de la pestaña de compatibilidad. La «presión comparativa» `P = (1−e^(−a(N−1)))·C·(1−I)` con `a = 0,14` es una fórmula inventada que no representa ninguna decisión. El id interno de la métrica es `regret`, un constructo que la fórmula no mide. | Líneas 293–299. El «80» aparece solo como valor por defecto de un slider (línea 143) y en un texto de ayuda (línea 166). |
| C7 | **La curva del gráfico presupone el resultado.** «Valor percibido» = `48 + 35x − 12·ideal·P`, con pendiente fija +35: crece siempre con la información, para cualquier parámetro. La segunda línea («Información conocida») es la identidad `y = x`. El eje X no tiene etiqueta. Mostrar esto bajo el título «Cómo cambia el valor percibido al conocer más» puede leerse como un resultado cuando es una asunción dibujada. | Líneas 305–308. Con N = 30, C = 1, I = 0: la curva va de 36,2 a 71,2, siempre creciente. |
| C8 | **Los datos de ejemplo están construidos para contar la historia del 80–20** (A fuerte en valores y compromiso, B fuerte en atracción, química y economía) y no se declaran como inventados. Los resultados por defecto (A 72,4 contra B 71,6) parecen un hallazgo. | Líneas 238–240. |

## 2. Mejoras necesarias

| # | Hallazgo |
|---|----------|
| N1 | **Autoinyección HTML.** Los nombres A/B se insertan con `innerHTML` en `#warnings` (línea 278) sin escapar. La función `esc()` está definida (línea 243) y no se usa. Solo afecta a quien escribe el nombre en su propio navegador, pero es un error real. |
| N2 | **Discrepancia entre estado y pantalla.** Si se escribe 150 en un campo, el estado guarda 100 pero el campo sigue mostrando 150, y el CSV exporta 100. Un campo vacío conserva el valor anterior sin avisar. |
| N3 | **Pesos todos en 0 → 0/100.** La división está protegida, pero el resultado correcto es «indefinido», no cero. |
| N4 | **El CSV no es reproducible.** Exporta factor, categoría (código interno: `essential`, `core`, `preference`), peso y valores, pero no los nombres de A y B, ni el grupo, ni umbral, límites, confianza, parámetros de la simulación o versión del modelo. Los valores sí coinciden con el estado (salvo lo señalado en N2). |
| N5 | **«Lo que más pesa» no muestra lo que dice.** Ordena por `peso × (A+B)/2`, que refleja sobre todo el peso, y muestra el promedio de A y B en lugar de la contribución normalizada de cada uno. Más útil: los factores que explican la **diferencia** entre A y B, `w·(x_B − x_A)/Σw`. |
| N6 | **Advertencias con umbrales arbitrarios y tono normativo** (por ejemplo, avisar si `height > 5` o `attraction > 8`). Elegir qué pesos son «sospechosos» es un juicio de valor del autor, no un resultado del modelo. |
| N7 | **Clase CSS elegida por búsqueda de texto** (`n.includes('por debajo')`, línea 278). Frágil. |
| N8 | **Se compara una pareja conocida con una nueva sin ajustar por información.** El texto lo advierte («no siempre tienen el mismo nivel de información») pero el cálculo ignora la advertencia. Es el mismo problema que C3. |
| N9 | **44 factores solapados** (honestidad, confianza, fidelidad, respeto, límites…) provocan doble conteo y puntajes saturados. Es una decisión de diseño que debe justificarse o reducirse. |
| N10 | **Sin pruebas automatizadas, sin semillas y sin versionado.** El simulador no tiene aleatoriedad, pero tampoco ninguna comprobación de sus funciones. |
| N11 | **Accesibilidad.** `role="tablist"` sin `role="tab"` ni `aria-selected`; el gráfico en canvas no tiene alternativa textual completa ni escala para pantallas de alta densidad. |

## 3. Mejoras opcionales

- Cargar los datos desde un archivo JSON en vez de generarlos con fórmulas (`86 − (i%7)·7`).
- Permitir importar/exportar un escenario completo (parámetros, semilla, resultados).
- Moneda configurable (hoy `₡` está fijo) y separar claramente el coste de búsqueda de las variables psicológicas.
- Reducir la dependencia de estilos en línea y separar HTML, CSS y JS en archivos para facilitar pruebas.
- Modo oscuro y mejor contraste en los pills de color.

## 4. Lo que está bien (conservar)

- Los dos candidatos se puntúan con la misma función `score()`, sin asimetría de criterio.
- Las divisiones por cero están protegidas.
- Los textos advierten que no es una prueba validada ni una predicción, y que el dinero no mide el valor de una persona. Se conserva ese tono.
- El nombre de la persona se inserta con `textContent` en los puntos principales.
- Ningún dato sale del navegador.

## 5. Consecuencias para el rediseño

1. El centro del modelo debe ser **la percepción desigual**: valor verdadero, valor percibido, información disponible, y sesgo hacia lo nuevo. Sin eso no hay nada que probar.
2. Los requisitos esenciales deben ser **no compensatorios** (umbral mínimo por factor) y los deseables compensatorios.
3. La «paradoja» debe aparecer como un **resultado medible** (frecuencia de cambios que empeoran el bienestar real) que puede salir cero o negativo, no como una curva dibujada.
4. Los datos de ejemplo se rotulan como inventados.
5. Se conservan: la interfaz por pestañas, la cautela de los textos y la ejecución local sin servidor.
