#!/usr/bin/env node
'use strict';
/*
 * Escenario 80–20 como cálculo determinista (sin aleatoriedad).
 * Dos grupos de factores: G1 (pesa 1−s) y G2 (pesa s). La pareja actual A es fuerte en G1 y débil
 * en G2; la persona nueva B tiene la impresión inversa, con poca información.
 * "80–20" es el caso s = 0,20; aquí s se barre porque NO es una constante.
 * Los valores 85/45 (A) y 75/85 (B) son ilustrativos, no datos.
 */
const fs = require('fs');
const path = require('path');
const M = require('../../src/model.js');

const PRIOR = { mean: 50, sd: 15 };
const OBS_SD = 15;
const N_A = 8;
const OBS_A = [85, 45]; // [G1, G2]
const OBS_B = [75, 85];
const ASPIRATION = 70;

function perceived(obs, n, agent) {
  return obs.map((y) => (agent === 'naive' ? y : M.posterior(PRIOR.mean, PRIOR.sd, OBS_SD, n, y).mean));
}

const rows = [];
for (const s of [0.05, 0.1, 0.2, 0.3, 0.4, 0.5]) {
  const w = [1 - s, s];
  for (const nB of [1, 3, 8]) {
    // Esperanza del valor verdadero dado lo observado (referencia racional, igual para todos los agentes)
    const mA = perceived(OBS_A, N_A, 'bayes');
    const mB = perceived(OBS_B, nB, 'bayes');
    const expectedTrueGain = M.weightedUtility(mB, w) - M.weightedUtility(mA, w);
    for (const agent of ['bayes', 'naive']) {
      const pA = perceived(OBS_A, N_A, agent);
      const pB = perceived(OBS_B, nB, agent);
      for (const lambda of [1, 2.25]) {
        for (const gamma of [0, 3]) {
          const wDec = M.focalWeights(w, pA, ASPIRATION, gamma);
          const net = M.switchUtility(wDec, pA, pB, lambda, 0).net;
          rows.push({
            shareG2: s, infoB: nB, agent, lossAversion: lambda, focal: gamma,
            decisionUtility: +net.toFixed(4), switches: net > 0,
            expectedTrueGain: +expectedTrueGain.toFixed(4)
          });
        }
      }
    }
  }
}

const out = {
  name: 'escenario-80-20',
  description: 'Cálculo determinista del caso A fuerte en G1 / B fuerte en G2. Ilustra bajo qué supuestos la decisión de cambiar se invierte. No hay datos reales.',
  fixed: { prior: PRIOR, obsSd: OBS_SD, infoA: N_A, observedA: { G1: OBS_A[0], G2: OBS_A[1] }, observedB: { G1: OBS_B[0], G2: OBS_B[1] }, aspiration: ASPIRATION },
  rows
};
const dir = path.join(__dirname, '..', 'results');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'escenario-80-20.json'), JSON.stringify(out, null, 2) + '\n');
const header = Object.keys(rows[0]);
fs.writeFileSync(path.join(dir, 'escenario-80-20.csv'), [header.join(',')].concat(rows.map((r) => header.map((h) => r[h]).join(','))).join('\n') + '\n');
console.log('escrito escenario-80-20 (' + rows.length + ' filas)');
if (process.argv.includes('--print')) console.table(rows.filter((r) => r.infoB === 1 && r.lossAversion === 1));
