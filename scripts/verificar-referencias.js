#!/usr/bin/env node
'use strict';
/*
 * Verifica cada referencia con DOI de docs/referencias.json contra la API pública de Crossref
 * (título y año) y regenera docs/referencias.md. Requiere conexión. Un DOI inexistente o con
 * título/año distinto marca la entrada como DISCREPANCIA y el script termina con error.
 *   node scripts/verificar-referencias.js
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'docs', 'referencias.json');
const OUT = path.join(__dirname, '..', 'docs', 'referencias.md');
const norm = (s) => s.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9áéíóúüñ]+/g, ' ').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWork(doi) {
  for (let t = 0; t < 4; t++) {
    try {
      const r = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi), {
        headers: { 'User-Agent': 'relationship-choice-model-reference-check (https://github.com/standleymoise/relationship-choice-model)' }
      });
      if (r.status === 404) return null;
      if (r.ok) return (await r.json()).message;
    } catch (e) { /* reintentar */ }
    await sleep(1000 * (t + 1));
  }
  throw new Error('Crossref no respondió para ' + doi);
}

const TOPICS = {
  sobrecarga: 'Sobrecarga de opciones',
  'sobrecarga-citas': 'Sobrecarga y elección de pareja',
  satisfaccion: 'Maximizar y satisfacer',
  busqueda: 'Búsqueda secuencial y parada óptima',
  modelos: 'Modelos computacionales de elección de pareja',
  compromiso: 'Compromiso, alternativas y modelo de inversión',
  decision: 'Decisión bajo incertidumbre y sesgo de selección',
  incertidumbre: 'Incertidumbre en relaciones iniciales',
  adaptacion: 'Adaptación, previsión afectiva y comparación',
  preferencias: 'Preferencias declaradas y reveladas',
  metodologia: 'Metodología de modelos basados en agentes'
};

(async () => {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  let bad = 0;
  for (const ref of data.referencias) {
    const w = await fetchWork(ref.doi);
    if (!w) { ref.status = 'DISCREPANCIA: DOI inexistente'; bad++; continue; }
    const cTitle = norm((w.title || [''])[0]);
    const mine = norm(ref.title);
    const years = [w.issued, w['published-print'], w['published-online']]
      .filter(Boolean).map((d) => d['date-parts'] && d['date-parts'][0][0]).filter(Boolean);
    const titleOk = cTitle.length > 0 && (mine.startsWith(cTitle) || cTitle.startsWith(mine) || mine.includes(cTitle));
    const yearOk = years.some((y) => Math.abs(y - ref.year) <= 1);
    const strip = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[’‘]/g, "'").toLowerCase();
    const first = (w.author && w.author[0] && w.author[0].family) || '';
    const authorOk = first === '' || strip(ref.authors).startsWith(strip(first)) || (ref.crossrefAuthor && strip(ref.crossrefAuthor) === strip(first));
    const m = /,\s*(\d+)(\(|,|\s|$)/.exec(ref.venue);
    const volOk = !m || !w.volume || String(w.volume) === m[1];
    const pm = /(d+)[–-](d+)/.exec(ref.venue);
    const pageOk = !pm || !w.page || String(w.page).split('-')[0] === pm[1];
    if (titleOk && yearOk && authorOk && volOk && pageOk) ref.status = 'verificada-crossref';
    else if (titleOk && yearOk) {
      ref.status = `DISCREPANCIA: ${authorOk ? '' : 'primer autor distinto (' + first + ') '}${volOk ? '' : 'volumen distinto (Crossref: ' + w.volume + ') '}${pageOk ? '' : 'página inicial distinta (Crossref: ' + w.page + ')'}`.trim();
      bad++;
    }
    else {
      ref.status = `DISCREPANCIA: título ${titleOk ? 'ok' : 'distinto (' + (w.title || [''])[0] + ')'}, año ${yearOk ? 'ok' : 'distinto (' + years.join('/') + ')'}`;
      bad++;
    }
    await sleep(150);
  }
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

  let md = '# Referencias\n\nGenerado por `scripts/verificar-referencias.js` a partir de `docs/referencias.json`. ' +
    '«Verificada» significa que **el DOI existe en Crossref y que título, año, primer autor, volumen y página inicial (cuando se indican) coinciden**; no se comprueban el número ni los autores posteriores; no significa que se haya leído el artículo completo ni que sus conclusiones se aprueben. ' +
    'Las referencias sin DOI comprobado figuran al final como **pendientes de verificación** y el proyecto no se apoya en ellas.\n\n';
  Object.keys(TOPICS).forEach((k) => {
    const items = data.referencias.filter((r) => r.topic === k).sort((a, b) => a.authors.localeCompare(b.authors));
    if (!items.length) return;
    md += `## ${TOPICS[k]}\n\n`;
    items.forEach((r) => { md += `- ${r.authors} (${r.year}). ${r.title}. *${r.venue}*. https://doi.org/${r.doi} — ${r.status}\n`; });
    md += '\n';
  });
  md += '## Pendientes de verificación\n\n';
  data.pendientes.forEach((r) => { md += `- ${r.authors} (${r.year}). ${r.title}. ${r.venue}. — **pendiente**: ${r.note}\n`; });
  fs.writeFileSync(OUT, md);
  console.log(`${data.referencias.length - bad}/${data.referencias.length} verificadas; ${data.pendientes.length} pendientes; ${bad} con discrepancia`);
  if (bad) {
    data.referencias.filter((r) => r.status.startsWith('DISCREP')).forEach((r) => console.error(' -', r.id, r.status));
    process.exit(1);
  }
})();
