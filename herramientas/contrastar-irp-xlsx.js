#!/usr/bin/env node
'use strict';
/*
 * Contrasta las fórmulas de IRP-mejorado.xlsx con scoreImproved de src/irp.js.
 * Para cada caso genera el libro con respuestas y pesos de prueba, lo recalcula con LibreOffice
 * (modo sin ventana) y compara los resultados guardados con los de JavaScript.
 *
 * Requisitos: LibreOffice instalado y exceljs (npm install --no-save exceljs).
 *   node herramientas/contrastar-irp-xlsx.js [ruta/a/soffice]
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const ExcelJS = require('exceljs');
const IRP = require('../src/irp.js');
const { generar } = require('./generar-irp-xlsx.js');

const SOFFICE = process.argv[2] || [
  'C:/Program Files/LibreOffice/program/soffice.exe',
  'C:/Program Files (x86)/LibreOffice/program/soffice.exe',
  '/usr/bin/soffice', '/usr/bin/libreoffice'
].find((p) => fs.existsSync(p));
if (!SOFFICE) { console.error('No se encontró LibreOffice (soffice).'); process.exit(2); }

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const all = (g, b) => { const a = {}; IRP.ITEMS.forEach((it) => { a[it.id] = it.kind === 'good' ? g : b; }); return a; };

const cases = [];
cases.push({ nombre: 'todo «No sé»', answers: {} });
cases.push({ nombre: 'mejor caso', answers: all('Mucho', 'Nada de eso') });
cases.push({ nombre: 'peor caso', answers: all('Nada de eso', 'Mucho') });
cases.push({ nombre: 'violencia con el resto perfecto', answers: Object.assign(all('Mucho', 'Nada de eso'), { b_te_pega: 'Mucho' }) });
cases.push({ nombre: 'celos «Normal» (atención, no bloquea)', answers: Object.assign(all('Mucho', 'Nada de eso'), { b_celos: 'Normal' }) });
cases.push({ nombre: 'solo la mitad justa de cada lista', answers: (() => { const a = {}; let g = 0, b = 0; IRP.ITEMS.forEach((it) => { if (it.kind === 'good' && g < 13) { a[it.id] = 'Normal'; g++; } if (it.kind === 'bad' && b < 13) { a[it.id] = 'Poco'; b++; } }); return a; })() });
const rnd = rng(20261012);
for (let k = 0; k < 16; k++) {
  const a = {};
  const w = {};
  IRP.ITEMS.forEach((it) => {
    const x = rnd();
    if (x < 0.2) return; // sin respuesta → «No sé»
    a[it.id] = x < 0.3 ? 'No sé' : IRP.LEVELS[Math.floor(rnd() * 5)];
    // Casos pares: sin respuestas de violencia, para contrastar la cifra del índice; impares: con ellas, para contrastar el bloqueo.
    if (k % 2 === 0 && it.safety === 'violence' && a[it.id] !== 'No sé') a[it.id] = 'Nada de eso';
    if (rnd() < 0.15) w[it.id] = [0, 0, 2, 3, 0.5][Math.floor(rnd() * 5)];
  });
  cases.push({ nombre: `aleatorio ${k + 1}`, answers: a, weights: w });
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'irp-'));
  let bad = 0;
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const src = path.join(dir, `caso${i}.xlsx`);
    const outDir = path.join(dir, `out${i}`);
    await generar(src, c.answers, c.weights);
    const r = cp.spawnSync(SOFFICE, ['--headless', '--convert-to', 'xlsx', '--outdir', outDir, src], { encoding: 'utf8', timeout: 120000 });
    if (r.status !== 0) { console.error('LibreOffice falló en', c.nombre, r.stderr); process.exit(2); }
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path.join(outDir, `caso${i}.xlsx`));
    const ws = wb.getWorksheet('IRP');
    // exceljs omite `result` cuando el valor calculado es exactamente 0: una fórmula sin resultado se lee como 0.
    const val = (a) => { const v = ws.getCell(a).value; if (v && typeof v === 'object' && 'formula' in v) return 'result' in v ? v.result : 0; return v; };
    const x = { pos: val('L5'), neg: val('L6'), irp: val('L7'), cov: val('L9'), alerts: val('L10'), att: val('L11'), read: val('L12') };
    const j = IRP.scoreImproved(c.answers, c.weights);
    const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
    // Con alerta de seguridad, el Excel muestra «—» en lugar de la cifra global.
    const irpEsperado = j.readingBlockedBySafety ? '—' : j.irp;
    const irpExcel = j.readingBlockedBySafety ? String(x.irp) : num(x.irp);
    const checks = [
      ['positivo', num(x.pos), j.positives],
      ['problemático', num(x.neg), j.absenceOfProblems],
      ['IRP', irpExcel, irpEsperado],
      ['cobertura', num(x.cov), (j.answered_all !== undefined ? j.answered_all : null)]
    ];
    // La cobertura del Excel cuenta solo casillas con peso > 0; la de JS también (answered). Se compara con answered/total.
    checks[3][2] = j.answered / j.total;
    const nAlerts = j.alerts.filter((a) => a.tipo === 'seguridad').length;
    const nAtt = j.alerts.filter((a) => a.tipo === 'atencion').length;
    checks.push(['alertas de seguridad', Number(x.alerts), nAlerts], ['avisos de atención', Number(x.att), nAtt]);
    let ok = true;
    checks.forEach(([n, a, b]) => {
      // exceljs tampoco devuelve `result` para el texto vacío (""): sin ninguna respuesta, un 0 leído equivale a vacío.
      const same = (b === null && a === 0 && j.answered === 0) || (typeof a === 'string' || typeof b === 'string' ? a === b : (a === null || b === null ? a === b : Math.abs(a - b) < 1e-9));
      if (!same) { ok = false; console.log(`  ✖ ${c.nombre}: ${n}: Excel ${a} ≠ JS ${b}`); }
    });
    // Lectura: el Excel da texto o vacío cuando hay alerta; JS da null
    const readXlsx = String(x.read || '');
    if (j.irp === null && !/Respondé al menos/.test(readXlsx)) { ok = false; console.log(`  ✖ ${c.nombre}: lectura sin índice: «${readXlsx}»`); }
    if (j.irp !== null && j.readingBlockedBySafety && !/alerta de seguridad/i.test(readXlsx)) { ok = false; console.log(`  ✖ ${c.nombre}: lectura con alerta: «${readXlsx}»`); }
    if (j.reading && readXlsx !== j.reading) { ok = false; console.log(`  ✖ ${c.nombre}: lectura Excel «${readXlsx}» ≠ JS «${j.reading}»`); }
    const sx = typeof x.irp === 'string' ? (x.irp === '' ? '—' : x.irp) : Number(x.irp).toFixed(2);
    const sj = j.irp === null ? '—' : j.readingBlockedBySafety ? `${j.irp.toFixed(2)} (oculto por alerta)` : j.irp.toFixed(2);
    console.log(`${ok ? '✔' : '✖'} ${c.nombre}: IRP Excel ${sx} | JS ${sj}`);
    if (!ok) bad++;
  }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(bad ? `\n${bad} caso(s) con diferencias` : `\nLas fórmulas del Excel coinciden con src/irp.js en los ${cases.length} casos.`);
  process.exit(bad ? 1 : 0);
})();
