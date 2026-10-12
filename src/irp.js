/*
 * irp.js — Índice de Relación de Pareja (IRP).
 *
 * Basado en la hoja de cálculo «ÍNDICE DE RELACIÓN DE PAREJA (IRP)» de standleymoise (2021):
 * 26 «buenos puntos» y 26 «malos puntos» valorados de «Nada de eso» a «Mucho».
 *
 * Este módulo ofrece DOS cálculos:
 *   - scoreOriginal: reproduce exactamente las fórmulas del Excel original (incluidos sus
 *     límites: escala de 20 a 100 y 3 ítems que figuran en la lista pero no se suman), para poder
 *     comparar.
 *   - scoreImproved: versión corregida (escala 0–100, "No sé" sin forzar un valor, cobertura,
 *     alertas de seguridad y lectura neutral).
 *
 * El IRP es una autovaloración exploratoria. NO es una prueba validada, no mide el valor de una
 * persona, no predice el futuro de la relación y no indica qué decisión tomar.
 */
(function (root) {
  'use strict';

  /** Niveles de respuesta, de menor a mayor frecuencia/intensidad. */
  var LEVELS = ['Nada de eso', 'Muy poco', 'Poco', 'Normal', 'Mucho'];

  // kind: 'good' | 'bad'. original: ¿suma en el Excel original? factor: id del factor del simulador.
  // safety: 'violence' (alerta fuerte) | 'attention' (aviso). Los ids son estables.
  var ITEMS = [
    { id: 'g_paz', kind: 'good', label: 'Paz', original: true, factor: 'estilo' },
    { id: 'g_sinceridad', kind: 'good', label: 'Sinceridad', original: true, factor: 'honestidad' },
    { id: 'g_crecimiento', kind: 'good', label: 'Crecimiento', original: true, factor: 'proyecto' },
    { id: 'g_autoconfianza', kind: 'good', label: 'Autoconfianza', original: true, factor: null },
    { id: 'g_metas', kind: 'good', label: 'Metas claras', original: true, factor: 'proyecto' },
    { id: 'g_buena_influencia', kind: 'good', label: 'Buena influencia', original: true, factor: 'estilo' },
    { id: 'g_independiente', kind: 'good', label: 'Independiente', original: true, factor: 'estilo' },
    { id: 'g_alegria', kind: 'good', label: 'Alegría', original: true, factor: 'intereses' },
    { id: 'g_placer', kind: 'good', label: 'Placer', original: true, factor: 'quimica' },
    { id: 'g_ser_uno_mismo', kind: 'good', label: 'Ser uno mismo', original: true, factor: 'honestidad' },
    { id: 'g_te_ayuda', kind: 'good', label: 'Te ayuda', original: true, factor: 'practico' },
    { id: 'g_comprension', kind: 'good', label: 'Comprensión', original: true, factor: 'comunicacion' },
    { id: 'g_fidelidad', kind: 'good', label: 'Fidelidad', original: true, factor: 'honestidad' },
    { id: 'g_respeto', kind: 'good', label: 'Respeto', original: true, factor: 'respeto' },
    { id: 'g_comunicativo', kind: 'good', label: 'Comunicativo', original: false, factor: 'comunicacion' },
    { id: 'g_detallista', kind: 'good', label: 'Detallista', original: false, factor: 'quimica' },
    { id: 'g_compartir', kind: 'good', label: 'Compartir juntos', original: true, factor: 'intereses' },
    { id: 'g_carinoso', kind: 'good', label: 'Cariñoso', original: true, factor: 'quimica' },
    { id: 'g_estabilidad', kind: 'good', label: 'Estabilidad', original: true, factor: 'proyecto' },
    { id: 'g_compromiso', kind: 'good', label: 'Compromiso', original: true, factor: 'proyecto' },
    { id: 'g_planes', kind: 'good', label: 'Planes en conjunto', original: true, factor: 'proyecto' },
    // En el Excel original esta casilla se llama «Presumir» y está en los buenos puntos (y «Sin presumir» en los malos):
    // las etiquetas están invertidas. Aquí se corrige: sin presumir = bueno; presumir = malo.
    { id: 'g_sin_presumir', kind: 'good', label: 'Sin presumir (humildad)', original: true, factor: 'estilo' },
    { id: 'g_gastos', kind: 'good', label: 'Gastos compartidos', original: true, factor: 'practico' },
    { id: 'g_responsable', kind: 'good', label: 'Responsable', original: true, factor: 'practico' },
    { id: 'g_buen_sexo', kind: 'good', label: 'Buen sexo', original: true, factor: 'quimica' },
    { id: 'g_confianza', kind: 'good', label: 'Confianza', original: true, factor: 'honestidad' },

    { id: 'b_tristeza', kind: 'bad', label: 'Tristeza', original: true, factor: null },
    { id: 'b_estres', kind: 'bad', label: 'Estrés', original: true, factor: null },
    { id: 'b_inseguridad', kind: 'bad', label: 'Inseguridad', original: true, factor: null },
    { id: 'b_infidelidad', kind: 'bad', label: 'Infidelidad', original: true, factor: 'honestidad', safety: 'attention' },
    { id: 'b_irrespeto', kind: 'bad', label: 'Irrespeto', original: true, factor: 'respeto' },
    { id: 'b_finges', kind: 'bad', label: 'Fingir ser lo que no se es', original: true, factor: 'honestidad' },
    { id: 'b_pegajoso', kind: 'bad', label: 'Pegajoso', original: true, factor: 'estilo' },
    { id: 'b_falta_interes', kind: 'bad', label: 'Falta de interés', original: true, factor: 'quimica' },
    { id: 'b_no_ayuda', kind: 'bad', label: 'No te ayuda', original: true, factor: 'practico' },
    { id: 'b_egoista', kind: 'bad', label: 'Ser egoísta', original: true, factor: 'respeto' },
    { id: 'b_sin_metas', kind: 'bad', label: 'Sin metas claras', original: true, factor: 'proyecto' },
    { id: 'b_mala_influencia', kind: 'bad', label: 'Mala influencia', original: true, factor: 'estilo' },
    { id: 'b_presumir', kind: 'bad', label: 'Presumir', original: true, factor: 'estilo' },
    { id: 'b_te_pega', kind: 'bad', label: 'Te pega', original: true, factor: 'respeto', safety: 'violence' },
    { id: 'b_siempre_razon', kind: 'bad', label: 'Siempre tiene la razón', original: false, factor: 'comunicacion' },
    { id: 'b_grita', kind: 'bad', label: 'Te grita y te amenaza', original: true, factor: 'respeto', safety: 'violence' },
    { id: 'b_decrecimiento', kind: 'bad', label: 'Decrecimiento', original: true, factor: 'proyecto' },
    { id: 'b_no_encarina', kind: 'bad', label: 'No te encariña', original: true, factor: 'quimica' },
    { id: 'b_gastas_solo', kind: 'bad', label: 'Gastás vos solo', original: true, factor: 'practico' },
    { id: 'b_solo_sexo', kind: 'bad', label: 'Solo sexo', original: true, factor: 'quimica' },
    { id: 'b_excusas', kind: 'bad', label: 'Tiene excusa para todo', original: true, factor: 'honestidad' },
    { id: 'b_controla', kind: 'bad', label: 'Te controla, te priva de libertad', original: true, factor: 'respeto', safety: 'violence' },
    { id: 'b_no_escucha', kind: 'bad', label: 'No te escucha', original: true, factor: 'comunicacion' },
    { id: 'b_sexo_egoista', kind: 'bad', label: 'Sexo egoísta', original: true, factor: 'quimica', safety: 'attention' },
    { id: 'b_celos', kind: 'bad', label: 'Celos sin motivos', original: true, factor: 'respeto', safety: 'attention' }
  ];

  function levelIndex(answer) {
    var i = LEVELS.indexOf(answer);
    return i; // -1 si es "No sé" o vacío
  }

  // ---------- Cálculo ORIGINAL (reproduce el Excel) ----------

  /** Valor 1–5 del Excel: buenos suman 1 (Nada) … 5 (Mucho); malos invertido: 5 (Nada) … 1 (Mucho). */
  function originalPoints(item, answer) {
    var i = levelIndex(answer);
    if (i < 0) return null;
    return item.kind === 'good' ? i + 1 : 5 - i;
  }

  var ORIGINAL_BANDS = [
    [90, 'excelente'], [80, 'buena'], [70, 'normal'], [60, 'no recomendable'], [50, 'costumbre'],
    [40, 'muy mala'], [30, 'abrir los ojos'], [25, 'baja autoestima'], [20, 'minimo']
  ];

  /**
   * Reproduce H29, K29 e I5 del Excel. Si falta algún ítem puntuado, el Excel devuelve #N/A: aquí null.
   * @param {Object<string,string>} answers mapa id → respuesta
   */
  function scoreOriginal(answers) {
    function side(kind) {
      var sum = 0;
      var n = 0;
      for (var i = 0; i < ITEMS.length; i++) {
        var it = ITEMS[i];
        if (it.kind !== kind || !it.original) continue;
        var p = originalPoints(it, answers[it.id]);
        if (p === null) return null;
        sum += p;
        n++;
      }
      return { sum: sum, n: n, score: (sum * 100) / 120 }; // el Excel divide siempre por 120
    }
    var good = side('good');
    var bad = side('bad');
    if (!good || !bad) return null;
    var irp = (good.score + bad.score) / 2;
    var band = null;
    for (var b = 0; b < ORIGINAL_BANDS.length; b++) if (irp >= ORIGINAL_BANDS[b][0]) { band = ORIGINAL_BANDS[b][1]; break; }
    return { good: good.score, bad: bad.score, irp: irp, band: band };
  }

  // ---------- Cálculo MEJORADO ----------

  /** 0–100: buenos 0 (Nada) … 100 (Mucho); malos invertido (100 = nada de eso). */
  function improvedPoints(item, answer) {
    var i = levelIndex(answer);
    if (i < 0) return null;
    var v = (i * 100) / 4;
    return item.kind === 'good' ? v : 100 - v;
  }

  function lecture(irp) {
    if (irp >= 85) return 'Predominan los aspectos positivos en tus respuestas.';
    if (irp >= 70) return 'Mayormente positivo, con algunos aspectos a mejorar.';
    if (irp >= 55) return 'Panorama mixto: conviven aspectos positivos y problemáticos.';
    if (irp >= 40) return 'Predominan los aspectos problemáticos en tus respuestas.';
    return 'Tus respuestas señalan muchos aspectos problemáticos.';
  }

  /**
   * @param {Object<string,string>} answers id → respuesta ('Nada de eso'…'Mucho' | 'No sé' | undefined)
   * @param {Object<string,number>} [weights] id → peso >= 0 (por defecto 1)
   */
  function scoreImproved(answers, weights) {
    weights = weights || {};
    var acc = { good: { s: 0, w: 0, n: 0, t: 0 }, bad: { s: 0, w: 0, n: 0, t: 0 } };
    var alerts = [];
    ITEMS.forEach(function (it) {
      var a = acc[it.kind];
      a.t++;
      var p = improvedPoints(it, answers[it.id]);
      var w = weights[it.id] === undefined ? 1 : weights[it.id];
      if (p !== null && w > 0) { a.s += w * p; a.w += w; a.n++; }
      if (it.safety && levelIndex(answers[it.id]) >= 0) {
        var lvl = levelIndex(answers[it.id]);
        if (it.safety === 'violence' && lvl >= 1) alerts.push({ id: it.id, label: it.label, tipo: 'seguridad' });
        else if (it.safety === 'attention' && lvl >= 3) alerts.push({ id: it.id, label: it.label, tipo: 'atencion' });
      }
    });
    var positives = acc.good.w > 0 ? acc.good.s / acc.good.w : null;
    var problems = acc.bad.w > 0 ? acc.bad.s / acc.bad.w : null;
    var coverage = (acc.good.n + acc.bad.n) / (acc.good.t + acc.bad.t);
    var enough = acc.good.n >= acc.good.t / 2 && acc.bad.n >= acc.bad.t / 2;
    var irp = enough && positives !== null && problems !== null ? (positives + problems) / 2 : null;
    var hasSafety = alerts.some(function (x) { return x.tipo === 'seguridad'; });
    return {
      positives: positives,
      absenceOfProblems: problems,
      irp: irp,
      coverage: coverage,
      answered: acc.good.n + acc.bad.n,
      total: acc.good.t + acc.bad.t,
      alerts: alerts,
      // Con una alerta de seguridad el promedio no se interpreta: un solo ítem así no se "compensa".
      reading: irp === null ? null : hasSafety ? null : lecture(irp),
      readingBlockedBySafety: hasSafety
    };
  }

  /**
   * Valor 0–100 por factor del simulador, como media de los ítems mapeados (los "No sé" no cuentan).
   * @param {string[]} factorIds ids de factor en el orden del simulador
   * @returns {{value:number, known:boolean}[]}
   */
  function factorValues(answers, factorIds) {
    return factorIds.map(function (fid) {
      var s = 0;
      var n = 0;
      ITEMS.forEach(function (it) {
        if (it.factor !== fid) return;
        var p = improvedPoints(it, answers[it.id]);
        if (p !== null) { s += p; n++; }
      });
      return n > 0 ? { value: s / n, known: true } : { value: 50, known: false };
    });
  }

  var api = {
    LEVELS: LEVELS,
    ITEMS: ITEMS,
    scoreOriginal: scoreOriginal,
    scoreImproved: scoreImproved,
    factorValues: factorValues,
    originalPoints: originalPoints,
    improvedPoints: improvedPoints
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.RCM = root.RCM || {};
    root.RCM.irp = api;
  }
})(typeof self !== 'undefined' ? self : this);
