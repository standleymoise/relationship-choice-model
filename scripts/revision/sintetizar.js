#!/usr/bin/env node
'use strict';
/*
 * Revisión sistemática — síntesis.
 * Lee decisiones de cribado y la clasificación manual de modelos, y escribe:
 *   datos/incluidos.csv      registros incluidos con etiquetas temáticas (reglas explícitas)
 *   datos/sintesis.json      recuentos tipo PRISMA, etiquetas y tabla de modelos
 * Verifica que cada entrada de la clasificación corresponda a exactamente un registro incluido.
 */
const fs = require('fs');
const path = require('path');

const D = path.join(__dirname, '..', '..', 'docs', 'revision-sistematica', 'datos');
const read = (n) => JSON.parse(fs.readFileSync(path.join(D, n), 'utf8'));

const REG = fs.existsSync(path.join(D, 'registros-completo.json')) ? 'registros-completo.json' : 'registros.json';
const recs = new Map(read(REG).map((r) => [r.id, r]));
const busq = read('registro-busquedas.json');
const pre = read('preclasificacion.json');
const dec = read('decisiones.json');
const clas = read('clasificacion-modelos.json');

const entries = Object.keys(dec).map((k) => { const i = k.indexOf(':'); return { cola: k.slice(0, i), id: k.slice(i + 1), c: dec[k].c, auto: !!dec[k].auto, porTitulo: !!dec[k].porTitulo }; });
const included = entries.filter((e) => e.c === 'I');

// Etiquetas temáticas por reglas (sobre título + resumen); un registro puede tener varias.
const TAGS = {
  'Sobrecarga de opciones / abundancia': /(choice overload|too many options|number of options|choice abundance|abundance of (options|choice)|too much choice|more options|increasing choice|choice plurality|shopping)/i,
  'Maximizar / satisfacer / arrepentimiento': /(maximi[sz]|satisficing|regret)/i,
  'Alternativas, compromiso y modelo de inversión': /(alternatives?|investment model|commitment|quality of alternatives)/i,
  'Disolución y cambio de pareja': /(dissolution|breakup|break-up|divorce|stay\/leave|stay or leave|marital instability|switching|separation|leaving)/i,
  'Incertidumbre, información y primeras impresiones': /(uncertaint|first impression|information search|information avoidance|warranting|impression|information)/i,
  'Adaptación, novedad y comparación social': /(adaptation|novelty|social comparison|affective forecasting|honeymoon|idealization|decay|satisfaction change|changes in satisfaction|fluctuations)/i,
  'Preferencias declaradas y reveladas': /(stated|revealed|ideal partner|preferences? (predict|fulfil)|preference versus|mate preferences)/i,
  'Modelo formal o computacional': /(agent-based|computational|simulat|mathematical|search model|equilibrium|bandit|marriage market|matching market|two-sided|stopping|economic (analysis|model)|heuristics)/i
};

const rows = [['cola', 'id', 'doi', 'anio', 'titulo', 'etiquetas']];
const tagCount = {};
let byYear = {};
included.forEach((e) => {
  const r = recs.get(e.id);
  const text = r.titulo + ' ' + (r.resumen || '');
  const tags = Object.keys(TAGS).filter((t) => TAGS[t].test(text));
  tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; });
  const decade = r.anio ? Math.floor(r.anio / 10) * 10 + 's' : 's/f';
  byYear[decade] = (byYear[decade] || 0) + 1;
  rows.push([e.cola, e.id, r.doi || '', r.anio, '"' + r.titulo.replace(/"/g, '""') + '"', '"' + tags.join('; ') + '"']);
});
fs.writeFileSync(path.join(D, 'incluidos.csv'), rows.map((r) => r.join(',')).join('\n') + '\n');

// Verificación de la clasificación manual
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const problems = [];
const models = clas.entradas.map((e) => {
  const hits = included.filter((x) => {
    const r = recs.get(x.id);
    return norm(r.titulo).includes(norm(e.titulo)) && Math.abs((r.anio || 0) - e.anio) <= 1;
  });
  if (hits.length === 0) problems.push('sin coincidencia: ' + e.titulo);
  const r = hits.length ? recs.get(hits[0].id) : null;
  return Object.assign({}, e, { registro: r ? r.id : null, duplicados: hits.length > 1 ? hits.length : undefined, doi: r ? r.doi : null, autores: r ? r.autores.slice(0, 2).join('; ') : '' });
});
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }

const count = (queue, code) => entries.filter((e) => e.cola === queue && (code === 'E1-auto' ? e.auto : (e.c === code && !e.auto))).length;
const sintesis = {
  fechaDeLasBusquedas: busq.consultas.map((c) => c.fecha).sort().pop(),
  fuentes: busq.fuentes,
  registrosBrutos: busq.registrosBrutos,
  registrosUnicos: pre.registrosUnicos,
  duplicadosEliminados: busq.registrosBrutos - pre.registrosUnicos,
  excluidosAutomaticosAntesDelCribado: pre.excluidosAutomaticos,
  preclasificacion: { A: pre.nivelA, B: pre.nivelB, C: pre.nivelC, muestraControlDeC: pre.muestraControlC },
  decisiones: ['A', 'B', 'C', 'Ccontrol'].reduce((o, q) => {
    o[q] = { incluidos: count(q, 'I'), E1: count(q, 'E1'), 'E1-auto': count(q, 'E1-auto'), E2: count(q, 'E2'), E3: count(q, 'E3'), E4: count(q, 'E4'), 'ET (por título)': count(q, 'ET'), 'A (análogo no humano)': count(q, 'A') };
    return o;
  }, {}),
  totalIncluidos: included.length,
  etiquetas: tagCount,
  incluidosPorDecada: byYear,
  modelos: models
};
fs.writeFileSync(path.join(D, 'sintesis.json'), JSON.stringify(sintesis, null, 1) + '\n');
console.log(JSON.stringify({ totalIncluidos: sintesis.totalIncluidos, decisiones: sintesis.decisiones, etiquetas: tagCount, porDecada: byYear, problemas: problems.length }, null, 1));
