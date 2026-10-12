# Plan de validación empírica futura

> **Estado:** propuesta. **Este repositorio no recopila ni solicita datos personales reales en esta versión.** Pasar de una simulación conceptual a una investigación con personas requiere diseño, revisión ética y recursos que no existen aún. Lo que sigue es una hoja de ruta para quien quiera hacerlo, no un estudio en curso.

## 1. Pregunta empírica concreta

Dejando de lado la metáfora, hay tres preguntas medibles:

1. ¿Las personas **sobrestiman** a una alternativa poco conocida frente a lo que luego observan, y cuánto? (sesgo de selección / maldición del ganador)
2. ¿Las impresiones sobre una persona nueva tienen la fiabilidad que supone el modelo (ruido σ)?
3. ¿Existen **focalismo** y **novedad** que expliquen decisiones de cambio mejor que un agente que solo corrige por incertidumbre?

## 2. Datos necesarios

| Necesidad | Tipo de dato | Observaciones |
|---|---|---|
| Impresión inicial de personas nuevas | Calificaciones de factores tras un primer contacto, con escala fija | Se compara con la evaluación posterior |
| Evaluación posterior de las mismas personas | Calificaciones tras más contacto (por ejemplo, 2–3 semanas) | Permite estimar la fiabilidad de las impresiones y el sesgo hacia lo bueno |
| Pesos de importancia | Preferencias declaradas (ranking, reparto de puntos) **y** elecciones observadas (a quién se acepta) | Distinguir declarado de revelado (Eastwick y Finkel, 2008; Hitsch et al., 2010) |
| Resultado de decisión | Si se avanzó o no, y satisfacción posterior | Con seguimiento longitudinal |
| Covariables | Compromiso, inversiones, calidad percibida de alternativas (Rusbult, 1998) | El modelo actual no las incluye; hay que medirlas para incorporarlas |

## 3. Definir y medir las variables

- **Factores.** Elegir un conjunto reducido (6–10) con definiciones operacionales y escalas validadas cuando existan; justificar cada uno. Evitar mezclar atributos de alto contenido normativo (físico, ingresos) con valores y conductas sin analizar su tratamiento por separado.
- **Información (n).** Operacionalizar como tiempo/interacciones registradas (número de conversaciones, horas), no como autoevaluación.
- **Ruido de impresión (σ).** Estimable como la varianza de las diferencias entre impresión inicial y evaluación posterior, ajustada por la varianza entre personas.
- **Importancias (wᵢ).** Declaradas: reparto de 100 puntos. Reveladas: coeficientes de un modelo de elección (logit condicional) sobre decisiones reales o experimentales.
- **Bienestar.** Medidas de satisfacción relacional con instrumentos validados, con medición repetida; no existe un «ajuste verdadero» observable.

## 4. Preferencias declaradas frente a comportamiento observado

La literatura muestra que ambos pueden diferir (Eastwick y Finkel, 2008; Todd et al., 2007; Joel et al., 2014). El diseño debe incluir **ambos** y no usar uno para validar al otro:

- *Declarado:* cuestionario previo.
- *Revelado:* decisiones en un entorno controlado (por ejemplo, elegir a quién conocer más entre perfiles) y, si hay consentimiento, conducta posterior.
- *Criterio:* el modelo debe predecir lo revelado mejor que lo declarado y mejor que un modelo nulo.

## 5. Evaluar la validez del modelo

1. **Validez de contenido:** revisión por especialistas en relaciones y toma de decisiones.
2. **Estimación de parámetros** (σ, γ, ν, λ, η) con intervalos y no solo valores puntuales.
3. **Validación fuera de muestra:** separar los datos en entrenamiento y prueba (o validación cruzada por persona). Evitar «ajustar hasta que encaje».
4. **Verificación de supuestos:** independencia de factores, normalidad, estabilidad de los pesos.
5. **Pruebas de recuperación de parámetros:** simular datos con parámetros conocidos y comprobar que el procedimiento los recupera.
6. **Preregistro** de hipótesis y análisis, para evitar el sesgo de decidir después de ver los datos (que en esta versión sí ocurrió; ver [`metodologia.md` §10](metodologia.md)).

## 6. Comparar contra modelos alternativos

| Modelo | Qué predice |
|---|---|
| Nulo (aleatorio / tasa base) | Piso de comparación |
| Agente bayesiano sin mecanismos psicológicos | ¿Basta la estadística de selección? |
| Bayesiano + foco | ¿Suma el focalismo? |
| Bayesiano + novedad | ¿Suma el brillo de lo nuevo? |
| Modelo de inversión (Rusbult) | Compromiso, inversiones y alternativas como predictores |
| Aprendizaje automático predictivo (Joel et al., 2017, 2020) | Techo de predictibilidad sin teoría |
| Bandido multibrazo (Conroy-Beam, 2024) | Exploración–explotación en búsqueda de pareja |

Criterios: capacidad predictiva fuera de muestra (por ejemplo log-verosimilitud, AIC/BIC o validación cruzada) y parsimonia. **Si un modelo más simple predice igual o mejor, gana el simple.**

## 7. Tamaño de muestra

No hay un número único; depende de:

- **Qué se estima.** Un efecto medio (¿hay sobreestimación?) necesita menos personas que un parámetro individual (σ por persona) o una interacción.
- **Tamaño de efecto esperado.** En sobrecarga de opciones el efecto medio es cercano a cero con mucha heterogeneidad (Scheibehenne et al., 2010): detectar efectos pequeños exige muestras grandes (cientos a miles).
- **Estructura de los datos.** Cada participante aporta varias personas evaluadas (datos anidados); la potencia depende de la correlación dentro de participantes (ICC) y del número de evaluaciones por persona.
- **Pérdida de seguimiento** en estudios longitudinales (a menudo 20–40 %).

**Método recomendado:** análisis de potencia por simulación con el propio modelo (aquí ya hay un generador de datos) para el efecto mínimo de interés y el ICC plausible, **antes** de recoger datos. No se propone un tamaño de muestra concreto sin ese análisis.

## 8. Ética, consentimiento y privacidad

Requisitos mínimos antes de cualquier recolección:

- **Comité de ética** (IRB/CEC) y, si procede, registro del estudio.
- **Consentimiento informado** explícito, voluntario y revocable; lenguaje claro sobre qué se recoge y para qué.
- **Datos sobre terceros.** Evaluar a personas conocidas implica datos sobre personas que no consintieron. Diseños posibles: perfiles ficticios o estímulos controlados; si se usan personas reales, minimizar la información, anonimizar y no almacenar identificadores.
- **Minimización y protección de datos:** recoger solo lo necesario, cifrado, acceso restringido, retención limitada, cumplimiento de la normativa aplicable (p. ej., GDPR, leyes locales de protección de datos).
- **Riesgos psicológicos.** Pensar en el impacto de reflexionar sobre la propia relación; incluir recursos de apoyo y la posibilidad de retirarse.
- **Violencia o coerción.** Si aparecen indicios, prever protocolos de derivación.
- **Devolución responsable:** informar a participantes que el modelo no evalúa a nadie ni da consejos individuales.
- **Datos abiertos con cuidado.** Publicar solo datos agregados o debidamente anonimizados.

## 9. Hitos sugeridos

1. Revisión sistemática y preregistro.
2. Estudio piloto con estímulos ficticios (sin datos personales reales) para estimar σ.
3. Estudio de decisión controlado (preferencias declaradas y reveladas).
4. Estudio longitudinal con seguimiento y análisis de potencia previo.
5. Comparación de modelos y publicación, incluidos los resultados negativos.
