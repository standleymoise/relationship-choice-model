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

## 3. Simulador en línea con GitHub Pages (ya activado)

**Estado:** activado el 12-oct-2026. Dirección pública: **https://standleymoise.github.io/relationship-choice-model/** (redirige a `simulator/simulador-autonomo.html`).

Cómo se activó (por si hay que repetirlo en otro repositorio):

1. Desde la web: *Settings → Pages → Build and deployment → Source: «Deploy from a branch»*, rama `main`, carpeta `/ (root)`, y *Save*. O con la CLI:
   ```bash
   gh api -X POST repos/<usuario>/<repositorio>/pages -f "source[branch]=main" -f "source[path]=/"
   ```
2. Esperar uno o dos minutos. El estado se ve con `gh api repos/<usuario>/<repositorio>/pages -q .status` (`built` = publicado).
3. Cada `git push` a `main` republica solo.

Archivos que lo hacen funcionar: `index.html` en la raíz (redirección al simulador) y `.nojekyll` (evita que GitHub procese el sitio como Jekyll).

**Limitaciones:** el sitio es público y estático (no hay servidor ni base de datos; es lo que se busca: nada se guarda ni se envía). Un repositorio gratuito debe ser público para usar Pages. Los cambios tardan en reflejarse y el navegador puede cachear la versión anterior (recargar con Ctrl+F5). El archivo autónomo evita problemas de rutas; `simulator/index.html` también funciona en Pages porque el sitio sirve `src/`.

## 4. Asignar un DOI con Zenodo (paso a paso)

Zenodo es un repositorio abierto del CERN. Se conecta con GitHub y, **cada vez que se publica una *Release***, archiva esa versión y le asigna un **DOI propio y permanente**. Hay un paso que solo puede hacer la persona dueña de la cuenta (el inicio de sesión con GitHub).

**Una sola vez (lo hace la persona autora):**

1. Entrar a https://zenodo.org y elegir *Log in → Log in with GitHub*. Autorizar el acceso.
2. Ir a https://zenodo.org/account/settings/github/ (menú de la cuenta → *GitHub*).
3. En la lista de repositorios, **activar el interruptor de `relationship-choice-model`** (si no aparece, pulsar *Sync now*).

**Cada versión (se puede hacer desde la terminal):**

4. Crear la *Release* en GitHub **después** del paso 3 (Zenodo solo archiva las releases creadas con el repositorio ya activado):
   ```bash
   gh release create v0.2.1 --title "v0.2.1" --notes-file CHANGELOG.md
   ```
   (o *Releases → Draft a new release* en la web).
5. En 1–2 minutos aparece el depósito en https://zenodo.org/me/uploads con su DOI. Cada versión recibe un DOI y existe además un **DOI «de concepto»** que apunta siempre a la última versión.
6. Copiar el **DOI de concepto** y añadirlo a `CITATION.cff` (campo `doi:`) y al README (insignia o enlace); publicar una versión nueva con ese cambio.

Los metadatos del depósito salen de [`.zenodo.json`](../.zenodo.json) (título, autoría, licencia, palabras clave). Si ese archivo falta, Zenodo usa `CITATION.cff`.

**Qué NO hace un DOI:** da una identidad citable y permanente, pero **no valida el contenido**; Zenodo no revisa la ciencia. La licencia (MIT para el código, CC BY 4.0 para documentación) condiciona qué se puede reutilizar. Una release ya archivada **no se puede borrar ni cambiar** (solo se puede publicar una versión nueva), así que conviene revisar antes de publicar.

**Estado:** hecho. La v0.3.0 está archivada en Zenodo: DOI de concepto `10.5281/zenodo.23310487` (todas las versiones) y DOI de versión `10.5281/zenodo.23310488`. En la entrega del webhook de GitHub apareció un error 500 que no impidió el archivo; ante un fallo así conviene comprobar en `zenodo.org/account/settings/github/` antes de crear otra release.

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
