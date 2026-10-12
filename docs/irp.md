# Índice de Relación de Pareja (IRP): auditoría y versión mejorada

> **Origen.** La hoja de cálculo «ÍNDICE DE RELACIÓN DE PAREJA (IRP)» de standleymoise (2021). Este documento audita sus fórmulas con el mismo criterio que se aplicó al simulador anterior ([`auditoria-simulador-previo.md`](auditoria-simulador-previo.md)), describe qué se conserva y qué se corrige, y cómo se conecta con el modelo. **El archivo original no se publica en este repositorio** (es un archivo personal); lo que sigue se basa en su lectura completa (hojas, fórmulas y listas) y sus números se reproducen con pruebas automatizadas ([`tests/irp.test.js`](../tests/irp.test.js)).
>
> **Aviso.** El IRP, tanto el original como el mejorado, es una **autovaloración exploratoria**. No es una prueba validada, no mide el valor de una persona, no predice el futuro de una relación y no indica qué decisión tomar.

## 1. Qué hace el Excel original

- **Dos listas.** «Buenos puntos» (26 casillas: Paz, Sinceridad, Fidelidad, Respeto, Compromiso…) y «Malos puntos» (25 casillas: Tristeza, Infidelidad, Irrespeto, Te pega, Te controla…).
- **Escala de 5 niveles** por casilla: «Nada de eso», «Muy poco», «Poco», «Normal», «Mucho». En los buenos puntos suman de 1 a 5; en los malos puntos la escala está invertida (5 = nada de eso).
- **Cálculo.** Suma de 24 casillas buenas y 24 malas; cada suma se lleva a «sobre 100» dividiéndola entre 120; el **IRP es el promedio de ambas** (celdas H29, K29 e I5).
- **Veredicto.** Un texto por tramos (≥ 90, 80, 70, 60, 50, 40, 30, 25 y 20).
- Hojas auxiliares: `Hoja2` (una lista «Amor / Odio / Desamor» sin fórmulas que la usen) y `Hoja3` (números 90 a 20, presumiblemente para ilustraciones por tramo).

## 2. Hallazgos de la auditoría

### Errores (el Excel hace algo distinto de lo que parece)

| # | Hallazgo | Evidencia |
|---|---|---|
| E1 | **La escala real es de 20 a 100, no de 0 a 100.** Cada casilla vale como mínimo 1 y se divide siempre entre 120. El peor caso posible da 20; los tramos de 25 y 20 solo se alcanzan con respuestas casi todas en el extremo negativo. | Prueba «original: reproduce los valores guardados» (todo en el peor caso → 20). |
| E2 | **Tres casillas figuran en la lista pero no se suman:** «Comunicativo» y «Detallista» (buenos) y «Siempre tiene la razón» (malos). Tienen selector, pero sus celdas no entran en las fórmulas H30/K30. | Prueba «los 3 ítems listados pero no sumados no cambian el resultado». |
| E3 | **Una casilla tiene las etiquetas invertidas:** «Presumir» figura entre los buenos puntos y «Sin presumir» entre los malos, al revés de lo que el significado pide. | Se corrige: «Sin presumir (humildad)» es bueno y «Presumir» es malo. |
| E4 | **Todo es compensatorio: un solo ítem de violencia casi no mueve el índice.** Con todo lo bueno en «Mucho», todo lo malo en «Nada de eso» y «Te pega» en «Mucho», el IRP original da **98,3** y el veredicto es el más alto («Excelente»). La amenaza, el control o la violencia pasan inadvertidos en el promedio. | Prueba «defecto del original: un solo ítem de violencia…». |
| E5 | **No existe «No sé».** Si falta una casilla, la fórmula devuelve error (`#N/A`); y si se elige «Nada de eso» para algo que no se conoce, eso cuenta como una respuesta real. No distingue ignorar de ausencia (el mismo problema de «desconocido = 50» del simulador anterior). | Prueba «falta un ítem puntuado → null». |
| E6 | **Hoja2 y Hoja3 no están conectadas** con el resultado (salvo una celda auxiliar que lee `Hoja3!A2` cuando el IRP < 25). | Lectura de las fórmulas. |

### Problemas de fondo (no son errores de cálculo)

1. **El veredicto prescribe y juzga.** Los textos por tramos incluyen órdenes («abrite los ojos y dejá ya esta relación»), advertencias alarmistas, inferencias sobre la personalidad de quien responde (inmadurez, baja autoestima, miedo a estar solo) e insultos. Un autoinforme de un día no justifica nada de eso: **no se reproducen aquí** y se reemplazan por una lectura descriptiva y neutral. Además, decirle a alguien que deje o no deje una relación contradice el principio del proyecto (el modelo no da consejos individuales).
2. **Doble conteo.** Varios constructos aparecen en positivo y en negativo (Fidelidad / Infidelidad, Respeto / Irrespeto, Metas claras / Sin metas claras, Buena influencia / Mala influencia, Comprensión / No te escucha, Sinceridad / Fingir). Eso les da el doble de peso que a los demás. Puede ser intencional, pero conviene decirlo y poder cambiarlo (pesos editables).
3. **Todas las casillas pesan igual**, aunque no sean equivalentes («Placer» frente a «Respeto»).
4. **Sin validación.** No hay datos de fiabilidad ni de validez, y los tramos (90, 80, 70…) no tienen respaldo empírico.
5. **Nombre.** «Valoración de pareja» puede leerse como evaluación de la **persona**. El IRP describe una **relación** según quien responde; no evalúa a nadie.

