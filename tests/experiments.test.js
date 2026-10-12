'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runDefinition, loadDefinitions } = require('../experiments/scripts/run-experiments.js');

const RESULTS = path.join(__dirname, '..', 'experiments', 'results');

test('cada experimento reproduce exactamente los resultados guardados en el repositorio', () => {
  const defs = loadDefinitions();
  assert.ok(defs.length >= 8, 'faltan configuraciones');
  for (const def of defs) {
    const fresh = JSON.parse(JSON.stringify(runDefinition(def)));
    const stored = JSON.parse(fs.readFileSync(path.join(RESULTS, def.name + '.json'), 'utf8'));
    assert.deepEqual(fresh, stored, `${def.name} no reproduce lo guardado: ejecutá "npm run experiments" y revisá el cambio`);
  }
});

test('ejecutar dos veces y en orden inverso da lo mismo', () => {
  const defs = loadDefinitions().filter((d) => ['h4-expectativas', 'h3b-concentracion-de-pesos'].includes(d.name));
  const forward = defs.map((d) => JSON.stringify(runDefinition(d)));
  const backward = defs.slice().reverse().map((d) => JSON.stringify(runDefinition(d))).reverse();
  assert.deepEqual(forward, backward);
});

test('el escenario 80–20 guardado coincide con el recálculo', () => {
  const stored = JSON.parse(fs.readFileSync(path.join(RESULTS, 'escenario-80-20.json'), 'utf8'));
  const M = require('../src/model.js');
  // Caso s = 0,2; bayesiano; 1 unidad de información sobre B; λ = 1; γ = 0 → −10,5
  const row = stored.rows.find((r) => r.shareG2 === 0.2 && r.infoB === 1 && r.agent === 'bayes' && r.lossAversion === 1 && r.focal === 0);
  assert.equal(row.decisionUtility, -10.5);
  const pB = M.posterior(50, 15, 15, 1, 75).mean;
  assert.ok(Math.abs(pB - 62.5) < 1e-12);
});
