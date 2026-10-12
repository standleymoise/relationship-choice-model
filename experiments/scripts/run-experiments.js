#!/usr/bin/env node
'use strict';
/*
 * Ejecuta los experimentos definidos en experiments/configuraciones/*.json y guarda,
 * para cada uno, un .json (configuración completa + resultados) y un .csv en
 * experiments/results/. No incluye marcas de tiempo: repetir la ejecución con el
 * mismo código y las mismas semillas debe producir archivos idénticos.
 *
 * Uso:  node experiments/scripts/run-experiments.js [nombre ...]
 *       node experiments/scripts/run-experiments.js --check   (compara con lo guardado)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const S = require('../../src/simulation.js');

const CONFIG_DIR = path.join(__dirname, '..', 'configuraciones');
const RESULT_DIR = path.join(__dirname, '..', 'results');
const DECIMALS = 6;

const round = (v) => (typeof v === 'number' && Number.isFinite(v) ? Number(v.toFixed(DECIMALS)) : v);

function roundSummary(summary) {
  const out = {};
  Object.keys(summary).forEach((m) => {
    const s = summary[m];
    out[m] = { n: s.n, mean: round(s.mean), sd: round(s.sd), se: round(s.se), ci95: s.ci95.map(round) };
  });
  return out;
}

/** Ejecuta una definición de experimento y devuelve el objeto de resultados. */
function runDefinition(def) {
  const seriesList = def.series && def.series.length ? def.series : [{ label: 'base', override: {} }];
  const sweep = def.sweep || null;
  const results = [];
  for (const series of seriesList) {
    const base = JSON.parse(JSON.stringify(def.base || {}));
    mergeInto(base, series.override || {});
    if (sweep) {
      const points = S.runSweep(base, sweep.path, sweep.values);
      points.forEach((p) => results.push({ series: series.label, value: p.value, summary: roundSummary(p.summary) }));
    } else {
      const r = S.runExperiment(base);
      results.push({ series: series.label, value: null, summary: roundSummary(r.summary) });
    }
  }
  const configHash = crypto.createHash('sha256').update(JSON.stringify(def)).digest('hex').slice(0, 16);
  return {
    modelVersion: S.VERSION,
    name: def.name,
    hypothesis: def.hypothesis || null,
    description: def.description,
    notice: 'Agentes ficticios con reglas programadas: no son observaciones de personas reales.',
    configHash,
    definition: def,
    effectiveDefaults: S.DEFAULTS,
    results
  };
}

function mergeInto(target, src) {
  Object.keys(src).forEach((k) => {
    if (src[k] !== null && typeof src[k] === 'object' && !Array.isArray(src[k])) {
      target[k] = target[k] && typeof target[k] === 'object' ? target[k] : {};
      mergeInto(target[k], src[k]);
    } else target[k] = src[k];
  });
}

function toCsv(res) {
  const header = ['experimento', 'serie', 'parametro', 'valor', 'metrica', 'n', 'media', 'sd', 'se', 'ic95_inf', 'ic95_sup'];
  const rows = [header];
  const param = res.definition.sweep ? res.definition.sweep.path : '';
  res.results.forEach((r) => {
    S.METRICS.forEach((m) => {
      const s = r.summary[m];
      rows.push([res.name, r.series, param, r.value === null ? '' : r.value, m, s.n, s.mean, s.sd, s.se, s.ci95[0], s.ci95[1]]);
    });
  });
  return rows.map((row) => row.map((v) => (v === null || v === undefined ? '' : /[",;\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v)).join(',')).join('\n') + '\n';
}

function loadDefinitions() {
  return fs.readdirSync(CONFIG_DIR).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, f), 'utf8')));
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const wanted = args.filter((a) => !a.startsWith('--'));
  const defs = loadDefinitions().filter((d) => wanted.length === 0 || wanted.includes(d.name));
  fs.mkdirSync(RESULT_DIR, { recursive: true });
  let drift = 0;
  for (const def of defs) {
    const t0 = Date.now();
    const res = runDefinition(def);
    const json = JSON.stringify(res, null, 2) + '\n';
    const csv = toCsv(res);
    const jf = path.join(RESULT_DIR, def.name + '.json');
    const cf = path.join(RESULT_DIR, def.name + '.csv');
    if (check) {
      const same = fs.existsSync(jf) && fs.readFileSync(jf, 'utf8').replace(/\r\n/g, '\n') === json
        && fs.existsSync(cf) && fs.readFileSync(cf, 'utf8').replace(/\r\n/g, '\n') === csv;
      console.log((same ? 'IGUAL     ' : 'DIFERENTE ') + def.name);
      if (!same) drift++;
    } else {
      fs.writeFileSync(jf, json);
      fs.writeFileSync(cf, csv);
      console.log(`escrito ${def.name} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    }
  }
  if (check && drift > 0) {
    console.error(`${drift} experimento(s) no reproducen los resultados guardados.`);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { runDefinition, toCsv, loadDefinitions };