## 3. La versión mejorada

Se implementa en [`src/irp.js`](../src/irp.js) (con 15 pruebas), en la pestaña «Índice de relación (IRP)» del simulador y en un Excel nuevo (§5).

| Aspecto | Original | Mejorado |
|---|---|---|
| Escala | 20–100 | **0–100** (puntos 0, 25, 50, 75, 100 por casilla) |
| Casillas que suman | 48 de 51 | **Las 51** (las 3 ausentes se incorporan) |
| «No sé» | No existe (error o respuesta falsa) | **Existe:** la casilla se excluye (no es cero ni neutro) y se informa la **cobertura** |
| Mínimo para calcular | Todas | Al menos la **mitad de cada lista** |
| Pesos | Todos 1 (fijos) | **Editables** (en el Excel y en la API; peso 0 excluye la casilla) |
| Violencia, amenazas y control | Un ítem más en el promedio | **Alerta de seguridad:** con cualquier respuesta distinta de «Nada de eso» en «Te pega», «Te grita y te amenaza» o «Te controla, te priva de libertad», **no se da lectura global**: el promedio no es válido en ese caso |
| Infidelidad, celos, sexo egoísta | Un ítem más | Aviso de atención con «Normal» o «Mucho»; no bloquea la lectura |
| Lectura | Prescriptiva, con insultos | **Descriptiva y neutral** («predominan los aspectos positivos…»), siempre con el recordatorio de que no es un diagnóstico |
| Etiqueta «Presumir» | Invertida | Corregida |
| Subíndices | Ocultos en celdas intermedias | **Visibles:** presencia de lo positivo y ausencia de lo problemático |

Se conserva lo bueno del original: la lista de factores cotidianos (en lenguaje cercano), la idea de valorar por separado lo positivo y lo negativo, y el promedio de ambos subíndices.

**Compatibilidad.** La función `scoreOriginal` reproduce exactamente las fórmulas del Excel (con sus límites) para poder comparar; el simulador muestra el «IRP original» junto al mejorado, solo como referencia.

## 4. Conexión con el modelo

El IRP es una **medida de cómo percibe la persona su relación actual**: encaja con el papel de los **valores observados de A** de la calculadora de dos personas. El botón «Usar mis respuestas como valores de A en la calculadora» convierte las respuestas en valores de 0 a 100 para los ocho factores de la calculadora, así:

| Factor de la calculadora | Casillas del IRP que lo alimentan |
|---|---|
| Respeto y seguridad | Respeto, Irrespeto, Te pega, Te grita y te amenaza, Te controla, Ser egoísta, Celos sin motivos |
| Honestidad y confiabilidad | Sinceridad, Ser uno mismo, Fidelidad, Confianza, Infidelidad, Fingir, Tiene excusa para todo |
| Comunicación y resolución de conflictos | Comprensión, Comunicativo, No te escucha, Siempre tiene la razón |
| Proyecto de vida | Crecimiento, Metas claras, Estabilidad, Compromiso, Planes en conjunto, Sin metas claras, Decrecimiento |
| Estilo de vida y valores cotidianos | Paz, Buena influencia, Independiente, Sin presumir, Pegajoso, Mala influencia, Presumir |
| Atracción y química | Placer, Cariñoso, Detallista, Buen sexo, Falta de interés, No te encariña, Solo sexo, Sexo egoísta |
| Intereses y actividades compartidas | Alegría, Compartir juntos |
| Aspectos prácticos | Te ayuda, Gastos compartidos, Responsable, No te ayuda, Gastás vos solo |

Un factor sin ninguna casilla respondida queda como «no se conoce» (conserva la incertidumbre de la población: ver [`modelo-matematico.md`](modelo-matematico.md) §4). Cuatro casillas (Autoconfianza, Tristeza, Estrés, Inseguridad) describen a quien responde más que a la relación y **no se asignan a ningún factor**.

**Para B no sirve tal cual:** casi todas las casillas requieren convivencia o experiencia («Te pega», «Gastos compartidos»). Con una persona poco conocida corresponde responder «No sé»; el modelo trata esa incertidumbre explícitamente.

## 5. El Excel mejorado

`IRP-mejorado.xlsx` (generado por [`herramientas/generar-irp-xlsx.js`](../herramientas/generar-irp-xlsx.js)) conserva el espíritu del original con las correcciones de la tabla anterior: lista desplegable por casilla con «No sé», pesos editables, puntos por casilla, subíndices, cobertura, alertas de seguridad y una lectura neutral. Sus fórmulas se **recalcularon con LibreOffice y se contrastaron con las funciones de `src/irp.js`** sobre varios conjuntos de respuestas (ver [`tests/`](../tests/) y el script de contraste). Sigue siendo una herramienta exploratoria y no validada.

## 6. Limitaciones

- Las casillas, los niveles y los tramos de lectura son decisiones de diseño sin validación empírica.
- La equivalencia entre casillas y factores del modelo es una propuesta razonable, **no un instrumento validado**.
- Una autovaloración depende del estado de ánimo, de la deseabilidad social y de lo que la persona esté dispuesta a admitir.
- El índice no distingue quién causa un problema ni su gravedad más allá de la frecuencia.
- No sustituye el apoyo profesional: ante violencia, miedo o malestar intenso conviene buscar ayuda.
