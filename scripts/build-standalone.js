#!/usr/bin/env node
'use strict';
/*
 * Genera simulator/simulador-autonomo.html: un único archivo con CSS y JS incrustados,
 * que funciona abriéndolo con doble clic (sin servidor ni conexión).
 *   node scripts/build-standalone.js            escribe el archivo
 *   node scripts/build-standalone.js --check    falla si el archivo guardado no coincide
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SIM = path.join(ROOT, 'simulator');
const OUT = path.join(SIM, 'simulador-autonomo.html');

function build() {
  let html = fs.readFileSync(path.join(SIM, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
  html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => {
    const css = fs.readFileSync(path.join(SIM, href), 'utf8').replace(/\r\n/g, '\n');
    return `<style>\n${css.trim()}\n</style>`;
  });
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => {
    const js = fs.readFileSync(path.join(SIM, src), 'utf8').replace(/\r\n/g, '\n');
    if (js.includes('</script')) throw new Error(`${src} contiene "</script"`);
    return `<script>\n${js.trim()}\n</script>`;
  });
  return '<!-- Archivo generado por scripts/build-standalone.js: no editar a mano. -->\n' + html;
}

if (require.main === module) {
  const built = build();
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
    if (current !== built) {
      console.error('simulator/simulador-autonomo.html está desactualizado: ejecutá "npm run build".');
      process.exit(1);
    }
    console.log('simulador-autonomo.html está al día');
  } else {
    fs.writeFileSync(OUT, built);
    console.log('escrito', path.relative(ROOT, OUT), `(${(built.length / 1024).toFixed(0)} KB)`);
  }
}

module.exports = { build };
