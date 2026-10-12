# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico (el modelo es 0.x: puede cambiar).

## [Sin publicar]

### Añadido
- Borrador del artículo en `docs/articulo/articulo.md` (IMRaD, solo referencias verificadas en Crossref; sin revisión por pares).
- Autoría con nombre completo (Standley Moise) en `CITATION.cff`, `.zenodo.json`, `LICENSE` y `package.json`. El registro ya archivado en Zenodo (v0.3.0) conserva el nombre anterior hasta la próxima release.
- DOI de Zenodo: concepto `10.5281/zenodo.23310487`; versión v0.3.0 `10.5281/zenodo.23310488`. Añadido a `CITATION.cff` y al README.

## [0.3.0] — 2026-10-12

### Añadido
- Revisión sistemática de antecedentes (`docs/revision-sistematica/`): protocolo, búsqueda reproducible en Semantic Scholar y Europe PMC, cribado documentado (3 324 registros únicos, 265 incluidos), clasificación de modelos formales y veredicto sobre la novedad. Declara sus limitaciones y desviaciones.
- 21 referencias nuevas verificadas contra Crossref (69 en total).
- GitHub Pages activado; `.zenodo.json` y guía paso a paso para el DOI de Zenodo en `docs/publicacion.md`.
- **Índice de Relación de Pareja (IRP):** auditoría de la hoja de cálculo original (`docs/irp.md`), implementación corregida en `src/irp.js` (15 pruebas, incluida la reproducción exacta del Excel original), pestaña nueva en el simulador conectada a la calculadora y `IRP-mejorado.xlsx` con fórmulas contrastadas con LibreOffice (22 casos).
- El modelo se llama «Modelo standleymoise» (atribución; no implica novedad ni validación).

## [0.2.0] — 2026-10-11

Primera versión pública. Reescritura del simulador previo (`legacy/simulador_v0.1_original.html`, conservado sin modificar).

### Añadido
- Modelo matemático explícito (`docs/modelo-matematico.md`): utilidad ponderada, información normal–normal, requisitos esenciales no compensatorios, decisión de cambio con foco, aversión a la pérdida y novedad, valor de reserva.
- Núcleo en JavaScript puro (`src/`) sin dependencias y con generador aleatorio de semilla explícita.
- Simulador interactivo (`simulator/`) con calculadora de dos personas y simulación de agentes ficticios; versión autónoma de un solo archivo.
- 8 experimentos reproducibles (`experiments/`) más un escenario 80–20 determinista, con configuración, semilla y resultados en JSON y CSV.
- Pruebas automatizadas, incluida la comparación con la fórmula analítica de la maldición del ganador y la reproducibilidad de los experimentos guardados.
- 48 referencias verificadas contra Crossref; 5 pendientes declaradas.
- Documentación: antecedentes, hipótesis, metodología, limitaciones, resultados exploratorios, plan de validación, guía de publicación.
- Integración continua en GitHub Actions (Linux y Windows; Node 20, 22 y 24).

### Corregido respecto del simulador previo (ver `docs/auditoria-simulador-previo.md`)
- Los límites personales ahora funcionan como filtro no compensatorio (antes eran decorativos).
- «Desconocido» ya no se confunde con «50»; la información y la incertidumbre intervienen en el cálculo.
- Se eliminó la curva ilustrativa que daba por supuesta la conclusión.
- Validación de campos (sin discrepancias entre lo que se ve y lo que se calcula); sin `innerHTML` con texto del usuario.
- Pesos todos en 0 devuelven «indefinido» y no 0.

### Correcciones durante el desarrollo (registradas por transparencia)
- Filtro de requisitos esenciales aplicado a la pareja actual → eliminado (artefacto de diseño).
- Métricas «por cambio» calculadas por evento en lugar de por corrida (sesgo de −0,9 en la sobreestimación bayesiana).
