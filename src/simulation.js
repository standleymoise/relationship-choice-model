/*
 * simulation.js — simulación de un agente ficticio que decide si cambiar de pareja.
 *
 * IMPORTANTE: los agentes son construcciones programadas. Sus reglas son supuestos
 * de diseño (ver docs/modelo-matematico.md), NO observaciones de personas reales.
 * Ningún resultado de este archivo es una estimación de conductas reales.
 */
(function (root) {
  'use strict';

  var rngLib = typeof require === 'function' && typeof module !== 'undefined' ? require('./rng.js') : root.RCM.rng;
  var M = typeof require === 'function' && typeof module !== 'undefined' ? require('./model.js') : root.RCM.model;

  var VERSION = '0.2.0';

  /** Configuración por defecto. Todo mecanismo "psicológico" arranca apagado. */
  var DEFAULTS = {
    seed: 1,
    runs: 300,
    periods: 40,
    essentialFactors: 2,
    desirableFactors: 6,
    weightConcentration: 0.5, // 0 = pesos iguales; mayor = pesos más desiguales
    prior: { mean: 50, sd: 15 },
    obsSd: 15,
    essentialThreshold: 35,
    essentialMinProb: 0.5,
    initialInfo: 8,       // unidades de información sobre la pareja actual al inicio
    initialQualityShift: 0, // puntos que se suman a TODOS los factores verdaderos de la pareja inicial (0 = una persona típica)
    firstImpression: 1,   // unidades de información al conocer a un candidato
    candidatesPerPeriod: 3,
    searchTrigger: 'always', // 'always' | 'below_aspiration'
    aspiration: 60,
    agent: 'bayes',       // 'bayes' | 'naive'
    mechanisms: {
      focal: 0,           // γ: atención a lo que falta en la opción actual
      novelty: 0,         // ν: bonificación de novedad (puntos)
      noveltyDecay: 5,    // τ: períodos de decaimiento de la novedad
      lossAversion: 1,    // λ: 1 = sin aversión a la pérdida
      comparison: 0,      // η: arrastre por comparación con la mejor alternativa
      comparisonBasis: 'raw' // 'raw' = impresión inicial sin corregir; 'posterior' = media corregida
    },
    costs: {
      dateCost: 1,        // unidades monetarias por unidad de información obtenida
      switchCost: 0,      // coste psicológico/de transición del cambio (puntos de utilidad)
      moneyToUtility: 0   // conversión opcional dinero → puntos para el bienestar neto
    }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function merge(base, over) {
    var out = clone(base);
    (function walk(t, s) {
      Object.keys(s || {}).forEach(function (k) {
        if (s[k] !== null && typeof s[k] === 'object' && !Array.isArray(s[k])) {
          t[k] = t[k] && typeof t[k] === 'object' ? t[k] : {};
          walk(t[k], s[k]);
        } else {
          t[k] = s[k];
        }
      });
    })(out, over);
    return out;
  }

  function resolveConfig(over) {
    var cfg = merge(DEFAULTS, over || {});
    validateConfig(cfg);
    return cfg;
  }

  function validateConfig(c) {
    function need(cond, msg) { if (!cond) throw new RangeError('Configuración inválida: ' + msg); }
    need(Number.isInteger(c.runs) && c.runs >= 1, 'runs debe ser un entero >= 1');
    need(Number.isInteger(c.periods) && c.periods >= 1, 'periods debe ser un entero >= 1');
    need(Number.isInteger(c.essentialFactors) && c.essentialFactors >= 0, 'essentialFactors debe ser un entero >= 0');
    need(Number.isInteger(c.desirableFactors) && c.desirableFactors >= 0, 'desirableFactors debe ser un entero >= 0');
    need(c.essentialFactors + c.desirableFactors >= 1, 'debe haber al menos un factor');
    need(c.prior.sd > 0 && c.obsSd > 0, 'prior.sd y obsSd deben ser > 0');
    need(c.initialInfo >= 0 && c.firstImpression >= 0, 'las unidades de información no pueden ser negativas');
    need(Number.isInteger(c.initialInfo) && Number.isInteger(c.firstImpression), 'las unidades de información deben ser enteras');
    need(Number.isInteger(c.candidatesPerPeriod) && c.candidatesPerPeriod >= 0, 'candidatesPerPeriod debe ser un entero >= 0');
    need(c.agent === 'bayes' || c.agent === 'naive', "agent debe ser 'bayes' o 'naive'");
    need(c.searchTrigger === 'always' || c.searchTrigger === 'below_aspiration', "searchTrigger inválido");
    need(c.essentialMinProb >= 0 && c.essentialMinProb <= 1, 'essentialMinProb debe estar en [0,1]');
    need(c.weightConcentration >= 0, 'weightConcentration debe ser >= 0');
    need(c.mechanisms.focal >= 0 && c.mechanisms.novelty >= 0 && c.mechanisms.comparison >= 0, 'los mecanismos no pueden ser negativos');
    need(c.mechanisms.lossAversion >= 1, 'lossAversion debe ser >= 1');
    need(c.mechanisms.noveltyDecay > 0, 'noveltyDecay debe ser > 0');
    need(c.mechanisms.comparisonBasis === 'raw' || c.mechanisms.comparisonBasis === 'posterior', "comparisonBasis debe ser 'raw' o 'posterior'");
    need(Number.isFinite(c.initialQualityShift), 'initialQualityShift debe ser un número');
    need(c.costs.dateCost >= 0 && c.costs.switchCost >= 0 && c.costs.moneyToUtility >= 0, 'los costes no pueden ser negativos');
  }

  // ---------- Personas (candidatos) ----------

  /**
   * Candidato con flujo propio de números aleatorios (semilla, 'persona', id).
   * Sus valores verdaderos y su ruido de observación dependen SOLO de su id,
   * no de las decisiones del agente: agentes distintos ven el mismo mundo.
   */
  function makePerson(cfg, runSeed, id, K, initialUnits, shift) {
    var rng = rngLib.createRng([runSeed, 'persona', id]);
    var x = [];
    for (var i = 0; i < K; i++) x.push(cfg.prior.mean + (shift || 0) + cfg.prior.sd * rng.normal());
    var p = { id: id, x: x, rng: rng, sum: new Array(K).fill(0), n: 0, age: 0 };
    for (var u = 0; u < initialUnits; u++) observe(cfg, p);
    return p;
  }

  /** Una unidad más de información: cada factor se observa con ruido N(0, obsSd²). */
  function observe(cfg, p) {
    for (var i = 0; i < p.x.length; i++) p.sum[i] += p.x[i] + cfg.obsSd * p.rng.normal();
    p.n += 1;
  }

  /** Valores percibidos por factor según el tipo de agente. */
  function perceive(cfg, p) {
    var m = [];
    var sd = [];
    for (var i = 0; i < p.x.length; i++) {
      if (cfg.agent === 'naive') {
        // Toma lo observado como verdadero. Sin observaciones: usa la media previa.
        m.push(p.n > 0 ? p.sum[i] / p.n : cfg.prior.mean);
        sd.push(0);
      } else {
        var post = M.posterior(cfg.prior.mean, cfg.prior.sd, cfg.obsSd, p.n, p.n > 0 ? p.sum[i] / p.n : 0);
        m.push(post.mean);
        sd.push(post.sd);
      }
    }
    return { m: m, sd: sd };
  }

  /** Media de lo observado sin corrección (o la media previa si no hay observaciones). */
function rawMeans(cfg, p) {
    var m = [];
    for (var i = 0; i < p.x.length; i++) m.push(p.n > 0 ? p.sum[i] / p.n : cfg.prior.mean);
    return m;
  }

  function isAdmissible(cfg, per) {
    for (var i = 0; i < cfg.essentialFactors; i++) {
      if (M.probAtLeast(per.m[i], per.sd[i], cfg.essentialThreshold) < cfg.essentialMinProb) return false;
    }
    return true;
  }

  function noveltyBonus(cfg, age) {
    return cfg.mechanisms.novelty * Math.exp(-age / cfg.mechanisms.noveltyDecay);
  }

  function trueUtility(p, w) { return M.weightedUtility(p.x, w); }

  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

  // ---------- Una corrida ----------

  /**
   * Simula un agente durante `periods` períodos. Devuelve métricas de esa corrida.
   * @param {object} cfgOverride configuración parcial (se completa con DEFAULTS)
   * @param {number|string} runSeed identifica el mundo aleatorio de esta corrida
   */
  function runOnce(cfgOverride, runSeed) {
    var cfg = cfgOverride && cfgOverride.__resolved ? cfgOverride : resolveConfig(cfgOverride);
    var K = cfg.essentialFactors + cfg.desirableFactors;

    // Pesos de importancia del agente (verdaderos y estables): w ∝ exp(τ·z).
    var wr = rngLib.createRng([runSeed, 'pesos']);
    var raw = [];
    for (var i = 0; i < K; i++) raw.push(Math.exp(cfg.weightConcentration * wr.normal()));
    var w = M.normalizeWeights(raw);

    var partner = makePerson(cfg, runSeed, 'inicial', K, cfg.initialInfo, cfg.initialQualityShift);
    var baselineW = trueUtility(partner, w);

    var switches = 0;
    var regretted = 0;
    var gainSum = 0;
    var overSum = 0;
    var wSum = 0;
    var sSum = 0;
    var money = 0;
    var switchCostTotal = 0;
    var firstSwitch = null;

    for (var t = 1; t <= cfg.periods; t++) {
      observe(cfg, partner);
      partner.age += 1;

      var perA = perceive(cfg, partner);
      var uA = dot(w, perA.m) + noveltyBonus(cfg, partner.age);
      var search = cfg.searchTrigger === 'always' || uA < cfg.aspiration;
      var bestAlt = -Infinity;

      if (search && cfg.candidatesPerPeriod > 0) {
        var wDec = M.focalWeights(raw, perA.m, cfg.aspiration, cfg.mechanisms.focal);
        var best = null;
        for (var k = 0; k < cfg.candidatesPerPeriod; k++) {
          var cand = makePerson(cfg, runSeed, 't' + t + 'c' + k, K, cfg.firstImpression);
          money += cfg.costs.dateCost * cfg.firstImpression;
          var perB = perceive(cfg, cand);
          var uB = dot(w, perB.m) + noveltyBonus(cfg, 0);
          var impression = cfg.mechanisms.comparisonBasis === 'raw' ? dot(w, rawMeans(cfg, cand)) + noveltyBonus(cfg, 0) : uB;
          if (impression > bestAlt) bestAlt = impression;
          // El filtro de requisitos esenciales rige para los candidatos; la pareja actual no se somete a él.
          if (!isAdmissible(cfg, perB)) continue;
          var net = M.switchUtility(wDec, perA.m, perB.m, cfg.mechanisms.lossAversion,
            noveltyBonus(cfg, 0) - noveltyBonus(cfg, partner.age)).net;
          if (net > cfg.costs.switchCost && (best === null || net > best.net)) {
            best = { net: net, cand: cand, perceived: dot(w, perB.m) };
          }
        }
        if (best) {
          var before = trueUtility(partner, w);
          var after = trueUtility(best.cand, w);
          switches += 1;
          if (after < before) regretted += 1;
          gainSum += after - before;
          overSum += best.perceived - after;
          switchCostTotal += cfg.costs.switchCost;
          if (firstSwitch === null) firstSwitch = t;
          partner = best.cand;
          partner.age = 0;
        }
      }

      wSum += trueUtility(partner, w);
      var perNow = perceive(cfg, partner);
      var uNow = dot(w, perNow.m) + noveltyBonus(cfg, partner.age);
      var drag = bestAlt > uNow ? cfg.mechanisms.comparison * (bestAlt - uNow) : 0;
      sSum += uNow - drag;
    }

    var meanW = wSum / cfg.periods;
    return {
      switches: switches,
      sumRegretted: regretted,
      sumGain: gainSum,
      sumOverestimation: overSum,
      regrettedSwitches: regretted,
      regretShare: switches > 0 ? regretted / switches : null,
      meanGainPerSwitch: switches > 0 ? gainSum / switches : null,
      meanOverestimation: switches > 0 ? overSum / switches : null,
      meanTrueWelfare: meanW,
      finalTrueWelfare: trueUtility(partner, w),
      welfareVsStaying: meanW - baselineW,
      moneyCost: money,
      switchCostTotal: switchCostTotal,
      netWelfare: meanW - cfg.costs.moneyToUtility * (money / cfg.periods) - switchCostTotal / cfg.periods,
      netVsStaying: meanW - cfg.costs.moneyToUtility * (money / cfg.periods) - switchCostTotal / cfg.periods - baselineW,
      meanPerceivedSatisfaction: sSum / cfg.periods,
      firstSwitchPeriod: firstSwitch
    };
  }

  // ---------- Muchas corridas y barridos ----------

  var METRICS = ['switches', 'regretShare', 'meanGainPerSwitch', 'meanOverestimation',
    'meanTrueWelfare', 'welfareVsStaying', 'moneyCost', 'netWelfare', 'netVsStaying', 'meanPerceivedSatisfaction'];

  function summarize(values) {
    var v = values.filter(function (x) { return x !== null && Number.isFinite(x); });
    var n = v.length;
    if (n === 0) return { n: 0, mean: null, sd: null, se: null, ci95: [null, null] };
    var mean = v.reduce(function (a, b) { return a + b; }, 0) / n;
    var sd = 0;
    if (n > 1) sd = Math.sqrt(v.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / (n - 1));
    var se = sd / Math.sqrt(n);
    return { n: n, mean: mean, sd: sd, se: se, ci95: [mean - 1.96 * se, mean + 1.96 * se] };
  }

  /**
   * Razón ΣY/ΣX sobre corridas (p. ej. ganancia total / cambios totales): promedia por EVENTO,
   * no por corrida. Promediar promedios por corrida pesa igual a corridas con 1 y con 20 cambios y
   * sesga la estimación porque el número de cambios depende de los resultados anteriores.
   * El error estándar tiene en cuenta que los eventos de una misma corrida no son independientes
   * (estimador de razón con linealización, agrupado por corrida).
   */
  function summarizeRatio(num, den) {
    var n = num.length;
    var sx = 0;
    var sy = 0;
    for (var i = 0; i < n; i++) { sx += den[i]; sy += num[i]; }
    if (sx === 0) return { n: 0, mean: null, sd: null, se: null, ci95: [null, null] };
    var r = sy / sx;
    var ss = 0;
    for (var j = 0; j < n; j++) { var e = num[j] - r * den[j]; ss += e * e; }
    var se = n > 1 ? Math.sqrt((n / (n - 1)) * ss) / sx : 0;
    return { n: sx, mean: r, sd: null, se: se, ci95: [r - 1.96 * se, r + 1.96 * se] };
  }

  var PER_SWITCH = { regretShare: 'sumRegretted', meanGainPerSwitch: 'sumGain', meanOverestimation: 'sumOverestimation' };

  /**
   * Ejecuta `runs` corridas independientes y resume cada métrica (media, sd, IC95 %).
   * Las tres métricas "por cambio" se agrupan por evento (ver summarizeRatio); en `n` va el
   * número de cambios totales. El resto promedia entre corridas.
   */
  function runExperiment(cfgOverride) {
    var cfg = resolveConfig(cfgOverride);
    cfg.__resolved = true;
    var rows = [];
    for (var r = 0; r < cfg.runs; r++) rows.push(runOnce(cfg, cfg.seed + ':' + r));
    var summary = {};
    METRICS.forEach(function (m) {
      summary[m] = PER_SWITCH[m]
        ? summarizeRatio(rows.map(function (row) { return row[PER_SWITCH[m]]; }), rows.map(function (row) { return row.switches; }))
        : summarize(rows.map(function (row) { return row[m]; }));
    });
    var cleanCfg = clone(cfg);
    delete cleanCfg.__resolved;
    return { version: VERSION, config: cleanCfg, summary: summary, rows: rows };
  }

  function setPath(obj, path, value) {
    var parts = path.split('.');
    var o = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      o[parts[i]] = o[parts[i]] && typeof o[parts[i]] === 'object' ? o[parts[i]] : {};
      o = o[parts[i]];
    }
    o[parts[parts.length - 1]] = value;
    return obj;
  }

  /** Cambia UN parámetro (path con puntos) a lo largo de `values`, el resto constante. */
  function runSweep(baseOverride, path, values) {
    return values.map(function (value) {
      var over = setPath(clone(baseOverride || {}), path, value);
      var res = runExperiment(over);
      return { value: value, summary: res.summary };
    });
  }

  /**
   * Sesgo de selección ("maldición del ganador"): elige el mejor de N candidatos por
   * utilidad percibida (sin esenciales ni mecanismos) y mide percibido − verdadero.
   * Existe para contrastar el simulador con la fórmula analítica de los tests.
   */
  function simulateSelection(opts) {
    var cfg = resolveConfig(merge({ essentialFactors: 0, desirableFactors: opts.K || 1, weightConcentration: 0 }, opts.config || {}));
    cfg.__resolved = true;
    var K = cfg.essentialFactors + cfg.desirableFactors;
    var w = new Array(K).fill(1 / K);
    var bias = [];
    var trueSel = [];
    for (var r = 0; r < opts.runs; r++) {
      var best = null;
      for (var j = 0; j < opts.N; j++) {
        var p = makePerson(cfg, cfg.seed + ':sel:' + r, 'c' + j, K, cfg.firstImpression);
        var per = perceive(cfg, p);
        var perceivedU = dot(w, per.m);
        if (best === null || perceivedU > best.perceivedU) best = { perceivedU: perceivedU, trueU: trueUtility(p, w) };
      }
      bias.push(best.perceivedU - best.trueU);
      trueSel.push(best.trueU);
    }
    return { bias: summarize(bias), trueValue: summarize(trueSel) };
  }

  var api = {
    VERSION: VERSION,
    DEFAULTS: DEFAULTS,
    METRICS: METRICS,
    resolveConfig: resolveConfig,
    validateConfig: validateConfig,
    runOnce: runOnce,
    runExperiment: runExperiment,
    runSweep: runSweep,
    simulateSelection: simulateSelection,
    summarize: summarize,
    summarizeRatio: summarizeRatio,
    setPath: setPath
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.RCM = root.RCM || {};
    root.RCM.sim = api;
  }
})(typeof self !== 'undefined' ? self : this);
