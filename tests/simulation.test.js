'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../src/simulation.js');
const rng = require('../src/rng.js');

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} esperado ${b}, obtenido ${a}`);

test('rng: misma semilla → misma secuencia; semillas distintas → distinta', () => {
  const a = rng.createRng([1, 'x']);
  const b = rng.createRng([1, 'x']);
  const c = rng.createRng([2, 'x']);
  const sa = [a.normal(), a.normal(), a.uniform()];
  const sb = [b.normal(), b.normal(), b.uniform()];
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, [c.normal(), c.normal(), c.uniform()]);
});

test('rng: normal ≈ N(0,1) y uniforme en [0,1)', () => {
  const g = rng.createRng(['momentos']);
  const n = 200000;
  let s = 0, s2 = 0;
  for (let i = 0; i < n; i++) { const v = g.normal(); s += v; s2 += v * v; }
  close(s / n, 0, 0.01);
  close(s2 / n, 1, 0.02);
  for (let i = 0; i < 1000; i++) { const u = g.uniform(); assert.ok(u >= 0 && u < 1); }
});

test('configuración: valores inválidos se rechazan', () => {
  assert.throws(() => S.resolveConfig({ runs: 0 }), RangeError);
  assert.throws(() => S.resolveConfig({ obsSd: 0 }), RangeError);
  assert.throws(() => S.resolveConfig({ agent: 'otro' }), RangeError);
  assert.throws(() => S.resolveConfig({ essentialFactors: 0, desirableFactors: 0 }), RangeError);
  assert.throws(() => S.resolveConfig({ mechanisms: { lossAversion: 0.5 } }), RangeError);
  assert.throws(() => S.resolveConfig({ costs: { dateCost: -1 } }), RangeError);
  assert.doesNotThrow(() => S.resolveConfig({}));
});

test('reproducibilidad: misma configuración y semilla → resultados idénticos', () => {
  const cfg = { seed: 11, runs: 40, agent: 'naive' };
  assert.deepEqual(S.runExperiment(cfg).rows, S.runExperiment(cfg).rows);
});

test('semillas distintas dan resultados distintos', () => {
  const a = S.runExperiment({ seed: 1, runs: 30 }).rows;
  const b = S.runExperiment({ seed: 2, runs: 30 }).rows;
  assert.notDeepEqual(a, b);
});

test('independencia del orden de ejecución', () => {
  const c1 = { seed: 5, runs: 25, agent: 'bayes' };
  const c2 = { seed: 5, runs: 25, agent: 'naive' };
  const orden1 = [S.runExperiment(c1), S.runExperiment(c2)];
  const orden2 = [S.runExperiment(c2), S.runExperiment(c1)].reverse();
  assert.deepEqual(orden1.map((r) => r.rows), orden2.map((r) => r.rows));
  // Cada corrida depende solo de (semilla, índice): ejecutarlas al revés da lo mismo.
  const cfg = S.resolveConfig(c1);
  const forward = [];
  for (let r = 0; r < 10; r++) forward.push(S.runOnce(cfg, cfg.seed + ':' + r));
  const backward = [];
  for (let r = 9; r >= 0; r--) backward[r] = S.runOnce(cfg, cfg.seed + ':' + r);
  assert.deepEqual(forward, backward);
});

test('mismo mundo para ambos agentes: sin búsqueda no hay cambios y el bienestar coincide', () => {
  const base = { seed: 3, runs: 30, candidatesPerPeriod: 0 };
  const b = S.runExperiment({ ...base, agent: 'bayes' });
  const n = S.runExperiment({ ...base, agent: 'naive' });
  b.rows.forEach((row, i) => {
    assert.equal(row.switches, 0);
    assert.equal(row.moneyCost, 0);
    assert.equal(row.regretShare, null);
    close(row.meanTrueWelfare, n.rows[i].meanTrueWelfare, 1e-9);
  });
});

test('maldición del ganador: sesgo simulado ≈ fórmula analítica (agente ingenuo)', () => {
  // E[percibido − verdadero | elegido] = σe² / sqrt(σ0²+σe²) · E[máx de N normales]
  const sd0 = 15, sdE = 15, N = 5;
  const sV0 = sd0, sVe = sdE; // K = 1, una unidad de información
  const predicted = ((sVe * sVe) / Math.sqrt(sV0 * sV0 + sVe * sVe)) * require('../src/model.js').expectedMaxStdNormal(N);
  const r = S.simulateSelection({ N, K: 1, runs: 100000, config: { seed: 3, agent: 'naive' } });
  close(r.bias.mean, predicted, 4 * r.bias.se, 'sesgo ingenuo');
});

test('el agente bayesiano no sobreestima al elegido; el valor verdadero seleccionado sigue la fórmula', () => {
  const M = require('../src/model.js');
  const N = 5;
  const r = S.simulateSelection({ N, K: 1, runs: 100000, config: { seed: 9, agent: 'bayes' } });
  close(r.bias.mean, 0, 4 * r.bias.se, 'sesgo bayesiano');
  const s = Math.sqrt(15 * 15 + 15 * 15);
  const predTrue = 50 + ((15 * 15) / s) * M.expectedMaxStdNormal(N);
  close(r.trueValue.mean, predTrue, 4 * r.trueValue.se, 'valor verdadero del elegido');
});

test('más información sobre el candidato reduce el sesgo del agente ingenuo', () => {
  const lo = S.simulateSelection({ N: 5, K: 1, runs: 40000, config: { seed: 4, agent: 'naive', firstImpression: 1 } });
  const hi = S.simulateSelection({ N: 5, K: 1, runs: 40000, config: { seed: 4, agent: 'naive', firstImpression: 8 } });
  assert.ok(hi.bias.mean < lo.bias.mean - 3, `${hi.bias.mean} vs ${lo.bias.mean}`);
});

test('requisito esencial inalcanzable: ningún candidato es admisible → 0 cambios', () => {
  const r = S.runExperiment({ seed: 2, runs: 30, essentialThreshold: 1000 });
  r.rows.forEach((row) => assert.equal(row.switches, 0));
});

test('el filtro esencial no es compensatorio: umbral alto reduce los cambios', () => {
  const sin = S.runExperiment({ seed: 2, runs: 200, essentialThreshold: -1000 }).summary.switches.mean;
  const con = S.runExperiment({ seed: 2, runs: 200, essentialThreshold: 65 }).summary.switches.mean;
  assert.ok(con < sin);
});

test('agente bayesiano racional: la ganancia media por cambio supera el coste de cambio', () => {
  const sc = 3;
  const r = S.runExperiment({ seed: 8, runs: 600, agent: 'bayes', costs: { switchCost: sc } });
  const g = r.summary.meanGainPerSwitch;
  assert.ok(g.mean > sc - 2 * g.se, `ganancia ${g.mean} ± ${g.se} vs coste ${sc}`);
});

test('el agente ingenuo cambia más y obtiene menos por cambio que el bayesiano', () => {
  const b = S.runExperiment({ seed: 8, runs: 400, agent: 'bayes' }).summary;
  const n = S.runExperiment({ seed: 8, runs: 400, agent: 'naive' }).summary;
  assert.ok(n.switches.mean > b.switches.mean);
  assert.ok(n.meanGainPerSwitch.mean < b.meanGainPerSwitch.mean);
  assert.ok(n.meanOverestimation.mean > b.meanOverestimation.mean);
});

test('aversión a la pérdida alta reduce el número de cambios', () => {
  const l1 = S.runExperiment({ seed: 6, runs: 200, mechanisms: { lossAversion: 1 } }).summary.switches.mean;
  const l3 = S.runExperiment({ seed: 6, runs: 200, mechanisms: { lossAversion: 3 } }).summary.switches.mean;
  assert.ok(l3 < l1);
});

test('mecanismos explícitamente en cero == valores por defecto', () => {
  const a = S.runExperiment({ seed: 1, runs: 20 }).rows;
  const b = S.runExperiment({ seed: 1, runs: 20, mechanisms: { focal: 0, novelty: 0, lossAversion: 1, comparison: 0 } }).rows;
  assert.deepEqual(a, b);
});

test('runSweep cambia un solo parámetro y conserva el resto', () => {
  const sw = S.runSweep({ seed: 1, runs: 20 }, 'candidatesPerPeriod', [0, 2, 6]);
  assert.equal(sw.length, 3);
  assert.equal(sw[0].summary.switches.mean, 0);
  assert.ok(sw[2].summary.moneyCost.mean > sw[1].summary.moneyCost.mean);
});

test('summarize: casos límite (vacío, un valor, nulos)', () => {
  assert.equal(S.summarize([]).n, 0);
  assert.equal(S.summarize([null, null]).mean, null);
  const one = S.summarize([5]);
  assert.equal(one.mean, 5);
  assert.equal(one.sd, 0);
  close(S.summarize([1, 2, 3, 4]).sd, Math.sqrt(5 / 3), 1e-12);
});

test('la pareja actual no se somete al filtro esencial (solo los candidatos)', () => {
  // Con umbral imposible, nadie es admisible: el agente se queda con su pareja (no queda "sin pareja").
  const r = S.runExperiment({ seed: 2, runs: 50, essentialThreshold: 1000 });
  r.rows.forEach((row) => {
    assert.equal(row.switches, 0);
    assert.ok(Number.isFinite(row.meanTrueWelfare));
    close(row.welfareVsStaying, 0, 1e-9); // se queda con la inicial: igual que no cambiar
  });
});

test('initialQualityShift: una pareja inicial mucho mejor reduce los cambios', () => {
  const base = { seed: 12, runs: 200, agent: 'naive' };
  const s0 = S.runExperiment({ ...base, initialQualityShift: 0 }).summary.switches.mean;
  const s20 = S.runExperiment({ ...base, initialQualityShift: 20 }).summary.switches.mean;
  assert.ok(s20 < s0);
  assert.throws(() => S.resolveConfig({ initialQualityShift: NaN }), RangeError);
});

test('comparación: η = 0 no tiene efecto; con impresión sin corregir η > 0 baja la satisfacción percibida', () => {
  const base = { seed: 13, runs: 200, agent: 'bayes', candidatesPerPeriod: 8 };
  const off = S.runExperiment({ ...base, mechanisms: { comparison: 0 } }).summary;
  const raw = S.runExperiment({ ...base, mechanisms: { comparison: 1, comparisonBasis: 'raw' } }).summary;
  // η no altera las decisiones ni el bienestar verdadero, solo la satisfacción percibida.
  assert.equal(raw.meanTrueWelfare.mean, off.meanTrueWelfare.mean);
  assert.equal(raw.switches.mean, off.switches.mean);
  assert.ok(raw.meanPerceivedSatisfaction.mean < off.meanPerceivedSatisfaction.mean);
  assert.throws(() => S.resolveConfig({ mechanisms: { comparisonBasis: 'otra' } }), RangeError);
});

test('netVsStaying = bienestar vs. no cambiar descontando costes', () => {
  const r = S.runExperiment({ seed: 3, runs: 20, costs: { dateCost: 1, switchCost: 1, moneyToUtility: 0.1 } });
  r.rows.forEach((row) => {
    assert.ok(row.netVsStaying <= row.welfareVsStaying + 1e-9);
  });
  const free = S.runExperiment({ seed: 3, runs: 20, costs: { dateCost: 1, switchCost: 0, moneyToUtility: 0 } });
  free.rows.forEach((row) => close(row.netVsStaying, row.welfareVsStaying, 1e-9));
});

test('summarizeRatio: promedia por evento y no por corrida', () => {
  // Corrida 1: 10 cambios con ganancia total 10; corrida 2: 1 cambio con ganancia 3.
  const r = S.summarizeRatio([10, 3], [10, 1]);
  close(r.mean, 13 / 11, 1e-12); // por evento
  assert.ok(Math.abs(r.mean - (1 + 3) / 2) > 0.5); // el promedio de promedios daría 2
  assert.equal(r.n, 11);
});

test('summarizeRatio: con un evento por corrida coincide con el error estándar usual', () => {
  const r = S.summarizeRatio([1, 2, 3, 4], [1, 1, 1, 1]);
  close(r.mean, 2.5, 1e-12);
  close(r.se, Math.sqrt(5 / 3) / 2, 1e-12);
  assert.equal(S.summarizeRatio([0, 0], [0, 0]).mean, null); // sin cambios: indefinido, no 0
});

test('el agente bayesiano no sobreestima a quien elige al cambiar (por evento), tampoco en la simulación completa', () => {
  const r = S.runExperiment({ seed: 99, runs: 3000, agent: 'bayes' }).summary.meanOverestimation;
  close(r.mean, 0, 4 * r.se, 'sobreestimación bayesiana por evento');
  const naive = S.runExperiment({ seed: 99, runs: 1000, agent: 'naive' }).summary.meanOverestimation;
  assert.ok(naive.mean > 5);
});
