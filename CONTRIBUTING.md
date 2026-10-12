# Cómo contribuir

Este proyecto existe para ser **revisado críticamente**. Las críticas a los supuestos del modelo valen tanto como las correcciones de código.

## Formas de ayudar

- **Informar un error:** abrí un *issue* con la plantilla «Error». Incluí la versión, los pasos, qué esperabas y qué ocurrió. Si es un cálculo, el caso mínimo con números.
- **Cuestionar un supuesto o una ecuación:** plantilla «Crítica al modelo». Indicá qué cambia en los resultados si el supuesto es otro (mejor si lo mostrás con una configuración).
- **Proponer una referencia:** plantilla «Referencia». Incluí autores, título, año, publicación y DOI. Si no se puede verificar, queda como *pendiente* en `docs/referencias.json`.
- **Proponer un experimento:** copiá un archivo de `experiments/configuraciones/`, cambiá un solo parámetro y abrí un *pull request*.
- **Mejorar código, pruebas o documentación.**

## Reglas del proyecto

1. **Nada de datos personales.** No incluyas datos reales de personas, ni tuyos ni de otras.
2. **No inventar resultados ni referencias.** Toda cifra debe salir de un archivo reproducible; toda referencia con DOI se verifica con `node scripts/verificar-referencias.js`.
3. **Cambiar un parámetro por vez** en los experimentos.
4. **Los resultados que contradicen la hipótesis inicial se publican** con el mismo peso.
5. **No usar lenguaje que presente el modelo como ley, predicción o validación científica.** Es exploratorio.
6. **Si cambia un cálculo,** regenerá los resultados y revisá los documentos que citan cifras.

## Entorno

Se necesita Node.js 20 o superior. No hay dependencias que instalar.

```bash
npm run check                    # sintaxis, JSON, secretos, HTML autónomo al día
npm test                         # pruebas automatizadas
npm run experiments -- --check   # los resultados guardados se reproducen
npm run build                    # regenera simulator/simulador-autonomo.html
```

Un *pull request* debe pasar `npm run check` y `npm test`. La integración continua los ejecuta en Linux y Windows.

## Estilo

- JavaScript sin dependencias; el núcleo (`src/`) no debe tocar el DOM para poder probarse con Node.
- Funciones puras donde sea posible; ecuaciones documentadas en `docs/modelo-matematico.md`.
- Español en la documentación y los mensajes.
- Una prueba por cada función matemática nueva, incluidos los casos límite.

## Licencia de las contribuciones

Al contribuir aceptás que tu aporte se publique bajo MIT (código) o CC BY 4.0 (documentación y resultados).
