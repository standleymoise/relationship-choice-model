# Publicación del repositorio

Guía para publicar y mantener el proyecto en GitHub.

## 1. Licencias: código y documentación

| Qué | Licencia | Archivo | Por qué |
|---|---|---|---|
| Código (`src/`, `simulator/`, `scripts/`, `experiments/scripts/`, `tests/`) | **MIT** | [`LICENSE`](../LICENSE) | Permisiva y corta; permite reutilizar el código con una sola obligación: conservar el aviso de derechos de autor |
| Documentación (`docs/`, `README.md`) y resultados (`experiments/results/`) | **CC BY 4.0** | [`LICENSE-DOCS.md`](../LICENSE-DOCS.md) | Pensada para textos y datos: permite reutilizar y adaptar, exigiendo atribución |

La diferencia importa: las licencias de software no están pensadas para texto y las de contenido (Creative Commons) no se recomiendan para código. Mantener ambas evita ambigüedades. Si alguien prefiere un copyleft para el código, GPL-3.0 o AGPL-3.0 son alternativas, con la consecuencia de que los derivados deberán publicarse con la misma licencia.

## 2. Crear el repositorio y publicar la versión inicial

Con la CLI de GitHub (`gh`) ya autenticada:

```bash
git init -b main
git add .
git commit -m "Versión inicial 0.2.0"
gh repo create relationship-choice-model --public --source=. --remote=origin --push \
  --description "Modelo y simulador abierto de decisiones de elección de pareja bajo información incompleta (exploratorio)"
git tag -a v0.2.0 -m "Primera versión pública"
git push origin v0.2.0
```

Sin `gh`: crear un repositorio vacío en github.com, y luego `git remote add origin <URL>`, `git push -u origin main` y `git push origin v0.2.0`.

Después de publicar, en *Settings → General* conviene definir el *topic* (`simulation`, `decision-making`, `javascript`) y en *Settings → Code and automation → Actions* comprobar que se ejecuta el flujo de CI.

## 3. Publicar el simulador con GitHub Pages (opcional)

1. *Settings → Pages → Build and deployment → Source: «Deploy from a branch»*.
2. Rama `main`, carpeta `/ (root)`.
3. La página quedará en `https://<usuario>.github.io/relationship-choice-model/simulator/simulador-autonomo.html` (puede tardar unos minutos).

**Limitaciones:** el sitio es público y estático (no hay servidor ni base de datos; es lo que se quiere). Un repositorio gratuito debe ser público para usar Pages. Los cambios pueden tardar en reflejarse y el navegador puede cachear versiones anteriores. El archivo autónomo evita problemas de rutas relativas; si se usa `simulator/index.html`, el sitio debe servir también `src/`.

## 4. Asignar un DOI con Zenodo (más adelante)

1. Iniciar sesión en zenodo.org con la cuenta de GitHub y, en *GitHub*, activar el repositorio.
2. Crear una *Release* en GitHub (por ejemplo `v0.2.0`). Zenodo archiva esa versión y le asigna un DOI propio, además de un DOI «de concepto» que agrupa todas las versiones.
3. Añadir el DOI a `CITATION.cff` (campo `doi`) y al README, y publicar una versión nueva.
4. Un archivo `.zenodo.json` permite controlar los metadatos del depósito.

Un DOI da identidad citable, **no valida el contenido**: Zenodo no hace revisión científica. La licencia elegida condiciona qué se puede reutilizar.

## 5. Antes de cada publicación

```bash
npm run check          # sintaxis, JSON, secretos evidentes, HTML autónomo al día
npm test               # pruebas
npm run experiments -- --check   # los resultados guardados se reproducen
npm run build          # regenera el HTML autónomo si cambió el código
```

- Revisar que no haya credenciales, tokens ni datos personales (el repositorio no los usa).
- Actualizar `CHANGELOG.md` y la versión en `package.json`, `src/simulation.js` y `CITATION.cff`.
- Si cambia algún cálculo: regenerar resultados (`npm run experiments`), tablas (`node scripts/tablas-resultados.js`) y revisar los documentos que citan cifras.

## 6. Mantenimiento

- Responder a *issues* con las plantillas de `.github/ISSUE_TEMPLATE/`.
- Se aceptan críticas a los supuestos tanto como correcciones de código: ver [`CONTRIBUTING.md`](../CONTRIBUTING.md).
