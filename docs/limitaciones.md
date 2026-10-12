# Limitaciones

## Lo que este modelo NO demuestra

- **No** evalúa objetivamente el valor de una persona ni de una relación.
- **No** determina la pareja ideal ni dice a nadie qué hacer.
- **No** predice el éxito o el fracaso de ninguna relación real.
- **No** demuestra que las personas cometan los errores que cometen los agentes «ingenuos»: ese comportamiento es un supuesto programado.
- **No** estima porcentajes de abandono, de arrepentimiento ni de éxito en poblaciones reales. Cualquier cifra producida es una propiedad de reglas inventadas.
- **No** distingue culturas, géneros, orientaciones, edades ni contextos.
- **No** recoge ni solicita datos personales.

## Limitaciones del modelo

1. **Sin reciprocidad.** La otra persona no elige: siempre «acepta». En la realidad, una relación necesita dos y los candidatos pueden rechazar.
2. **Sin compromiso ni inversiones.** La literatura (Rusbult, 1980; Le y Agnew, 2003; Tran et al., 2019) indica que el compromiso y las inversiones cambian cómo se valoran las alternativas, incluida la *desvalorización* de las atractivas (Johnson y Rusbult, 1989). El agente aquí compara sin ese filtro motivacional, lo que probablemente **exagera** los cambios.
3. **Factores independientes, normales y sin truncar.** En la realidad hay correlaciones fuertes (algunas personas son mejores en todo, o se parecen entre sí) y los valores están acotados. La corrección bayesiana del agente supone independencia.
4. **Valor «verdadero» observable solo dentro de la simulación.** El «ajuste verdadero» sirve para medir el arrepentimiento *objetivo*; en la vida real no existe una medida así, y el bienestar es subjetivo y cambia con el tiempo.
5. **Pesos estables.** Se asume que lo que le importa al agente no cambia. Las preferencias reales se reconstruyen, se negocian y evolucionan.
6. **Los mecanismos psicológicos son supuestos de forma funcional.** `γ`, `ν`, `λ`, `η` tienen inspiración en literatura (focalismo, adaptación hedónica, teoría de las perspectivas, comparación social) pero **su forma y sus valores no están estimados para parejas**. Los valores del experimento e6 (γ = 3, ν = 10, λ = 2,25) son puntos de partida de diseño.
7. **La pareja inicial es un sorteo.** Por defecto es una persona típica (`initialQualityShift = 0`); con ese valor casi cualquier cambio de un agente que busca es provechoso en promedio. Los resultados dependen mucho de este supuesto (experimento e7).
8. **Información como unidades iguales.** Cada cita aporta una observación independiente con el mismo ruido. Las impresiones reales están correlacionadas y sesgadas (por ejemplo, la persona se presenta mejor al principio).
9. **Costes.** El coste monetario y la conversión a puntos son arbitrarios. El dinero gastado en una cita **no** se interpreta como medida de compatibilidad.
10. **Sin dinámica de mercado.** Los candidatos son una población ilimitada y no hay efecto de que quien se queda sin pareja «pierda valor» ni de que haya competencia.

## Limitaciones del proceso

- Las **hipótesis y los resultados son exploratorios**. Varias decisiones de diseño se tomaron después de ver resultados (ver [`metodologia.md` §10](metodologia.md)); no hay preregistro.
- **Revisión bibliográfica acotada**, no sistemática ([`antecedentes.md`](antecedentes.md)). Quedan referencias pendientes de verificación ([`referencias.md`](referencias.md)).
- Los intervalos de confianza reflejan solo la variabilidad del muestreo de la simulación; no incluyen incertidumbre sobre el propio modelo.
- Sin revisión por pares. El código y los documentos están abiertos precisamente para que se critiquen.
- **Reproducibilidad.** Los resultados guardados se generaron en Windows con Node 24. La integración continua del repositorio (ejecución de GitHub Actions del 12-oct-2026 sobre el commit de la versión 0.2.0) los recalculó y comparó con lo guardado en **Linux y Windows con Node 20, 22 y 24, con los 6 trabajos en verde**. Eso respalda la reproducibilidad entre estas plataformas para esta versión; no equivale a una garantía para cualquier motor de JavaScript ni para versiones futuras.

## Posibles daños del uso y cómo se mitigan

- *Usar el puntaje para etiquetar a alguien.* El simulador no puntúa personas reales; la calculadora recibe valores que el usuario inventa o estima y lo deja claro en pantalla. No se guarda nada.
- *Tomar el resultado como consejo.* Cada resultado se acompaña de que describe el comportamiento de una regla, no lo que le conviene a una persona real.
- *Interpretar cifras de la simulación como tasas reales.* Se evita publicar porcentajes de éxito, abandono o predicciones; las proporciones que aparecen son propiedades de agentes ficticios y se rotulan así.
