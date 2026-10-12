#!/usr/bin/env node
'use strict';
/*
 * Genera IRP-mejorado.xlsx: versión corregida de la hoja «Índice de Relación de Pareja».
 * Ver docs/irp.md. Las fórmulas deben dar los mismos resultados que scoreImproved de src/irp.js
 * (se contrastan con LibreOffice en herramientas/contrastar-irp-xlsx.js).
 *
 * Esta herramienta de generación NO forma parte del simulador ni de las pruebas: usa la biblioteca
 * exceljs, que no es una dependencia del proyecto. Para ejecutarla:
 *   npm install --no-save exceljs
 *   node herramientas/generar-irp-xlsx.js [salida.xlsx] [--respuestas respuestas.json]
 * También exporta generar(salida, respuestas, pesos) para el script de contraste.
 */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const IRP = require('../src/irp.js');


const FIRST = 5;
const items = IRP.ITEMS;
const LAST = FIRST + items.length - 1;
const R = (col) => `${col}${FIRST}:${col}${LAST}`;

async function generar(out, prefill, pesos) {
  prefill = prefill || {};
  pesos = pesos || {};
  const wb = new ExcelJS.Workbook();
  wb.creator = 'standleymoise';
  wb.calcProperties.fullCalcOnLoad = true;

  // Orden de las hojas: IRP, Léeme, Datos (se crean en ese orden).
  const ws = wb.addWorksheet('IRP', { views: [{ state: 'frozen', ySplit: 4 }] });
  const rs = wb.addWorksheet('Léeme');
  const ds = wb.addWorksheet('Datos');

  // ---------- Hoja Datos ----------
  ds.getCell('A1').value = 'Respuesta';
  ds.getCell('B1').value = 'Posición (0–4)';
  IRP.LEVELS.forEach((l, i) => { ds.getCell(`A${i + 2}`).value = l; ds.getCell(`B${i + 2}`).value = i; });
  ds.getCell('A7').value = 'No sé';
  ds.getColumn(1).width = 16;
  ds.getColumn(2).width = 16;
  ds.getRow(1).font = { bold: true };

  // ---------- Hoja IRP ----------
  ws.mergeCells('A1:I1');
  ws.getCell('A1').value = 'Índice de Relación de Pareja (IRP) — versión mejorada';
  ws.getCell('A1').font = { bold: true, size: 15 };
  ws.mergeCells('A2:I2');
  ws.getCell('A2').value = 'Autovaloración exploratoria: no es una prueba validada, no mide el valor de una persona, no predice el futuro de la relación y no dice qué decidir. Elegí «No sé» si algo no lo conocés.';
  ws.getCell('A2').alignment = { wrapText: true, vertical: 'top' };
  ws.getRow(2).height = 32;

  const headers = ['Tipo', 'Ítem', 'Respuesta', 'Peso', 'Puntos (0–100)', 'Aviso', 'Peso usado', 'Aporte', 'Marca'];
  headers.forEach((h, i) => { const c = ws.getCell(4, i + 1); c.value = h; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5268' } }; c.alignment = { wrapText: true, vertical: 'middle' }; });
  ws.getRow(4).height = 30;

  const L = IRP.LEVELS;
  items.forEach((it, k) => {
    const r = FIRST + k;
    ws.getCell(`A${r}`).value = it.kind === 'good' ? 'Bueno' : 'Malo';
    ws.getCell(`B${r}`).value = it.label;
    ws.getCell(`C${r}`).value = prefill[it.id] || 'No sé';
    ws.getCell(`D${r}`).value = pesos[it.id] === undefined ? 1 : pesos[it.id];
    ws.getCell(`E${r}`).value = { formula: `IF(OR(C${r}="",C${r}="No sé"),"",IF($A${r}="Bueno",(MATCH(C${r},Datos!$A$2:$A$6,0)-1)*25,100-(MATCH(C${r},Datos!$A$2:$A$6,0)-1)*25))` };
    ws.getCell(`G${r}`).value = { formula: `IF(OR(E${r}="",D${r}<=0),"",D${r})` };
    ws.getCell(`H${r}`).value = { formula: `IF(G${r}="","",G${r}*E${r})` };
    ws.getCell(`I${r}`).value = it.safety === 'violence' ? 'Seguridad' : it.safety === 'attention' ? 'Atención' : '';
    ws.getCell(`F${r}`).value = { formula: `IF(OR(C${r}="",C${r}="No sé"),"",IF(AND(I${r}="Seguridad",MATCH(C${r},Datos!$A$2:$A$6,0)>=2),"ALERTA DE SEGURIDAD",IF(AND(I${r}="Atención",MATCH(C${r},Datos!$A$2:$A$6,0)>=4),"Atención","")))` };
    ws.getCell(`C${r}`).dataValidation = { type: 'list', allowBlank: false, formulae: ['Datos!$A$2:$A$7'], showErrorMessage: true, errorTitle: 'Respuesta', error: 'Elegí una opción de la lista.' };
    ws.getCell(`D${r}`).dataValidation = { type: 'decimal', operator: 'greaterThanOrEqual', formulae: [0], showErrorMessage: true, errorTitle: 'Peso', error: 'El peso debe ser un número mayor o igual que 0.' };
    ws.getCell(`C${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8DC' } };
    ws.getCell(`D${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8DC' } };
  });

  [10, 38, 16, 8, 14, 22, 11, 10, 11].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.getColumn(11).width = 34;
  ws.getColumn(12).width = 46;

  // ---------- Resultados ----------
  const nG = `COUNTIFS(${R('A')},"Bueno",${R('G')},">=0")`;
  const nM = `COUNTIFS(${R('A')},"Malo",${R('G')},">=0")`;
  const lab = [
    [4, 'Resultado'],
    [5, 'Presencia de lo positivo (0–100)'],
    [6, 'Ausencia de lo problemático (0–100)'],
    [7, 'IRP mejorado (0–100; sin cifra si hay alerta de seguridad)'],
    [8, 'Casillas respondidas'],
    [9, 'Cobertura'],
    [10, 'Alertas de seguridad'],
    [11, 'Avisos de atención'],
    [12, 'Lectura']
  ];
  lab.forEach(([r, t]) => { ws.getCell(`K${r}`).value = t; ws.getCell(`K${r}`).font = { bold: true }; });
  ws.getCell('K4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5268' } };
  ws.getCell('K4').font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell('L4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5268' } };
  ws.getCell('L5').value = { formula: `IFERROR(SUMIFS(${R('H')},${R('A')},"Bueno")/SUMIFS(${R('G')},${R('A')},"Bueno"),"")` };
  ws.getCell('L6').value = { formula: `IFERROR(SUMIFS(${R('H')},${R('A')},"Malo")/SUMIFS(${R('G')},${R('A')},"Malo"),"")` };
  // Con una alerta de seguridad no se muestra la cifra global (un promedio alto no debe tranquilizar).
  ws.getCell('L7').value = { formula: `IF(L10>0,"—",IF(AND(${nG}>=13,${nM}>=12.5,ISNUMBER(L5),ISNUMBER(L6)),(L5+L6)/2,""))` };
  ws.getCell('L8').value = { formula: `COUNT(${R('G')})&" / ${items.length}"` };
  ws.getCell('L9').value = { formula: `COUNT(${R('G')})/${items.length}` };
  ws.getCell('L10').value = { formula: `COUNTIF(${R('F')},"ALERTA DE SEGURIDAD")` };
  ws.getCell('L11').value = { formula: `COUNTIF(${R('F')},"Atención")` };
  ws.getCell('L12').value = { formula: 'IF(L7="","Respondé al menos la mitad de cada lista para ver el índice.",IF(L10>0,"Hay una alerta de seguridad: el promedio no se interpreta (ver aviso abajo).",IF(L7>=85,"Predominan los aspectos positivos en tus respuestas.",IF(L7>=70,"Mayormente positivo, con algunos aspectos a mejorar.",IF(L7>=55,"Panorama mixto: conviven aspectos positivos y problemáticos.",IF(L7>=40,"Predominan los aspectos problemáticos en tus respuestas.","Tus respuestas señalan muchos aspectos problemáticos."))))))' };
  ws.mergeCells('L12:L15'); // la lectura ocupa varias filas para no alterar la altura de la lista
  ws.getCell('L12').alignment = { wrapText: true, vertical: 'top' };
  ['L5', 'L6', 'L7'].forEach((c) => { ws.getCell(c).numFmt = '0.0'; });
  ws.getCell('L9').numFmt = '0%';
  ws.getCell('L7').font = { bold: true, size: 14 };

  ws.mergeCells('K17:L20');
  ws.getCell('K17').value = { formula: 'IF(L10>0,"ALERTA: violencia, amenazas o control no se «compensan» con otros aspectos positivos, por eso no se da una lectura global. Si sentís miedo o estás en peligro, buscá ayuda de los servicios de emergencia o de organizaciones de apoyo a víctimas de violencia de tu país.","")' };
  ws.getCell('K17').alignment = { wrapText: true, vertical: 'top' };
  ws.getCell('K17').font = { bold: true, color: { argb: 'FF9A2E3C' } };

  ws.mergeCells('K22:L28');
  ws.getCell('K22').value = 'Cómo se calcula: cada casilla vale 0, 25, 50, 75 o 100 (en las filas «Malo» la escala está invertida: «Nada de eso» = 100). Los «No sé» no cuentan. Cada lista se promedia con sus pesos y el IRP es el promedio de ambas, siempre que haya al menos la mitad de cada lista respondida. Ver docs/irp.md.';
  ws.getCell('K22').alignment = { wrapText: true, vertical: 'top' };

  ws.addConditionalFormatting({
    ref: `F${FIRST}:F${LAST}`,
    rules: [
      { type: 'containsText', operator: 'containsText', text: 'ALERTA', style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFC7CE' } }, font: { bold: true, color: { argb: 'FF9C0006' } } } },
      { type: 'containsText', operator: 'containsText', text: 'Atención', style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFEB9C' } } } }
    ]
  });

  // ---------- Hoja Léeme ----------
  rs.getColumn(1).width = 110;
  const lines = [
    ['IRP mejorado — cómo usarlo', true],
    ['1. En la hoja IRP elegí una respuesta para cada casilla (columna C, celdas amarillas). «No sé» deja la casilla fuera del cálculo.', false],
    ['2. Si querés darle más o menos importancia a una casilla, cambiá su peso (columna D, por defecto 1; 0 la excluye).', false],
    ['3. Mirá el resultado a la derecha (columnas K y L). Con una alerta de seguridad no se da lectura global.', false],
    ['', false],
    ['Qué cambió respecto del Excel original', true],
    ['• Escala real de 0 a 100 (el original iba de 20 a 100).', false],
    ['• Suman las 51 casillas (el original dejaba 3 sin sumar: Comunicativo, Detallista y Siempre tiene la razón).', false],
    ['• Existe «No sé» y se informa la cobertura.', false],
    ['• Alertas de seguridad para violencia, amenazas y control; la lectura global no se da en ese caso.', false],
    ['• Lectura descriptiva y neutral, sin órdenes ni juicios sobre la persona.', false],
    ['• Corregida la etiqueta invertida de «Presumir».', false],
    ['', false],
    ['Límites', true],
    ['Es una autovaloración exploratoria, no una prueba validada. No mide el valor de una persona, no predice el futuro de la relación y no indica qué decisión tomar.', false],
    ['Basado en la hoja «Índice de Relación de Pareja» de standleymoise (2021). Código MIT / documentación CC BY 4.0: https://github.com/standleymoise/relationship-choice-model', false]
  ];
  lines.forEach(([t, bold], i) => { const c = rs.getCell(`A${i + 1}`); c.value = t; c.alignment = { wrapText: true }; if (bold) c.font = { bold: true, size: 13 }; });

  wb.views = [{ activeTab: 0 }];
  await wb.xlsx.writeFile(out);
  return out;
}

module.exports = { generar };

if (require.main === module) {
  const args = process.argv.slice(2);
  const ri = args.indexOf('--respuestas');
  const prefill = ri >= 0 ? JSON.parse(fs.readFileSync(args[ri + 1], 'utf8')) : {};
  const out = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--respuestas')[0] || path.join(__dirname, '..', 'IRP-mejorado.xlsx');
  generar(out, prefill).then((o) => console.log('escrito', o));
}
