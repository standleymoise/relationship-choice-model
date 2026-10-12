#!/usr/bin/env node
'use strict';
/* Genera docs/tablas-resultados.md a partir de experiments/results/*.json (sin editar a mano). */
const fs = require('fs');
const path = require('path');

const RES = path.join(__dirname, '..', 'experiments', 'results');
const OUT = path.join(__dirname, '..', 'docs', 'tablas-resultados.md');
const COLS = [
  ['switches', 'Cambios'],
  ['regretShare', 'Cambios que empeoran'],
  ['meanGainPerSwitch', 'Ganancia verdadera por cambio'],
  ['meanOverestimation', 'Sobreestimación al elegir'],
  ['welfareVsStaying', 'Bienestar vs. no cambiar'],
  ['netVsStaying', 'Neto de costes vs. no cambiar'],
  ['meanPerceivedSatisfaction', 'Satisfacción percibida'],
  ['moneyCost', 'Coste monetario']
];

const f = (s, d) => (s.mean === null ? '—' : `${s.mean.toFixed(d)} ± ${(1.96 * s.se).toFixed(d)}`);
const dec = (m) => (m === 'regretShare' ? 3 : 2);

let md = '# Tablas de resultados (generadas automáticamente)\n\n' +
  'Generado por `scripts/tablas-resultados.js` desde `experiments/results/*.json`. No editar a mano.\n' +
  'Cada celda es media ± 1,96·error estándar entre corridas independientes. ' +
  '**Son resultados de agentes ficticios con reglas programadas; no describen a personas reales.**\n\n' +
  'Unidades: utilidad en puntos de una escala nominal 0–100 (media 50, desvío 15 en la población ficticia). ' +
  '«Cambios que empeoran» = proporción de cambios tras los cuales el ajuste verdadero (que el agente no observa) es menor que antes.\n\n';

fs.readdirSync(RES).filter((x) => x.endsWith('.json') && x !== 'escenario-80-20.json').sort().forEach((file) => {
  const r = JSON.parse(fs.readFileSync(path.join(RES, file), 'utf8'));
  const sweep = r.definition.sweep;
  md += `## ${r.name}${r.hypothesis ? ` (${r.hypothesis})` : ''}\n\n${r.description}\n\n`;
  md += `Corridas por celda: ${r.definition.base.runs}. Semilla base: ${r.definition.base.seed}. Hash de configuración: \`${r.configHash}\`.\n\n`;
  md += '| Serie | ' + (sweep ? `\`${sweep.path}\` | ` : '') + COLS.map((c) => c[1]).join(' | ') + ' |\n';
  md += '|---|' + (sweep ? '---|' : '') + COLS.map(() => '---|').join('') + '\n';
  r.results.forEach((row) => {
    md += `| ${row.series} | ` + (sweep ? `${row.value} | ` : '') + COLS.map((c) => f(row.summary[c[0]], dec(c[0]))).join(' | ') + ' |\n';
  });
  md += '\n';
});

// Escenario 80–20 determinista
const esc = JSON.parse(fs.readFileSync(path.join(RES, 'escenario-80-20.json'), 'utf8'));
md += '## escenario-80-20 (cálculo determinista)\n\n' + esc.description + '\n\n';
md += `Valores fijos: A observado G1 = ${esc.fixed.observedA.G1}, G2 = ${esc.fixed.observedA.G2} con ${esc.fixed.infoA} unidades de información; ` +
  `B observado G1 = ${esc.fixed.observedB.G1}, G2 = ${esc.fixed.observedB.G2}; aspiración ${esc.fixed.aspiration}. ` +
  'Cada celda es la utilidad neta de cambiar; ▲ = el agente cambiaría. «E[ganancia verdadera]» es la esperanza de U_B − U_A dado lo observado (referencia racional).\n\n';
const combos = [['bayes', 1, 0], ['bayes', 1, 3], ['bayes', 2.25, 0], ['naive', 1, 0], ['naive', 1, 3], ['naive', 2.25, 0], ['naive', 2.25, 3]];
[1, 3, 8].forEach((nB) => {
  md += `### Información sobre B = ${nB} unidad(es)\n\n`;
  md += '| Peso de G2 | E[ganancia verdadera] | ' + combos.map((c) => `${c[0]} λ=${c[1]} γ=${c[2]}`).join(' | ') + ' |\n';
  md += '|---|---|' + combos.map(() => '---|').join('') + '\n';
  [0.05, 0.1, 0.2, 0.3, 0.4, 0.5].forEach((sh) => {
    const rows = esc.rows.filter((r) => r.infoB === nB && r.shareG2 === sh);
    const cells = combos.map((c) => {
      const r = rows.find((x) => x.agent === c[0] && x.lossAversion === c[1] && x.focal === c[2]);
      return r.decisionUtility.toFixed(1) + (r.switches ? ' ▲' : '');
    });
    md += `| ${sh} | ${rows[0].expectedTrueGain.toFixed(1)} | ${cells.join(' | ')} |\n`;
  });
  md += '\n';
});

fs.writeFileSync(OUT, md);
console.log('escrito', path.relative(process.cwd(), OUT));
