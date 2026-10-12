'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const IRP = require('../src/irp.js');

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} esperado ${b}, obtenido ${a}`);

const all = (good, bad) => {
  const a = {};
  IRP.ITEMS.forEach((it) => { a[it.id] = it.kind === 'good' ? good : bad; });
  return a;
};

test('estructura: 26 buenos y 25 malos; 24 + 24 suman en el Excel original', () => {
  const good = IRP.ITEMS.filter((i) => i.kind === 'good');
  const bad = IRP.ITEMS.filter((i) => i.kind === 'bad');
  assert.equal(good.length, 26);
  assert.equal(bad.length, 25);
  assert.equal(good.filter((i) => i.original).length, 24);
  assert.equal(bad.filter((i) => i.original).length, 24);
  assert.equal(new Set(IRP.ITEMS.map((i) => i.id)).size, IRP.ITEMS.length); // ids únicos
});

test('original: reproduce los valores guardados del Excel (todo en el peor caso → 20)', () => {
  // El archivo guardado tiene buenos = "Nada de eso" y malos = "Mucho": H30 = 24, K30 = 24, IRP = 20.
  const r = IRP.scoreOriginal(all('Nada de eso', 'Mucho'));
  close(r.good, 20, 1e-12);
  close(r.bad, 20, 1e-12);
  close(r.irp, 20, 1e-12);
  assert.equal(r.band, 'minimo');
});

test('original: el mejor caso da 100 y los intermedios siguen la fórmula', () => {
  close(IRP.scoreOriginal(all('Mucho', 'Nada de eso')).irp, 100, 1e-12);
  // Buenos "Normal" (4 × 24 = 96 → 80), malos "Normal" (2 × 24 = 48 → 40): IRP = 60.
  const r = IRP.scoreOriginal(all('Normal', 'Normal'));
  close(r.good, 80, 1e-12);
  close(r.bad, 40, 1e-12);
  close(r.irp, 60, 1e-12);
  assert.equal(r.band, 'no recomendable');
});

test('original: tramos del veredicto en sus límites exactos', () => {
  // Con buenos = x y malos "Nada de eso" (100), el IRP es (puntaje buenos + 100) / 2.
  const mk = (good) => IRP.scoreOriginal(all(good, 'Nada de eso'));
  assert.equal(mk('Mucho').band, 'excelente'); // 100
  assert.equal(mk('Normal').band, 'excelente'); // (80 + 100) / 2 = 90 → límite inferior inclusivo
  assert.equal(mk('Poco').band, 'buena'); // (60 + 100) / 2 = 80
  assert.equal(mk('Muy poco').band, 'normal'); // (40 + 100) / 2 = 70
  assert.equal(mk('Nada de eso').band, 'no recomendable'); // (20 + 100) / 2 = 60
});

test('original: falta un ítem puntuado → null (en el Excel sería #N/A)', () => {
  const a = all('Normal', 'Normal');
  delete a.g_paz;
  assert.equal(IRP.scoreOriginal(a), null);
  a.g_paz = 'No sé';
  assert.equal(IRP.scoreOriginal(a), null);
});

test('original: los 3 ítems listados pero no sumados no cambian el resultado', () => {
  const base = all('Normal', 'Normal');
  const ref = IRP.scoreOriginal(base).irp;
  ['g_comunicativo', 'g_detallista', 'b_siempre_razon'].forEach((id) => {
    const a = Object.assign({}, base);
    a[id] = id.startsWith('g_') ? 'Nada de eso' : 'Mucho';
    close(IRP.scoreOriginal(a).irp, ref, 1e-12, id);
  });
});

test('defecto del original: un solo ítem de violencia casi no mueve el índice y sigue siendo "excelente"', () => {
  const a = all('Mucho', 'Nada de eso');
  a.b_te_pega = 'Mucho';
  const r = IRP.scoreOriginal(a);
  close(r.irp, (100 + ((23 * 5 + 1) * 100) / 120) / 2, 1e-9); // ≈ 98,3
  assert.equal(r.band, 'excelente');
});

test('mejorado: escala 0–100 real (el original tenía mínimo 20)', () => {
  const worst = IRP.scoreImproved(all('Nada de eso', 'Mucho'));
  close(worst.irp, 0, 1e-12);
  close(IRP.scoreImproved(all('Mucho', 'Nada de eso')).irp, 100, 1e-12);
  // Buenos "Normal" = 75; malos "Normal" → ausencia de problemas = 100 − 75 = 25.
  close(IRP.scoreImproved(all('Normal', 'Normal')).irp, (75 + 25) / 2, 1e-12);
});

test('mejorado: "No sé" no se cuenta como cero ni como neutro; se informa la cobertura', () => {
  const a = all('Mucho', 'Nada de eso');
  IRP.ITEMS.slice(0, 10).forEach((it) => { a[it.id] = 'No sé'; }); // 10 buenos desconocidos
  const r = IRP.scoreImproved(a);
  close(r.irp, 100, 1e-12); // los respondidos son todos 100
  close(r.coverage, 41 / 51, 1e-12);
  assert.equal(r.answered, 41);
});

test('mejorado: con menos de la mitad de cada lista respondida no hay índice', () => {
  const a = {};
  IRP.ITEMS.forEach((it) => { a[it.id] = 'No sé'; });
  a.g_paz = 'Mucho';
  assert.equal(IRP.scoreImproved(a).irp, null);
  assert.equal(IRP.scoreImproved({}).irp, null);
});

test('mejorado: una alerta de seguridad (violencia, amenazas, control) bloquea la lectura global', () => {
  const a = all('Mucho', 'Nada de eso');
  a.b_te_pega = 'Muy poco'; // cualquier respuesta distinta de "Nada de eso"
  const r = IRP.scoreImproved(a);
  assert.ok(r.alerts.some((x) => x.id === 'b_te_pega' && x.tipo === 'seguridad'));
  assert.equal(r.reading, null);
  assert.equal(r.readingBlockedBySafety, true);
  assert.ok(r.irp > 90); // el promedio sigue siendo alto: justo por eso no se interpreta
});

test('mejorado: ítems de atención (infidelidad, celos) avisan solo con "Normal" o "Mucho"', () => {
  const a = all('Mucho', 'Nada de eso');
  a.b_celos = 'Poco';
  assert.equal(IRP.scoreImproved(a).alerts.length, 0);
  a.b_celos = 'Normal';
  assert.equal(IRP.scoreImproved(a).alerts[0].tipo, 'atencion');
  assert.ok(IRP.scoreImproved(a).reading); // no bloquea la lectura
});

test('mejorado: pesos editables y peso 0 excluye el ítem', () => {
  const a = all('Mucho', 'Nada de eso');
  a.g_paz = 'Nada de eso';
  const igual = IRP.scoreImproved(a).positives;
  const sinPaz = IRP.scoreImproved(a, { g_paz: 0 }).positives;
  assert.ok(sinPaz > igual);
  close(sinPaz, 100, 1e-12);
  const doble = IRP.scoreImproved(a, { g_paz: 25 }).positives;
  assert.ok(doble < igual);
});

test('lectura neutral: sin órdenes ni juicios sobre la persona', () => {
  const r = IRP.scoreImproved(all('Mucho', 'Nada de eso'));
  assert.match(r.reading, /positivos/);
  assert.doesNotMatch(r.reading, /deberías|dejá|abrite|pendej|vida/i);
  const mixto = IRP.scoreImproved(all('Nada de eso', 'Nada de eso')); // (0 + 100) / 2 = 50 → predominan los problemáticos
  assert.match(mixto.reading, /problem/i);
});

test('factorValues: promedia los ítems mapeados y marca desconocidos', () => {
  const ids = ['respeto', 'honestidad', 'comunicacion', 'proyecto', 'estilo', 'quimica', 'intereses', 'practico'];
  const a = all('Mucho', 'Nada de eso');
  const f = IRP.factorValues(a, ids);
  f.forEach((x) => { assert.equal(x.known, true); close(x.value, 100, 1e-12); });
  // Un factor sin ninguna respuesta queda desconocido.
  const b = {};
  IRP.ITEMS.forEach((it) => { if (it.factor !== 'respeto') b[it.id] = it.kind === 'good' ? 'Mucho' : 'Nada de eso'; });
  const g = IRP.factorValues(b, ids);
  assert.equal(g[0].known, false);
  assert.equal(g[1].known, true);
});
