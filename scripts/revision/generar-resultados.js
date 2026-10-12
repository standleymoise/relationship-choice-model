#!/usr/bin/env node
'use strict';
/* Genera docs/revision-sistematica/resultados.md a partir de datos/sintesis.json y datos/incluidos-doi.json. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const D = path.join(ROOT, 'docs', 'revision-sistematica', 'datos');
const S = JSON.parse(fs.readFileSync(path.join(D, 'sintesis.json'), 'utf8'));
const doi = JSON.parse(fs.readFileSync(path.join(D, 'incluidos-doi.json'), 'utf8'));
const busq = JSON.parse(fs.readFileSync(path.join(D, 'registro-busquedas.json'), 'utf8'));

const dc = S.decisiones;
const sum = (k) => ['A', 'B', 'C', 'Ccontrol'].reduce((a, q) => a + dc[q][k], 0);
const doiCount = {};
Object.values(doi).forEach((v) => { doiCount[v] = (doiCount[v] || 0) + 1; });
const fromC = dc.C.incluidos + dc.Ccontrol.incluidos;
const nControl = S.preclasificacion.muestraControlDeC;
const pCtl = dc.Ccontrol.incluidos / nControl;
// Intervalo de Wilson 95 %
const z = 1.96;
const wilson = (k, n) => { const p = k / n; const c = (p + (z * z) / (2 * n)) / (1 + (z * z) / n); const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / (1 + (z * z) / n); return [c - h, c + h]; };
const [lo, hi] = wilson(dc.Ccontrol.incluidos, nControl);
const pct = (x) => (100 * x).toFixed(1).replace('.', ',') + ' %';

// Apellido del primer autor a partir de formatos como "Conroy-Beam D.", "Todd PM", "T. Hills" o "Daniel Conroy-Beam".
function apellido(autores) {
  const t = autores.split(';')[0].trim().split(/\s+/);
  if (t.length === 1) return t[0];
  if (/^[A-Z]\.?$/.test(t[0]) || /^[A-Z]\.[A-Z]?\.?$/.test(t[0])) return t[t.length - 1];
  if (/^[A-Z]{1,3}\.?$/.test(t[t.length - 1])) return t[0];
  return t[t.length - 1];
}

const sym = { si: '●', parcial: '◐', no: '○', '?': '?' };
const models = S.modelos.slice().sort((a, b) => {
  const score = (m) => ['M3', 'M2', 'M1'].reduce((s, k, i) => s + (m[k] === 'si' ? 3 : m[k] === 'parcial' ? 1 : 0) * Math.pow(10, 2 - i), 0);
  return score(b) - score(a) || a.anio - b.anio;
});
const modelRows = models.map((m) => `| ${apellido(m.autores)} (${m.anio}) | ${m.titulo.length > 70 ? m.titulo.slice(0, 67) + '…' : m.titulo} | ${sym[m.M1]} | ${sym[m.M2]} | ${sym[m.M3]} | ${sym[m.M4]} | ${m.base === 'resumen' ? 'resumen' : 'conocimiento previo'} | ${m.nota} |`).join('\n');

const tags = Object.keys(S.etiquetas).map((t) => `| ${t} | ${S.etiquetas[t]} |`).join('\n');
const decades = Object.keys(S.incluidosPorDecada).sort().map((d) => `${d}: ${S.incluidosPorDecada[d]}`).join(' · ');

const md = `# Resultados de la revisión sistemática

> Generado por \`scripts/revision/generar-resultados.js\` a partir de \`datos/\`. Protocolo: [\`protocolo.md\`](protocolo.md). Lectura previa obligatoria: **esta revisión no cumple todos los estándares de una revisión formal** (ver §6): una sola persona revisora asistida por IA, bases abiertas sin PsycINFO/Scopus/Web of Science, cribado por título y resumen.

## Resumen

- Se buscaron antecedentes en **${busq.consultas.length} consultas** sobre dos bases abiertas (Semantic Scholar y Europe PMC). Resultaron **${S.registrosBrutos} registros brutos** y **${S.registrosUnicos} únicos** tras deduplicar. Se criban todos; se **incluyen ${S.totalIncluidos}**.
- **Búsqueda y cambio de pareja con modelos formales o de agentes: ya existe una literatura amplia** (economía del emparejamiento, demografía computacional, psicología evolutiva y cognitiva). La parte de «búsqueda y cambio» de la idea inicial **no es novedosa**.
- **Información ruidosa sobre la calidad de la pareja con aprendizaje** aparece en pocos trabajos: Becker, Landes y Michael (1977), Wahhaj (2018) y Conroy-Beam (2024), y de forma limitada en otros.
- **Ninguno de los ${S.totalIncluidos} registros incluidos** combina los cuatro rasgos que definen la propuesta de este proyecto (búsqueda/cambio + información ruidosa + sesgo de selección o contraste «corrige / no corrige» + aislamiento de mecanismos psicológicos). El más cercano es Conroy-Beam (2024), que cumple bien los dos primeros y parcialmente el tercero. **Esto describe lo que se encontró en esta búsqueda; no prueba que no exista.**
- La evidencia empírica sobre sobrecarga de opciones **en parejas** es abundante y **mixta**.

## 1. Flujo de registros

| Etapa | Registros |
|---|---|
| Registros brutos recuperados (Semantic Scholar y Europe PMC, hasta ${busq.criteriosDeRecuperacion.match(/\d+/)[0]} por consulta y fuente) | ${S.registrosBrutos} |
| Duplicados eliminados (por DOI o título) | ${S.duplicadosEliminados} |
| **Registros únicos** | **${S.registrosUnicos}** |
| Excluidos automáticamente (tipo no sustantivo o fuera de ventana/idioma) | ${S.excluidosAutomaticosAntesDelCribado.E3_tipoNoSustantivo + S.excluidosAutomaticosAntesDelCribado.E5_ventanaOIdioma} |
| Nivel A (pareja + método formal + decisión): leídos por título y resumen | ${S.preclasificacion.A} |
| Nivel B (pareja + mecanismo): leídos por título y resumen | ${S.preclasificacion.B} |
| Nivel C (resto): cribados **solo por título** (excepto la muestra de control) | ${S.preclasificacion.C} |
| Muestra de control del nivel C (60 registros al azar, semilla fija), leídos por título y resumen | ${nControl} |
| Excluidos E1 por regla automática (sin ningún indicio de relaciones humanas en título/resumen) | ${sum('E1-auto')} |
| Excluidos E1 tras lectura (no es pareja romántica humana) | ${sum('E1')} |
| Excluidos E2 tras lectura (relaciones solo como contexto) | ${sum('E2')} |
| Excluidos E3 (sin contenido sustantivo o sin resumen) | ${sum('E3')} |
| Excluidos E4 (duplicados detectados al leer) | ${sum('E4')} |
| Excluidos por título (nivel C) | ${dc.C['ET (por título)']} |
| Análogos no humanos con modelos formales de búsqueda de pareja (no incluidos; se citan como contexto) | ${dc.C['A (análogo no humano)']} |
| **Incluidos** | **${S.totalIncluidos}** (nivel A: ${dc.A.incluidos}, nivel B: ${dc.B.incluidos}, nivel C: ${dc.C.incluidos}, control: ${dc.Ccontrol.incluidos}) |

Incluidos por década: ${decades}. Lista completa: [\`datos/incluidos.csv\`](datos/incluidos.csv). Decisiones de cribado con su motivo: [\`datos/cribado.csv\`](datos/cribado.csv).

**Comprobación de DOI de los incluidos** (Crossref, \`scripts/revision/verificar-incluidos.js\`): ${doiCount.verificado || 0} verificados (existe y el título es compatible), ${doiCount['sin-doi'] || 0} sin DOI, ${doiCount['no-en-crossref'] || 0} no registrado(s) en Crossref, ${doiCount['titulo-distinto'] || 0} con título distinto.

## 2. Fiabilidad del cribado: un hallazgo sobre el propio método

La preclasificación automática (niveles A/B/C) estaba pensada para **priorizar** la lectura. La muestra de control del nivel C mostró que **no sirve para descartar**: ${dc.Ccontrol.incluidos} de ${nControl} registros del nivel C (${pct(pCtl)}; intervalo de Wilson al 95 %: ${pct(lo)}–${pct(hi)}) eran elegibles. Por eso se cribó **todo** el nivel C por título (decisión posterior al protocolo, ver §5). De los **${S.totalIncluidos}** incluidos, **${fromC}** (${pct(fromC / S.totalIncluidos)}) vienen del nivel C: sin ese paso, la revisión habría perdido aproximadamente la mitad de lo relevante.

Consecuencias que conviene tener presentes: (a) el cribado por título es **menos fiable** que el de título y resumen; (b) buena parte de los registros del nivel C no tiene resumen; (c) un revisor adicional independiente podría decidir distinto en los casos límite; (d) el cribado automático E1-auto excluyó ${sum('E1-auto')} registros por ausencia de indicios humanos, y la muestra de control incluye ${dc.Ccontrol.E1} exclusiones E1 que confirman que ese tipo de registros no era elegible, pero no es una prueba exhaustiva.

## 3. Modelos formales y computacionales (subpreguntas 1–3)

Clasificación manual de los trabajos formales o computacionales incluidos según cuatro rasgos (ver [\`protocolo.md\` §4](protocolo.md)):
**M1** búsqueda, parada, cambio o disolución · **M2** información ruidosa con aprendizaje · **M3** sesgo de selección o contraste «corrige / no corrige» · **M4** aislamiento de mecanismos psicológicos (foco, novedad, aversión a la pérdida).
● consta · ◐ parcial · ○ no consta · ? no se pudo determinar (sin resumen).

| Trabajo | Título | M1 | M2 | M3 | M4 | Base | Nota |
|---|---|---|---|---|---|---|---|
${modelRows}

Fuente de los datos: [\`datos/clasificacion-modelos.json\`](datos/clasificacion-modelos.json). La columna **Base** distingue lo clasificado a partir del resumen leído de lo clasificado por conocimiento previo cuando el registro no tenía resumen; esto último es menos fiable y debe contrastarse leyendo el artículo.

**Lectura.**

1. **M1 es habitual.** Más de veinte trabajos modelan la búsqueda de pareja, el emparejamiento secuencial o la disolución, desde la economía (Becker et al., 1977; Adachi, 2003; Akın y Platt, 2016; Bonilla y Malo, 2022) hasta los modelos de agentes con heurísticas (Todd y Billari, 2005; Simão y Todd, 2002).
2. **M2 es poco frecuente y heterogéneo.** Wahhaj (2018) modela una señal ruidosa sobre la calidad de la novia; Conroy-Beam (2024) trata la búsqueda en entornos ruidosos con muestreo de Thompson (bayesiano); Becker et al. (1977) es la referencia clásica de la disolución por nueva información y oportunidades alternativas.
3. **M3 solo aparece parcialmente** en Conroy-Beam (2024), que compara algoritmos de búsqueda, pero sin una pareja actual a la que se renuncia y sin cuantificar la sobreestimación del elegido.
4. **M4 no aparece** en ningún trabajo formal incluido.
5. **Un hallazgo útil para mejorar el modelo:** Hills y Todd (2008) y Todd y Billari (2005) usan **expectativas que se relajan con la búsqueda**; Bear y Rand (2019) tratan **por qué se deja de buscar al comprometerse**; Conroy-Beam (2024) añade **reciprocidad**. Son extensiones naturales del modelo actual (ver [\`modelo-matematico.md\`](../modelo-matematico.md) y [\`limitaciones.md\`](../limitaciones.md)).

## 4. Evidencia empírica por mecanismo (subpregunta 4)

Recuento de incluidos por etiqueta temática (reglas explícitas sobre título y resumen; un registro puede tener varias):

| Tema | Registros |
|---|---|
${tags}

Lo que sigue **resume lo que informan los títulos y resúmenes leídos**; no se leyeron los artículos completos.

**Sobrecarga de opciones en parejas: evidencia amplia y mixta.** Hay experimentos que informan peores resultados con más opciones: Wu y Chiou (2009) («más opciones llevan a más búsqueda y peores elecciones»), Yang y Chiou (2010), D'Angelo y Toma (2017), Pronk y Denissen (2020), Thomas et al. (2022) y Apostolou y Constantinidou (2024, discusión). Otros trabajos matizan o contradicen: Hu y Markowitz (2024) informan en su título que **aumentar la elección impulsa la búsqueda relacional**, y el metaanálisis general de Scheibehenne et al. (2010) halló un efecto medio cercano a cero. Rosenfeld (2017) contrasta con datos longitudinales la idea de que la abundancia de opciones en línea produce inestabilidad. Esto coincide con la decisión del modelo de **no presuponer** que más opciones empeora las cosas.

**Alternativas, compromiso y arrepentimiento.** Mattson y Franco-Watkins (2012) examinan el arrepentimiento por la pareja actual como mecanismo por el cual las mejores alternativas llevan al cambio de pareja; South (1995) deriva de la teoría de búsqueda matrimonial que la oferta de alternativas se relaciona con la disolución. Hay amplia evidencia de que las personas comprometidas **desvalorizan** a las alternativas atractivas (Johnson y Rusbult, 1989; Cole y Trope, 2016; Lydon y colaboradores). **Implicación:** el modelo actual no incluye ese filtro motivacional, lo que probablemente **exagera** los cambios (ya señalado en las limitaciones).

**Información, incertidumbre y primeras impresiones.** La literatura de reducción de incertidumbre (Berger y Calabrese, 1975; Parks y Adelman, 1983) y de incertidumbre relacional (Knobloch y Solomon) es extensa. Estudios recientes examinan si las primeras impresiones predicen el interés posterior (Baxter et al., 2022) y la exactitud de las impresiones en citas (Kerr et al., 2020). Wang y Ma (2022) señalan una tensión relevante para el modelo: se suele sostener que se elige pareja con información incompleta mediante **reglas no compensatorias**, pero los experimentos recientes suelen encontrar **estrategias compensatorias**. Esto cuestiona la fuerza del filtro de requisitos esenciales y justifica tratarlo como un **supuesto de diseño** con umbral explícito.

**Adaptación, novedad y comparación.** Hay trabajos sobre adaptación hedónica en relaciones (Bao y Lyubomirsky, 2013), creencias de decaimiento de la pasión (Carswell y Finkel, 2018) y comparación social en pareja (Lockwood y Pinkus). **No se encontró** evidencia directa de una «prima de novedad» de la pareja nueva sobre la decisión de cambio; la bonificación ν del modelo sigue siendo un supuesto de diseño.

**Maximizar.** French y Meltzer (2019) y Mikkelson y colaboradores (2013, 2016) estudian la tendencia a maximizar en el matrimonio y en relaciones, en línea con Schwartz et al. (2002).

**Preferencias declaradas y reveladas.** Eastwick y Finkel, Todd et al. (2007), Williams y Sulikowski (2020) y Zhao y Sidari (2024) comparan lo que se dice querer con lo que se elige. Joel y MacDonald (2021) argumentan que las personas **no son tan selectivas** como supone la narrativa cultural (sesgo hacia decisiones que favorecen el avance de la relación): otro argumento para no suponer agentes muy exigentes.

## 5. Veredicto sobre la novedad

1. **No hay teoría nueva** (conclusión que ya se sostenía; ahora con respaldo sistemático).
2. **La contribución defendible** es la combinación, hoy no encontrada en esta búsqueda, de: cambio desde una pareja actual + información ruidosa con aprendizaje + **ablación explícita** de mecanismos (estadística de selección frente a foco, novedad y aversión a la pérdida), implementada como **herramienta abierta y reproducible**.
3. **Ese reclamo depende de dos cosas que esta revisión no puede garantizar:** que lo clasificado por conocimiento previo (registros sin resumen) sea correcto y que no existan trabajos fuera de las bases consultadas. Antes de afirmarlo en una publicación formal, hacen falta una consulta en PsycINFO/Scopus/Web of Science, un segundo revisor independiente y la lectura de texto completo de los trabajos de la tabla de §3 con M1 y M2.
4. **Trabajo siguiente más valioso:** leer a fondo Conroy-Beam (2024) y Simão y Todd (2002) y comparar sus supuestos con los de este modelo; son los antecedentes que más se aproximan.

## 6. Desviaciones respecto del protocolo y limitaciones

**Desviaciones (se declaran todas):**

1. **Cambio de fuente.** El protocolo preveía OpenAlex. La búsqueda se interrumpió al agotarse su presupuesto gratuito diario compartido (ver [\`datos/openalex-intento-abortado.log\`](datos/openalex-intento-abortado.log)); como el programa acumulaba resultados en memoria, no se guardó nada de ese intento y **no se usó ningún registro suyo**. Se rehízo con Semantic Scholar y Europe PMC, con caché por consulta. La estrategia de consultas cambió (consultas más grandes con operadores booleanos, porque estas fuentes no limitan los operadores como OpenAlex).
2. **Regla E1-auto no prevista.** Para no leer registros evidentemente ajenos (biología, ingeniería), se excluyeron automáticamente los que no tenían ningún indicio de relaciones humanas en título o resumen.
3. **Cribado por título del nivel C**, decisión tomada **después** de ver que la muestra de control tenía ${pct(pCtl)} de registros elegibles. Es menos fiable que el cribado por resumen.
4. **Código «A»** (análogos no humanos): se añadió para conservar la referencia a modelos formales de búsqueda de pareja en animales, que no cumplen I1.
5. **Duplicados:** se eliminaron los detectados automáticamente y los vistos al leer (E4); **pueden quedar versiones del mismo trabajo** (preprints, informes, capítulos) entre los incluidos.
6. **Errores del proceso corregidos:** una expresión regular mal escapada hizo que la función de cribado por título no registrara inicialmente ninguna inclusión del nivel C; se detectó al contar los resultados (solo 1 incluido en lugar de 126), se corrigió y se reaplicaron las decisiones desde las listas de inclusión. Los recuentos finales de este documento son los posteriores a la corrección.

**Limitaciones:** una persona revisora asistida por IA (sin acuerdo entre revisores); dos bases abiertas con cobertura parcial de la psicología; recuperación limitada por consulta (más citados primero, lo que sesga contra lo reciente); cribado por título y resumen, sin texto completo; resúmenes ausentes en parte de los registros; **no se evalúa el riesgo de sesgo de los estudios**; términos de búsqueda en inglés; literatura en otros idiomas infrarrepresentada; las etiquetas temáticas de §4 se asignan por palabras clave y son aproximadas.

## 7. Cómo reproducir

\`\`\`bash
node scripts/revision/buscar.js              # recupera (o reutiliza la caché de) las consultas
node scripts/revision/cribar.js pre          # preclasificación y muestra de control
node scripts/revision/sintetizar.js          # etiquetas, clasificación de modelos, recuentos
node scripts/revision/verificar-incluidos.js # comprueba DOI en Crossref (requiere conexión)
node scripts/revision/generar-resultados.js  # regenera este documento
\`\`\`

Los resultados de las fuentes cambian con el tiempo: lo que se puede reproducir exactamente es el **análisis a partir de los registros guardados** (\`datos/registros.json\` y \`datos/decisiones.json\`); una nueva búsqueda puede devolver otros registros. Las decisiones de cribado son juicios de la persona revisora y no se regeneran automáticamente.
`;
fs.writeFileSync(path.join(ROOT, 'docs', 'revision-sistematica', 'resultados.md'), md);
console.log('escrito docs/revision-sistematica/resultados.md');
