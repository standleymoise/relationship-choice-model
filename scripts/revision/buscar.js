#!/usr/bin/env node
'use strict';
/*
 * Revisión sistemática — fase de búsqueda (v2: varias fuentes, con caché).
 *
 *   node scripts/revision/buscar.js            ejecuta las consultas que no estén en caché y consolida
 *   node scripts/revision/buscar.js --consolidar   solo consolida lo que ya está en caché
 *
 * Fuentes (APIs públicas, sin clave): Semantic Scholar (búsqueda booleana "bulk"), Europe PMC y Crossref.
 * Cada respuesta se guarda en datos/cache/ apenas llega, de modo que una interrupción no pierde nada.
 * Salida: datos/registro-busquedas.json y datos/registros.json (deduplicados, con resumen cuando existe).
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', '..', 'docs', 'revision-sistematica', 'datos');
const CACHE = path.join(OUT, 'cache');
const MAX_PER_QUERY = 300;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Términos ----------
const PARTNER = ['"mate choice"', '"mate search"', '"mate selection"', '"partner choice"', '"partner selection"', '"partner search"',
  '"romantic partner"', '"romantic partners"', '"romantic relationship"', '"online dating"', '"speed dating"', '"dating app"', '"marriage market"', '"mating market"'];
const TOPIC = {
  T01_sobrecarga: ['"choice overload"', '"too many options"', '"number of options"', '"abundance of options"'],
  T02_parada: ['"optimal stopping"', '"secretary problem"', '"sequential search"', '"stopping rule"'],
  T03_satisfacer: ['satisficing', 'maximizing', '"aspiration level"', 'maximizer'],
  T04_agentes: ['"agent-based"', '"computational model"', '"reinforcement learning"', '"multi-armed bandit"'],
  T05_simulacion: ['simulation', '"Monte Carlo"', '"mathematical model"', '"formal model"'],
  T06_informacion: ['"incomplete information"', '"imperfect information"', '"first impressions"', '"noisy"'],
  T07_sesgo: ['"winner\'s curse"', '"optimizer\'s curse"', '"selection bias"', '"regression to the mean"'],
  T08_incertidumbre: ['Bayesian', '"uncertainty reduction"', '"relational uncertainty"', '"learning about"'],
  T09_alternativas: ['"quality of alternatives"', '"attractive alternatives"', '"alternative partners"', '"alternatives to"'],
  T10_cambio: ['"partner switching"', '"relationship dissolution"', 'breakup', '"partner replacement"'],
  T11_adaptacion: ['"hedonic adaptation"', 'honeymoon', 'novelty', '"satisfaction decline"'],
  T12_foco: ['focalism', '"affective forecasting"', '"social comparison"', '"grass is greener"'],
  T13_arrepentimiento: ['regret', '"decision satisfaction"', '"choice satisfaction"', '"post-decision"'],
  T14_declarado: ['"stated preferences"', '"revealed preferences"', '"ideal partner preferences"', '"actual choices"']
};
const EXTRA = {
  S1_inversion: '("investment model" | "Investment Model Scale") + ("quality of alternatives" | alternatives)',
  S3_calidad_match: '("match quality" | "match-specific") + (marriage | divorce | cohabitation) + (learning | Bayesian | uncertainty)',
  S4_inestabilidad: '("marital instability" | divorce) + ("outside options" | alternatives | search)',
  S5_busqueda_pareja: '("mate search" | "partner search" | "search for a partner") + (cost | costs | "search cost")'
};

// Sintaxis por fuente
const syn = {
  s2: { or: ' | ', and: ' + ' },
  epmc: { or: ' OR ', and: ' AND ' }
};
function build(source, partner, topics) {
  const s = syn[source];
  const wrap = (terms) => '(' + terms.map((t) => (source === 'epmc' ? 'TITLE_ABS:' + t : t)).join(s.or) + ')';
  return wrap(partner) + s.and + wrap(topics);
}

const queries = [];
Object.keys(TOPIC).forEach((t) => queries.push({ id: 'P' + 'x' + t, s2: build('s2', PARTNER, TOPIC[t]), epmc: build('epmc', PARTNER, TOPIC[t]) }));
Object.keys(EXTRA).forEach((k) => queries.push({ id: k, s2: EXTRA[k], epmc: null }));

// ---------- HTTP con reintentos ----------
async function getJson(url, label) {
  let wait = 4000;
  for (let t = 0; t < 8; t++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'relationship-choice-model-literature-search' } });
      if (r.status === 429 || r.status >= 500) { await sleep(wait); wait = Math.min(wait * 2, 90000); continue; }
      if (!r.ok) throw new Error(label + ' HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (/HTTP 4/.test(String(e.message))) throw e;
      await sleep(wait); wait = Math.min(wait * 2, 90000);
    }
  }
  return null; // se anota como fallo en el registro
}

// ---------- Adaptadores ----------
async function searchS2(q) {
  const out = [];
  let token = null;
  let total = null;
  while (out.length < MAX_PER_QUERY) {
    const u = 'https://api.semanticscholar.org/graph/v1/paper/search/bulk?query=' + encodeURIComponent(q) +
      '&year=1950-&sort=citationCount:desc&fields=title,abstract,year,venue,citationCount,authors,externalIds,publicationTypes' + (token ? '&token=' + encodeURIComponent(token) : '');
    const j = await getJson(u, 'S2');
    if (!j) return { ok: false, total, items: out };
    total = j.total;
    (j.data || []).forEach((p) => out.push({
      fuente: 's2', id: 'S2:' + p.paperId, doi: p.externalIds && p.externalIds.DOI ? p.externalIds.DOI.toLowerCase() : null,
      titulo: p.title, anio: p.year, tipo: (p.publicationTypes || []).join('|'), idioma: null, citas: p.citationCount || 0,
      autores: (p.authors || []).slice(0, 4).map((a) => a.name), publicacion: p.venue || null, resumen: p.abstract || ''
    }));
    token = j.token;
    if (!token || !(j.data || []).length) break;
    await sleep(1200);
  }
  return { ok: true, total, items: out.slice(0, MAX_PER_QUERY) };
}

async function searchEpmc(q) {
  const out = [];
  let cursor = '*';
  let total = null;
  while (out.length < MAX_PER_QUERY) {
    const u = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=' + encodeURIComponent(q + ' AND PUB_YEAR:[1950 TO 2026]') +
      '&format=json&resultType=core&pageSize=100&sort=CITED%20desc&cursorMark=' + encodeURIComponent(cursor);
    const j = await getJson(u, 'EPMC');
    if (!j) return { ok: false, total, items: out };
    total = j.hitCount;
    (j.resultList && j.resultList.result || []).forEach((p) => out.push({
      fuente: 'epmc', id: 'EPMC:' + p.source + ':' + p.id, doi: p.doi ? p.doi.toLowerCase() : null,
      titulo: (p.title || '').replace(/<[^>]+>/g, ''), anio: p.pubYear ? Number(p.pubYear) : null, tipo: p.pubType || '', idioma: p.language ? ({ eng: 'en', spa: 'es', por: 'pt' }[p.language] || p.language) : null,
      citas: p.citedByCount || 0, autores: (p.authorString || '').split(', ').slice(0, 4), publicacion: p.journalTitle || null,
      resumen: (p.abstractText || '').replace(/<[^>]+>/g, '')
    }));
    if (!j.nextCursorMark || j.nextCursorMark === cursor || !(j.resultList.result || []).length) break;
    cursor = j.nextCursorMark;
    await sleep(500);
  }
  return { ok: true, total, items: out.slice(0, MAX_PER_QUERY) };
}

async function runAll() {
  fs.mkdirSync(CACHE, { recursive: true });
  for (const q of queries) {
    for (const src of ['s2', 'epmc']) {
      if (!q[src]) continue;
      const file = path.join(CACHE, `${src}__${q.id}.json`);
      if (fs.existsSync(file) && JSON.parse(fs.readFileSync(file, 'utf8')).ok) continue;
      const res = src === 's2' ? await searchS2(q.s2) : await searchEpmc(q.epmc);
      fs.writeFileSync(file, JSON.stringify({ fuente: src, consulta: q[src], fecha: new Date().toISOString().slice(0, 10), ...res }));
      console.log(`${src} ${q.id}: ${res.ok ? 'ok' : 'FALLÓ'} total=${res.total} recuperados=${res.items.length}`);
      await sleep(1500);
    }
  }
}

function consolidar() {
  const norm = (s) => (s || '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9áéíóúüñ]+/g, ' ').trim();
  const log = [];
  const byKey = new Map();
  let bruto = 0;
  fs.readdirSync(CACHE).filter((f) => f.endsWith('.json')).sort().forEach((f) => {
    const c = JSON.parse(fs.readFileSync(path.join(CACHE, f), 'utf8'));
    const qid = f.replace(/\.json$/, '');
    log.push({ consulta: qid, fuente: c.fuente, cadena: c.consulta, fecha: c.fecha, completa: c.ok, totalEnLaFuente: c.total, recuperados: c.items.length });
    c.items.forEach((r) => {
      if (!r.titulo) return;
      bruto++;
      const tk = 'T:' + norm(r.titulo).slice(0, 120);
      const key = r.doi || tk;
      let rec = byKey.get(key) || byKey.get(tk);
      if (!rec) {
        rec = { id: r.id, doi: r.doi, titulo: r.titulo, anio: r.anio, tipo: r.tipo, idioma: r.idioma, citas: r.citas, autores: r.autores, publicacion: r.publicacion, resumen: r.resumen || '', fuentes: [], consultas: [] };
        byKey.set(key, rec); byKey.set(tk, rec);
      } else {
        if ((r.resumen || '').length > rec.resumen.length) rec.resumen = r.resumen;
        if (!rec.doi && r.doi) rec.doi = r.doi;
        if (r.citas > rec.citas) rec.citas = r.citas;
        if (!rec.idioma && r.idioma) rec.idioma = r.idioma;
      }
      if (!rec.fuentes.includes(r.fuente)) rec.fuentes.push(r.fuente);
      if (!rec.consultas.includes(qid)) rec.consultas.push(qid);
    });
  });
  const unique = Array.from(new Set(byKey.values()));
  fs.writeFileSync(path.join(OUT, 'registro-busquedas.json'), JSON.stringify({
    fuentes: 'Semantic Scholar (búsqueda booleana en título y resumen), Europe PMC (TITLE_ABS), consultas guardadas en datos/cache/',
    criteriosDeRecuperacion: `por consulta y fuente, hasta ${MAX_PER_QUERY} registros ordenados por número de citas (descendente)`,
    registrosBrutos: bruto,
    registrosUnicosTrasDeduplicar: unique.length,
    consultas: log
  }, null, 2) + '\n');
  // Los resúmenes son de terceros: se guardan solo en local (registros-completo.json, ignorado por git).
  // El archivo público registros.json conserva únicamente metadatos.
  fs.writeFileSync(path.join(OUT, 'registros-completo.json'), JSON.stringify(unique) + '\n');
  fs.writeFileSync(path.join(OUT, 'registros.json'), JSON.stringify(unique.map((r) => Object.assign({}, r, { resumen: undefined, tieneResumen: !!r.resumen }))) + '\n');
  console.log(`registros brutos: ${bruto}; únicos: ${unique.length}`);
}

(async () => {
  if (!process.argv.includes('--consolidar')) await runAll();
  consolidar();
})();
