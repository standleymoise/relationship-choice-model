#!/usr/bin/env node
'use strict';
/*
 * Comprueba contra Crossref los DOI de los registros incluidos en la revisión sistemática:
 * que el DOI exista y que el título de Crossref sea compatible con el del registro.
 * Escribe datos/incluidos-doi.json: { id: 'verificado' | 'titulo-distinto' | 'no-en-crossref' | 'sin-doi' }.
 */
const fs = require('fs');
const path = require('path');

const D = path.join(__dirname, '..', '..', 'docs', 'revision-sistematica', 'datos');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s || '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9áéíóúüñ]+/g, ' ').trim();

async function lookup(doi) {
  let wait = 2000;
  for (let t = 0; t < 5; t++) {
    try {
      const r = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi), { headers: { 'User-Agent': 'relationship-choice-model-review (https://github.com/standleymoise/relationship-choice-model)' } });
      if (r.status === 404) return null;
      if (r.ok) return (await r.json()).message;
    } catch (e) { /* reintentar */ }
    await sleep(wait); wait = Math.min(wait * 2, 30000);
  }
  return undefined;
}

(async () => {
  const recs = new Map(JSON.parse(fs.readFileSync(path.join(D, fs.existsSync(path.join(D, 'registros-completo.json')) ? 'registros-completo.json' : 'registros.json'), 'utf8')).map((r) => [r.id, r]));
  const dec = JSON.parse(fs.readFileSync(path.join(D, 'decisiones.json'), 'utf8'));
  const ids = Array.from(new Set(Object.keys(dec).filter((k) => dec[k].c === 'I').map((k) => k.slice(k.indexOf(':') + 1))));
  const out = {};
  let i = 0;
  for (const id of ids) {
    const r = recs.get(id);
    i++;
    if (!r.doi) { out[id] = 'sin-doi'; continue; }
    const w = await lookup(r.doi);
    if (w === undefined) { out[id] = 'sin-respuesta'; continue; }
    if (w === null) { out[id] = 'no-en-crossref'; continue; }
    const a = norm((w.title || [''])[0]);
    const b = norm(r.titulo);
    out[id] = a && (a.startsWith(b.slice(0, 30)) || b.startsWith(a.slice(0, 30)) || a.includes(b) || b.includes(a)) ? 'verificado' : 'titulo-distinto';
    if (i % 25 === 0) process.stdout.write(`${i}/${ids.length}\n`);
    await sleep(120);
  }
  fs.writeFileSync(path.join(D, 'incluidos-doi.json'), JSON.stringify(out, null, 1) + '\n');
  const c = {};
  Object.values(out).forEach((v) => { c[v] = (c[v] || 0) + 1; });
  console.log(JSON.stringify(c));
})();
