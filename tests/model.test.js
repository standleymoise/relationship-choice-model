'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/model.js');

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} esperado ${b}, obtenido ${a}`);

test('normalCdf: valores de referencia y simetría', () => {
  close(M.normalCdf(0), 0.5, 1e-12);
  close(M.normalCdf(1.96), 0.9750021048517795, 1e-9);
  close(M.normalCdf(-5), 2.866515718791939e-7, 1e-12);
  close(M.normalCdf(2.9), 0.9981341866996161, 1e-9); // rama de la serie
  close(M.normalCdf(3.1), 0.999032396786782, 1e-9); // rama de la fracción continua
  for (const x of [0.3, 1, 2.5, 4]) close(M.normalCdf(x) + M.normalCdf(-x), 1, 1e-12);
  assert.equal(M.normalCdf(Infinity), 1);
  assert.equal(M.normalCdf(-Infinity), 0);
});

test('normalCdf: es monótona creciente', () => {
  let prev = -1;
  for (let x = -6; x <= 6; x += 0.05) {
    const v = M.normalCdf(x);
    assert.ok(v >= prev, `no monótona en ${x}`);
    prev = v;
  }
});

test('expectedMaxStdNormal: valores tabulados', () => {
  assert.equal(M.expectedMaxStdNormal(1), 0);
  close(M.expectedMaxStdNormal(2), 1 / Math.sqrt(Math.PI), 1e-7); // exacto
  close(M.expectedMaxStdNormal(3), 0.8462843753, 1e-6);
  close(M.expectedMaxStdNormal(5), 1.1629644736, 1e-6);
  close(M.expectedMaxStdNormal(10), 1.5387527308, 1e-6);
});

test('expectedMaxStdNormal: crece con N y rechaza N inválido', () => {
  let prev = -1;
  for (let n = 1; n <= 30; n++) {
    const v = M.expectedMaxStdNormal(n);
    assert.ok(v >= prev);
    prev = v;
  }
  assert.throws(() => M.expectedMaxStdNormal(0), RangeError);
  assert.throws(() => M.expectedMaxStdNormal(2.5), RangeError);
});

test('normalizeWeights: suma 1, ignora negativos/NaN, invariante a la escala', () => {
  const w = M.normalizeWeights([2, 3, 5]);
  close(w.reduce((a, b) => a + b, 0), 1, 1e-12);
  assert.deepEqual(M.normalizeWeights([20, 30, 50]).map((x) => +x.toFixed(12)), w.map((x) => +x.toFixed(12)));
  assert.deepEqual(M.normalizeWeights([1, -4, NaN, 1]), [0.5, 0, 0, 0.5]);
});

test('normalizeWeights: pesos todos 0 → null (indefinido, no 0)', () => {
  assert.equal(M.normalizeWeights([0, 0, 0]), null);
  assert.equal(M.weightedUtility([50, 60, 70], [0, 0, 0]), null);
});

test('weightedUtility: ejemplo numérico 80–20 y cotas', () => {
  // Pesos 80/20; A: 85 en lo que pesa 80, 45 en lo que pesa 20.
  close(M.weightedUtility([85, 45], [80, 20]), 0.8 * 85 + 0.2 * 45, 1e-12); // 77
  const u = M.weightedUtility([10, 90, 40], [1, 1, 1]);
  assert.ok(u >= 10 && u <= 90);
  assert.throws(() => M.weightedUtility([1, 2], [1, 1, 1]), RangeError);
});

test('posterior: casos límite', () => {
  const p0 = M.posterior(50, 15, 15, 0, 0);
  assert.equal(p0.mean, 50); // sin datos: la previa, no "neutro inventado"
  close(p0.sd, 15, 1e-12);
  assert.equal(p0.reliability, 0);

  const p1 = M.posterior(50, 15, 15, 1, 80); // misma precisión que la previa → punto medio
  close(p1.mean, 65, 1e-12);
  close(p1.reliability, 0.5, 1e-12);
  close(p1.sd, 15 / Math.sqrt(2), 1e-12);

  const pn = M.posterior(50, 15, 15, 1e6, 80);
  close(pn.mean, 80, 1e-3);
  assert.ok(pn.sd < 0.1);
});

test('posterior: más información → menos incertidumbre y más peso a los datos', () => {
  let prevSd = Infinity;
  let prevRel = -1;
  for (let n = 0; n <= 20; n++) {
    const p = M.posterior(50, 15, 15, n, 90);
    assert.ok(p.sd < prevSd || n === 0);
    assert.ok(p.reliability >= prevRel);
    prevSd = p.sd;
    prevRel = p.reliability;
  }
});

test('posterior: parámetros inválidos', () => {
  assert.throws(() => M.posterior(50, 0, 15, 1, 50), RangeError);
  assert.throws(() => M.posterior(50, 15, -1, 1, 50), RangeError);
  assert.throws(() => M.posterior(50, 15, 15, -1, 50), RangeError);
});

test('probAtLeast: sd = 0, mediana y colas', () => {
  assert.equal(M.probAtLeast(40, 0, 40), 1);
  assert.equal(M.probAtLeast(39.9, 0, 40), 0);
  close(M.probAtLeast(40, 10, 40), 0.5, 1e-12);
  assert.ok(M.probAtLeast(60, 10, 40) > 0.97);
  assert.ok(M.probAtLeast(20, 10, 40) < 0.03);
});

test('reservationValue: satisface E[(W−w*)⁺] = c y es decreciente en el coste', () => {
  const mean = 50;
  const sd = 15;
  // Verificación independiente por integración numérica.
  const excess = (w) => {
    let s = 0;
    const h = 0.001;
    for (let x = w; x < mean + 12 * sd; x += h) s += (x - w) * (M.normalPdf((x - mean) / sd) / sd) * h;
    return s;
  };
  for (const c of [0.5, 2, 5]) {
    const w = M.reservationValue(c, mean, sd);
    close(excess(w), c, 0.01, `coste ${c}`);
  }
  assert.ok(M.reservationValue(1, mean, sd) > M.reservationValue(5, mean, sd));
  // Si c = σ·φ(0), el valor de reserva es la media.
  close(M.reservationValue(sd * M.normalPdf(0), mean, sd), mean, 1e-6);
  assert.throws(() => M.reservationValue(0, mean, sd), RangeError);
  assert.throws(() => M.reservationValue(1, mean, 0), RangeError);
});

test('focalWeights: γ = 0 no cambia nada; γ > 0 aumenta peso de lo que falta', () => {
  const w = [0.5, 0.3, 0.2];
  const current = [80, 80, 30]; // lo que falta es el tercer factor
  assert.deepEqual(M.focalWeights(w, current, 70, 0), w);
  const f = M.focalWeights(w, current, 70, 3);
  close(f.reduce((a, b) => a + b, 0), 1, 1e-12);
  assert.ok(f[2] > w[2]);
  assert.ok(f[0] < w[0]);
  // Sin déficit en ningún factor, no hay cambio.
  const none = M.focalWeights(w, [90, 90, 90], 70, 3);
  none.forEach((v, i) => close(v, w[i], 1e-12));
  assert.equal(M.focalWeights([0, 0], [50, 50], 70, 1), null);
});

test('switchUtility: λ = 1 equivale a U_B − U_A; λ > 1 penaliza pérdidas', () => {
  const w = M.normalizeWeights([3, 2, 5]);
  const A = [80, 40, 60];
  const B = [60, 90, 65];
  const r = M.switchUtility(w, A, B, 1, 0);
  close(r.net, M.weightedUtility(B, w) - M.weightedUtility(A, w), 1e-9);
  assert.ok(M.switchUtility(w, A, B, 2.25, 0).net < r.net);
});

test('switchUtility: ejemplo 80–20 (A mejor en el 80 % del peso, B en el 20 %)', () => {
  const w = [0.8, 0.2];
  const A = [85, 45];
  const B = [75, 85]; // B pierde 10 en lo que pesa 80, gana 40 en lo que pesa 20
  const r1 = M.switchUtility(w, A, B, 1, 0);
  close(r1.gain, 8, 1e-12);
  close(r1.loss, 8, 1e-12);
  close(r1.net, 0, 1e-12); // empate exacto sin aversión a la pérdida
  close(M.switchUtility(w, A, B, 2, 0).net, -8, 1e-12);
});

// ---------- evaluatePair (calculadora) ----------

const PRESET = () => ({
  weights: [20, 20, 15, 15, 10, 10, 5, 5],
  essential: [0, 1],
  threshold: 40,
  minProb: 0.5,
  A: { obs: [85, 85, 85, 85, 85, 45, 45, 45], known: new Array(8).fill(true), n: 8 },
  B: { obs: [75, 75, 75, 75, 75, 85, 85, 85], known: new Array(8).fill(true), n: 1 },
  agent: 'bayes',
  prior: { mean: 50, sd: 15 },
  obsSd: 15,
  gamma: 0,
  lambda: 1,
  aspiration: 70,
  switchCost: 0,
  noveltyDiff: 0
});

test('evaluatePair: reproduce el escenario 80–20 determinista (agente bayesiano, 1 unidad sobre B)', () => {
  const r = M.evaluatePair(PRESET());
  close(r.net, -10.5, 1e-9); // igual que experiments/results/escenario-80-20 con s = 0,2
  assert.equal(r.wouldSwitch, false);
});

test('evaluatePair: el agente ingenuo queda en empate exacto y el foco lo hace cambiar', () => {
  const p = PRESET();
  p.agent = 'naive';
  close(M.evaluatePair(p).net, 0, 1e-9);
  p.gamma = 3;
  const r = M.evaluatePair(p);
  close(r.net, 5.2173913, 1e-6);
  assert.equal(r.wouldSwitch, true);
});

test('evaluatePair: con información abundante sobre ambas personas, ingenuo y bayesiano coinciden', () => {
  const p = PRESET();
  p.A.n = 100000;
  p.B.n = 100000;
  const bayes = M.evaluatePair(p).net;
  p.agent = 'naive';
  const naive = M.evaluatePair(p).net;
  close(bayes, naive, 0.01);
});

test('evaluatePair: un factor desconocido conserva la previa y su incertidumbre (no es un "50" medido)', () => {
  const p = PRESET();
  p.B.known[5] = false;
  const r = M.evaluatePair(p);
  assert.equal(r.B.m[5], 50);
  close(r.B.sd[5], 15, 1e-12);
  const q = PRESET();
  q.B.obs[5] = 50; // medido en 50 con 1 unidad → sd menor
  assert.ok(M.evaluatePair(q).B.sd[5] < r.B.sd[5]);
});

test('evaluatePair: requisito esencial no compensatorio bloquea el cambio', () => {
  const p = PRESET();
  p.agent = 'naive';
  p.gamma = 3; // sin el filtro, cambiaría (ver prueba anterior)
  p.B.obs[0] = 10; // B muy bajo en un esencial
  const r = M.evaluatePair(p);
  assert.equal(r.admissibleB, false);
  assert.equal(r.wouldSwitch, false);
});

test('evaluatePair: pesos todos 0 → error explícito, no un resultado numérico', () => {
  const p = PRESET();
  p.weights = new Array(8).fill(0);
  assert.ok(M.evaluatePair(p).error);
});

test('evaluatePair: se aplican los mismos criterios a ambas personas (simetría)', () => {
  const p = PRESET();
  const r1 = M.evaluatePair(p);
  const q = PRESET();
  q.A = JSON.parse(JSON.stringify(p.B));
  q.B = JSON.parse(JSON.stringify(p.A));
  q.A.n = p.B.n; q.B.n = p.A.n;
  const r2 = M.evaluatePair(q);
  // Con λ = 1 y γ = 0, intercambiar A y B invierte exactamente la diferencia de utilidades.
  close(r1.B.U - r1.A.U, -(r2.B.U - r2.A.U), 1e-9);
});
