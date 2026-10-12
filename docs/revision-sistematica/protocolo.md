# Protocolo de la revisión sistemática

> **Naturaleza de esta revisión.** Es una revisión **sistemática en el método** (pregunta explícita, criterios de elegibilidad previos, búsqueda reproducible con cadenas guardadas, cribado documentado, registro de decisiones y de desviaciones) pero **no cumple todos los estándares de una revisión formal** (PRISMA 2020 con doble revisión, varias bases de datos de pago, texto completo, evaluación de calidad). Sus limitaciones se declaran en [`resultados.md`](resultados.md). La realizó una única persona revisora asistida por IA (Claude), no dos revisores independientes. El protocolo se escribió **antes** de mirar los registros, salvo las desviaciones listadas al final.

## 1. Pregunta de revisión

**¿Qué trabajos previos modelan, formal o computacionalmente, o estudian empíricamente, la decisión de cambiar de una pareja conocida a una alternativa poco conocida bajo información incompleta, y existe ya un modelo que contraste agentes que corrigen por la incertidumbre con agentes que no, aislando mecanismos psicológicos (foco, novedad, aversión a la pérdida)?**

Subpreguntas:

1. **Modelos de búsqueda y cambio:** ¿qué modelos formales o de agentes tratan la búsqueda de pareja, la parada, el cambio de pareja o el uso de alternativas?
2. **Información incompleta:** ¿cuáles incorporan ruido o incertidumbre sobre la calidad de la pareja, con aprendizaje (bayesiano o no)?
3. **Sesgo de selección:** ¿alguno aborda la maldición del ganador/optimizador al elegir entre muchas opciones de pareja?
4. **Mecanismos psicológicos:** ¿qué evidencia empírica hay sobre sobrecarga de opciones, focalismo, novedad/adaptación y comparación con alternativas en la elección de pareja?
5. **Economía del emparejamiento:** ¿existen modelos de aprendizaje sobre la calidad del emparejamiento (*match quality*) y de inestabilidad matrimonial relacionados?

## 2. Criterios de elegibilidad

**Se incluye** un registro si cumple **todos** los de inclusión:

- **I1. Población/objeto:** elección, búsqueda, evaluación o cambio de **pareja romántica o de cónyuge en humanos** (incluye citas online, citas rápidas, matrimonio, cohabitación), o modelos que se presentan explícitamente como modelos de ese proceso.
- **I2. Contenido:** aborda al menos uno de: (a) elección entre varias parejas posibles o sobrecarga de opciones; (b) búsqueda, parada, cambio, alternativas o disolución; (c) información o incertidumbre sobre la calidad de la pareja, o sesgo de selección; (d) novedad, adaptación, focalismo o comparación aplicados a la evaluación de parejas.
- **I3. Tipo:** artículo, capítulo, libro, preprint o informe con método identificable: modelo formal o computacional, estudio empírico o revisión/metaanálisis.

**Se excluye** si cumple alguno:

- **E1.** No trata de pareja romántica humana (animales, reclutamiento laboral, consumo, salud, etc.), salvo modelos de búsqueda que se aplican explícitamente a elección de pareja humana.
- **E2.** Trata de relaciones solo como contexto (por ejemplo, un fármaco en parejas, violencia, salud sexual) sin abordar el proceso de elección o cambio.
- **E3.** Sin resumen ni contenido identificable, o tipo no sustantivo (erratas, reseñas de libros, comentarios editoriales sin método).
- **E4.** Duplicado.
- **E5.** Fuera de la ventana temporal (anterior a 1950) o idioma distinto de inglés, español o portugués.

## 3. Fuentes y cadenas de búsqueda

- **Fuente:** OpenAlex (`api.openalex.org`, campo `title_and_abstract.search`). Cubre Crossref, PubMed y otras fuentes. **No** se consultaron PsycINFO, Scopus ni Web of Science (de pago).
- **Estrategia:** OpenAlex limita el número de operadores booleanos por consulta, así que se ejecutan **consultas pequeñas** que cruzan 4 grupos de términos de pareja con 14 grupos de mecanismo o método, más 5 consultas adicionales (economía del emparejamiento, modelo de inversión, inestabilidad matrimonial, coste de búsqueda).
- Las cadenas exactas están en [`scripts/revision/buscar.js`](../../scripts/revision/buscar.js) y quedan registradas con sus recuentos en [`datos/registro-busquedas.json`](datos/registro-busquedas.json).
- **Recuperación:** por consulta, hasta 100 registros ordenados por citas y hasta 40 de 2018 en adelante ordenados por fecha (para no sesgar contra lo reciente). Si una consulta devuelve más, el resto **no se revisa** (se declara).
- **Sin restricción de tipo de documento** salvo E3. Fecha de la búsqueda: ver el registro.

## 4. Proceso de cribado

1. **Deduplicación** por identificador, DOI y título normalizado (automática).
2. **Preclasificación automática por reglas explícitas** (`scripts/revision/cribar.js`), solo para **priorizar** la lectura, no para excluir por mérito:
   - *Nivel A:* el título o el resumen contiene a la vez un término de **pareja**, un término de **modelo/método formal** y un término de **decisión/información**.
   - *Nivel B:* contiene un término de pareja y un término de **mecanismo** (sobrecarga, sesgo de selección, información incompleta, alternativas, adaptación, focalismo, comparación, arrepentimiento), sin término de modelo.
   - *Nivel C:* el resto.
3. **Cribado manual de título y resumen** de todo el nivel A y del nivel B ordenado por relevancia (se lee tanto como sea necesario hasta que los registros nuevos dejan de ser elegibles), contra los criterios I1–I3/E1–E5. Cada decisión se guarda con su motivo en [`datos/cribado.csv`](datos/cribado.csv).
4. **Control de pérdidas:** se revisa a mano una **muestra aleatoria con semilla fija** del nivel C para estimar cuántos registros elegibles se pierden por la preclasificación.
5. **Extracción de datos** de los incluidos: método, tipo de agente o población, mecanismos modelados, tratamiento de la información, relación con este proyecto (ver [`resultados.md`](resultados.md)).
6. **Evaluación de la novedad:** se clasifica cada incluido formal/computacional según cuatro rasgos (M1 búsqueda o cambio; M2 información ruidosa con aprendizaje; M3 sesgo de selección o contraste ingenuo/bayesiano; M4 aislamiento de mecanismos psicológicos) y se determina si alguno los reúne.

## 5. Síntesis

Descriptiva (tablas y recuentos tipo diagrama de flujo PRISMA). No hay metaanálisis. No se evalúa el riesgo de sesgo de los estudios individuales: el objetivo es **cartografiar antecedentes y evaluar la novedad**, no estimar efectos.

## 6. Limitaciones previstas

Una sola base de datos abierta; un solo revisor (IA) sin acuerdo entre revisores; cribado basado en título y resumen, sin texto completo; recuperación limitada por consulta; resúmenes ausentes en parte de OpenAlex; términos en inglés principalmente; posible sesgo hacia lo más citado.

## 7. Desviaciones respecto del protocolo (se completan durante la revisión)

*(Ver [`resultados.md`](resultados.md), sección «Desviaciones».)*
