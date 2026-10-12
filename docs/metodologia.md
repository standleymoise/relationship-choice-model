# Metodología

Descripción de la simulación siguiendo la estructura del protocolo ODD (Grimm et al., 2010) y de cómo se comprueba que los resultados son reproducibles.

## 1. Propósito

Explorar, con agentes ficticios, bajo qué supuestos comparar una pareja conocida con alternativas poco conocidas lleva a cambios que empeoran el ajuste real, y bajo cuáles no. **No** predice conductas reales ni estima frecuencias en poblaciones.

## 2. Entidades y variables de estado

- **Agente:** tiene `K` pesos de importancia estables (`wᵢ ∝ exp(τ_w·zᵢ)`, `zᵢ ~ N(0,1)`), una pareja actual y un tipo (bayesiano o ingenuo).
- **Persona (pareja o candidato):** valores verdaderos `xᵢ ~ N(μ, σ₀²)` por factor (independientes), una suma de observaciones ruidosas, número de observaciones `n` y edad de la relación.
- **Mundo:** población ilimitada de candidatos; cada uno se genera con un flujo aleatorio propio.

## 3. Escalas

Un período es una unidad abstracta (no se calibra a semanas ni meses). La utilidad se mide en «puntos» de una escala nominal con media 50 y desvío 15 en la población ficticia. Los valores no se truncan en 0–100, para que la actualización bayesiana sea exacta.

## 4. Proceso de cada período

Ver [`modelo-matematico.md` §9](modelo-matematico.md). Orden: la pareja actual aporta información → el agente conoce candidatos → evalúa admisibilidad y utilidad neta → cambia o no → se registra el ajuste verdadero y la satisfacción percibida.

## 5. Aleatoriedad, semillas y reproducibilidad

- Generador: `mulberry32` con semilla derivada por hash (FNV-1a + mezcla de MurmurHash3) de una lista de partes, p. ej. `[semilla, corrida, 'persona', id]` (`src/rng.js`). Normales por Box–Muller. No es criptográfico.
- **Cada corrida y cada persona tienen su propio flujo.** Consecuencias comprobadas con pruebas: (a) misma configuración y semilla → resultados idénticos; (b) el orden de ejecución de corridas o experimentos no cambia nada; (c) dos agentes distintos con la misma semilla enfrentan **exactamente el mismo mundo** (comparación pareada).
- Los archivos de `experiments/results/` no llevan marcas de tiempo: repetir `npm run experiments` con el mismo código debe dar archivos idénticos. `npm run experiments -- --check` y la prueba `tests/experiments.test.js` lo verifican.
- **Qué NO se afirma:** idéntico bit a bit en cualquier motor de JavaScript. Los resultados se redondean a 6 decimales antes de guardarse; si una función matemática del motor diera diferencias de última cifra, podrían alterarse decisiones discretas en casos límite. La integración continua ejecuta la comparación en Linux y Windows con varias versiones de Node: ese es el contraste real.

## 6. Métricas y estadística

- Por corrida: cambios, cambios que empeoran, ganancia verdadera por cambio, sobreestimación al elegir, ajuste verdadero medio, bienestar vs. no cambiar, coste monetario, satisfacción percibida.
- **Resumen entre corridas:** media, desvío, error estándar e intervalo de 95 % (normal). Las métricas *por cambio* (proporción que empeora, ganancia, sobreestimación) se calculan **por evento** con un estimador de razón y error estándar agrupado por corrida (`summarizeRatio`). **Corrección registrada:** una primera versión promediaba promedios por corrida y daba una sobreestimación bayesiana de −0,9 (la teoría predice 0), porque el número de cambios de una corrida depende de resultados anteriores. Se detectó comparando con el cálculo por evento (0,03) y se corrigió; está cubierto por una prueba.
- Los intervalos reflejan solo la variabilidad de simulación. **No** incorporan incertidumbre sobre la forma del modelo ni sobre los parámetros (que son decisiones de diseño).

## 7. Pruebas automatizadas

`npm test` (Node, sin dependencias) ejecuta pruebas de:

- **Funciones matemáticas y casos límite:** distribución normal contra valores tabulados, valor esperado del máximo de N normales (exacto para N = 2), normalización de pesos (todos 0 → indefinido), posterior (n = 0, n → ∞, monotonía), probabilidades, valor de reserva (contra integración numérica independiente), pesos de foco, utilidad de cambio (ejemplo 80–20 con números a mano).
- **Calculadora de dos personas:** reproduce el escenario determinista, tratamiento de factores desconocidos, filtro esencial, simetría entre A y B, pesos en cero.
- **Simulación:** validación de configuración, reproducibilidad, orden de ejecución, mismo mundo para agentes distintos, **contraste con la fórmula analítica de la maldición del ganador** (sesgo del ingenuo = fórmula dentro de 4 errores estándar; sesgo del bayesiano = 0), efecto de la información, monotonías esperadas (umbral esencial, aversión a la pérdida, calidad de la pareja inicial), estimador por evento.
- **Reproducibilidad de los experimentos guardados.**

`npm run check` revisa sintaxis, JSON, secretos evidentes y que el HTML autónomo esté al día.

## 8. Cómo ejecutar

```bash
node --version            # 20 o superior
npm test                  # pruebas
npm run check             # verificaciones básicas
npm run experiments       # regenera experiments/results/
npm run experiments -- --check   # solo compara con lo guardado
node experiments/scripts/escenario-80-20.js
node scripts/tablas-resultados.js   # regenera docs/tablas-resultados.md
```

Para el simulador: abrir `simulator/simulador-autonomo.html` con doble clic (funciona sin servidor) o `simulator/index.html` desde cualquier servidor estático.

## 9. Cómo cambiar un parámetro por vez

Cada archivo de `experiments/configuraciones/` tiene `base` (configuración común), `sweep` (el único parámetro que varía, con sus valores) y `series` (agentes o condiciones comparadas). Todos los parámetros disponibles y sus valores por defecto están en `DEFAULTS` de `src/simulation.js`. Para un experimento nuevo, copiar un archivo, cambiar `name`, `sweep` y `seed`, y ejecutar `npm run experiments`.

## 10. Registro de decisiones tomadas después de ver resultados

Para no esconder el «jardín de caminos que se bifurcan»:

1. **Filtro esencial aplicado a la pareja actual → eliminado.** La primera versión lo aplicaba también a A; si A lo incumplía el agente cambiaba a cualquier candidato admisible sin comparar el ajuste global, lo que producía más arrepentimiento al subir el umbral. Era un artefacto del diseño, no un hallazgo.
2. **Métricas por cambio por evento en lugar de por corrida** (ver §6).
3. **Comparación (η) sobre impresión sin corregir añadida como variante** tras observar que la definición con media corregida producía un efecto casi nulo (−0,01 puntos). Se conservan ambas en H5 para mostrar la sensibilidad.
4. **Parámetro `initialQualityShift` añadido** tras advertir que la historia 80–20 supone una pareja actual mejor que la típica, y que con una pareja actual típica no hay motivo para quedarse.

Los experimentos ya publicados no se reutilizan como «confirmación»: son exploratorios.
