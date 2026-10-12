#!/usr/bin/env node
'use strict';
/*
 * Revisión sistemática — cribado.
 *
 *   node scripts/revision/cribar.js pre                      preclasifica (niveles A/B/C) y fija la muestra de control
 *   node scripts/revision/cribar.js ver A 0 25               imprime registros 0..24 de la cola A para leerlos
 *   node scripts/revision/cribar.js dec A "0:I 1:E1 2:E2"     registra decisiones (idx:código) de la cola A
 *   node scripts/revision/cribar.js exportar                 escribe cribado.csv y los recuentos tipo PRISMA
 *
 * Códigos: I = incluir; E1 = no es pareja romántica humana; E2 = relaciones solo como contexto;
 *          E3 = no sustantivo o sin contenido identificable; E5 = fuera de ventana/idioma.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'docs', 'revision-sistematica', 'datos');
const F = (n) => path.join(DIR, n);
// Con los resúmenes (solo en local) si existen; si no, solo metadatos públicos.
const REG = fs.existsSync(F('registros-completo.json')) ? 'registros-completo.json' : 'registros.json';
const read = (n, d) => (fs.existsSync(F(n)) ? JSON.parse(fs.readFileSync(F(n), 'utf8')) : d);
const write = (n, o) => fs.writeFileSync(F(n), JSON.stringify(o, null, 1) + '\n');

const PARTNER = /\b(mate|mates|mating|partner|partners|romantic|dating|marriage|marital|spouse|spouses|courtship|couple|couples)\b/i;
const MODEL = /(agent-based|computational|simulat|mathematical model|formal model|game-theor|bandit|reinforcement learning|optimal stopping|secretary problem|bayesian|stochastic|algorithm|equilibrium|dynamic model|theoretical model|we model|a model of)/i;
const DECISION = /(search|switch|alternative|choice|choos|stopping|sequential|uncertain|information|learn|belief|regret|satisf|decision|replace|dissol|divorce|breakup)/i;
const MECH = {
  sobrecarga: /(choice overload|too many options|number of options|abundance of (options|choice))/i,
  sesgo: /(winner'?s curse|optimizer'?s curse|selection bias)/i,
  informacion: /(incomplete information|imperfect information|first impression|uncertaint)/i,
  alternativas: /(alternative)/i,
  adaptacion: /(hedonic adaptation|honeymoon|novelty)/i,
  foco: /(focalism|affective forecasting|social comparison)/i,
  arrepentimiento: /(regret|choice satisfaction|decision satisfaction)/i
};
// Indicios de relaciones humanas. Si ni el título ni el resumen contienen ninguno, el registro se excluye como E1-auto.
const HUMAN_CUE = /(romantic|dating|marriage|marital|spouse|husband|wife|wives|couples?|courtship|human|humans|people|participants|students|men and women|singles|ideal partner|long-term relationship|divorce|intimate|relationship satisfaction|commitment)/i;
const NON_SUBSTANTIVE = new Set(['erratum', 'paratext', 'peer-review', 'retraction']);

function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function pre() {
  const recs = read(REG, []);
  const excluded = { E3: [], E5: [] };
  const colas = { A: [], B: [], C: [] };
  recs.forEach((r) => {
    if (NON_SUBSTANTIVE.has(r.tipo)) { excluded.E3.push(r.id); return; }
    if ((r.anio && r.anio < 1950) || (r.idioma && !['en', 'es', 'pt'].includes(r.idioma))) { excluded.E5.push(r.id); return; }
    const text = r.titulo + ' ' + (r.resumen || '');
    r._mech = Object.keys(MECH).filter((k) => MECH[k].test(text));
    const partner = PARTNER.test(text);
    if (partner && MODEL.test(text) && DECISION.test(text)) colas.A.push(r);
    else if (partner && r._mech.length) colas.B.push(r);
    else colas.C.push(r);
  });
  const byCit = (a, b) => b.citas - a.citas;
  colas.A.sort((a, b) => (b._mech.length - a._mech.length) || byCit(a, b));
  colas.B.sort((a, b) => (b._mech.length - a._mech.length) || byCit(a, b));
  // Muestra de control del nivel C: 60 registros al azar con semilla fija.
  const rnd = mulberry(20261011);
  const pool = colas.C.slice();
  const control = [];
  while (control.length < 60 && pool.length) control.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  write('cola-A.json', colas.A.map((r) => r.id));
  write('cola-B.json', colas.B.map((r) => r.id));
  write('cola-C-control.json', control.map((r) => r.id));
  write('cola-C.json', colas.C.map((r) => r.id));
  write('preclasificacion.json', { registrosUnicos: recs.length, excluidosAutomaticos: { E3_tipoNoSustantivo: excluded.E3.length, E5_ventanaOIdioma: excluded.E5.length }, nivelA: colas.A.length, nivelB: colas.B.length, nivelC: colas.C.length, muestraControlC: control.length });
  console.log(JSON.stringify(read('preclasificacion.json')));
}

function idsOf(tier) { return read(`cola-${tier === 'Ccontrol' ? 'C-control' : tier}.json`, []); }

function auto(tier) {
  const recs = new Map(read(REG, []).map((r) => [r.id, r]));
  const decisions = read('decisiones.json', {});
  let k = 0;
  idsOf(tier).forEach((id) => {
    const key = `${tier}:${id}`;
    if (decisions[key]) return;
    const r = recs.get(id);
    if (!HUMAN_CUE.test(r.titulo + ' ' + (r.resumen || ''))) { decisions[key] = { c: 'E1', auto: true }; k++; }
  });
  write('decisiones.json', decisions);
  console.log(`${k} excluidos automáticamente (E1-auto) en la cola ${tier}`);
}

function ver(tier, start, n, onlyPending) {
  const recs = new Map(read(REG, []).map((r) => [r.id, r]));
  const ids = idsOf(tier);
  const decisions = read('decisiones.json', {});
  let shown = 0;
  for (let i = start; i < ids.length && shown < n; i++) {
    const r = recs.get(ids[i]);
    if (onlyPending && decisions[`${tier}:${ids[i]}`]) continue;
    shown++;
    const done = decisions[`${tier}:${ids[i]}`] ? ` [ya: ${decisions[`${tier}:${ids[i]}`].c}]` : '';
    console.log(`#${i}${done} ${r.anio} | ${(r.autores || []).slice(0, 2).join(', ')} | ${r.publicacion || '—'} | citas ${r.citas}`);
    console.log(`  T: ${r.titulo}`);
    console.log(`  R: ${(r.resumen || '(sin resumen)').slice(0, 520)}`);
  }
  console.log(`-- cola ${tier}: ${ids.length} registros; decididos ${Object.keys(decisions).filter((k) => k.startsWith(tier + ':')).length}`);
}

// Cribado solo por título: lista compacta; inc marca I las posiciones indicadas y ET el resto del rango.
function tit(tier, start, n) {
  const recs = new Map(read(REG, []).map((r) => [r.id, r]));
  const ids = idsOf(tier);
  const decisions = read('decisiones.json', {});
  const control = new Set(read('cola-C-control.json', []));
  let shown = 0;
  for (let i = start; i < ids.length && shown < n; i++) {
    if (decisions[`${tier}:${ids[i]}`] || control.has(ids[i])) continue;
    shown++;
    const r = recs.get(ids[i]);
    console.log(`${i}|${r.anio}|${r.titulo.slice(0, 115)}`);
  }
}

function inc(tier, start, n, list) {
  const ids = idsOf(tier);
  const decisions = read('decisiones.json', {});
  const control = new Set(read('cola-C-control.json', []));
  const yes = new Set(list.trim() ? list.trim().split(/\s+/).map(Number) : []);
  let seen = 0, k = 0, y = 0;
  for (let i = start; i < ids.length && seen < n; i++) {
    const key = `${tier}:${ids[i]}`;
    if (decisions[key] || control.has(ids[i])) continue;
    seen++;
    decisions[key] = { c: yes.has(i) ? 'I' : 'ET', porTitulo: true };
    if (yes.has(i)) y++; else k++;
  }
  write('decisiones.json', decisions);
  console.log(`${y} incluidos, ${k} excluidos por título (${seen} del rango)`);
}

function dec(tier, spec) {
  const ids = idsOf(tier);
  const decisions = read('decisiones.json', {});
  let k = 0;
  spec.trim().split(/\s+/).forEach((pair) => {
    const [i, code] = pair.split(':');
    const id = ids[Number(i)];
    if (!id || !/^(I|A|E1|E2|E3|E4|E5|NS|ET)$/.test(code)) throw new Error('par inválido: ' + pair);
    decisions[`${tier}:${id}`] = { c: code };
    k++;
  });
  write('decisiones.json', decisions);
  console.log(`${k} decisiones registradas`);
}

function exportar() {
  const recs = new Map(read(REG, []).map((r) => [r.id, r]));
  const decisions = read('decisiones.json', {});
  const rows = [['cola', 'id', 'doi', 'anio', 'titulo', 'decision', 'motivo']];
  const count = {};
  Object.keys(decisions).sort().forEach((k) => {
    const cut = k.indexOf(':');
    const tier = k.slice(0, cut);
    const id = k.slice(cut + 1);
    const r = recs.get(id);
    const code = decisions[k].c;
    count[tier] = count[tier] || { I: 0, E1: 0, 'E1-auto': 0, E2: 0, E3: 0, E4: 0, E5: 0, NS: 0, ET: 0, A: 0 };
    count[tier][decisions[k].auto ? 'E1-auto' : code]++;
    rows.push([tier, id, r.doi || '', r.anio, '"' + r.titulo.replace(/"/g, '""') + '"', code === 'I' ? 'incluido' : 'excluido', decisions[k].auto ? 'E1-auto' : code]);
  });
  fs.writeFileSync(F('cribado.csv'), rows.map((r) => r.join(',')).join('\n') + '\n');
  write('recuentos-cribado.json', count);
  console.log(JSON.stringify(count));
}

const [cmd, a, b, c] = process.argv.slice(2);
if (cmd === 'pre') pre();
else if (cmd === 'ver') ver(a, Number(b), Number(c), process.argv[6] === 'pend');
else if (cmd === 'auto') auto(a);
else if (cmd === 'tit') tit(a, Number(b), Number(c));
else if (cmd === 'inc') inc(a, Number(b), Number(c), process.argv[6] || '');
else if (cmd === 'dec') dec(a, b);
else if (cmd === 'exportar') exportar();
else console.log('uso: pre | ver <cola> <inicio> <n> | dec <cola> "<idx:código ...>" | exportar');
