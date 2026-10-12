/*
 * model.js — funciones matemáticas puras del modelo (versión 0.2).
 *
 * Todas las funciones son deterministas y no tocan el DOM. Las ecuaciones
 * correspondientes están en docs/modelo-matematico.md. Los parámetros y las
 * reglas de decisión son SUPUESTOS DE DISEÑO, no leyes psicológicas.
 */
(function (root) {
  'use strict';

  var SQRT2 = Math.sqrt(2);
  var SQRT_2PI = Math.sqrt(2 * Math.PI);

  // ---------- Distribución normal ----------

  function normalPdf(x) {
    return Math.exp(-0.5 * x * x) / SQRT_2PI;
  }

  /** erfc(x) para x >= 0: serie de Taylor de erf si x < 3, fracción continua si no. */
  function erfcPositive(x) {
    if (x < 3) {
      var sum = x;
      var term = x;
      for (var n = 1; n < 80; n++) {
        term *= (-x * x) / n;
        var add = term / (2 * n + 1);
        sum += add;
        if (Math.abs(add) < 1e-17 * Math.abs(sum)) break;
      }
      return 1 - (2 / Math.sqrt(Math.PI)) * sum;
    }
    var f = 0;
    for (var k = 60; k >= 1; k--) f = (k / 2) / (x + f);
    return Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + f);
  }

  /** Función de distribución acumulada de la normal estándar. */
  function normalCdf(x) {
    if (x === Infinity) return 1;
    if (x === -Infinity) return 0;
    var z = x / SQRT2;
    return z >= 0 ? 1 - 0.5 * erfcPositive(z) : 0.5 * erfcPositive(-z);
  }

  /**
   * Valor esperado del máximo de N variables N(0,1) independientes:
   *   E[max] = ∫ x · N · φ(x) · Φ(x)^(N-1) dx   (integración de Simpson).
   */
  function expectedMaxStdNormal(N) {
    if (!Number.isInteger(N) || N < 1) throw new RangeError('N debe ser un entero >= 1');
    if (N === 1) return 0;
    var a = -10;
    var b = 10;
    var steps = 20000; // par
    var h = (b - a) / steps;
    function f(x) {
      return x * N * normalPdf(x) * Math.pow(normalCdf(x), N - 1);
    }
    var s = f(a) + f(b);
    for (var i = 1; i < steps; i++) s += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
    return (s * h) / 3;
  }

  // ---------- Pesos y utilidad ----------

  /**
   * Normaliza pesos no negativos para que sumen 1.
   * Devuelve null si la suma es 0 (utilidad indefinida), no un vector de ceros.
   */
  function normalizeWeights(weights) {
    var clean = weights.map(function (w) {
      return Number.isFinite(w) && w > 0 ? w : 0;
    });
    var s = clean.reduce(function (a, b) { return a + b; }, 0);
    if (!(s > 0)) return null;
    return clean.map(function (w) { return w / s; });
  }

  /** U = Σ wᵢ·xᵢ con pesos normalizados. Devuelve null si los pesos son indefinidos. */
  function weightedUtility(values, weights) {
    var w = normalizeWeights(weights);
    if (!w) return null;
    if (w.length !== values.length) throw new RangeError('values y weights deben tener igual longitud');
    var u = 0;
    for (var i = 0; i < w.length; i++) u += w[i] * values[i];
    return u;
  }

  // ---------- Información e incertidumbre (normal–normal) ----------

  /**
   * Posterior de un valor verdadero x ~ N(priorMean, priorSd²) tras n observaciones
   * y_k = x + ε_k, ε_k ~ N(0, obsSd²), cuya media muestral es obsMean.
   * Con n = 0 devuelve la previa (desconocido ≠ neutro: se conserva la incertidumbre).
   *   precisión posterior = 1/priorSd² + n/obsSd²
   *   media posterior     = (priorMean/priorSd² + n·obsMean/obsSd²) / precisión posterior
   */
  function posterior(priorMean, priorSd, obsSd, n, obsMean) {
    if (!(priorSd > 0) || !(obsSd > 0)) throw new RangeError('priorSd y obsSd deben ser > 0');
    if (!(n >= 0)) throw new RangeError('n debe ser >= 0');
    var tauPrior = 1 / (priorSd * priorSd);
    var tauObs = n / (obsSd * obsSd);
    var tau = tauPrior + tauObs;
    var mean = n === 0 ? priorMean : (priorMean * tauPrior + obsMean * tauObs) / tau;
    return { mean: mean, sd: Math.sqrt(1 / tau), reliability: tauObs / tau };
  }

  /** P(x ≥ umbral) bajo N(mean, sd²). Con sd = 0 es 0 o 1. */
  function probAtLeast(mean, sd, threshold) {
    if (sd === 0) return mean >= threshold ? 1 : 0;
    return 1 - normalCdf((threshold - mean) / sd);
  }

  // ---------- Expectativas y coste de búsqueda (valor de reserva) ----------

  /**
   * Valor de reserva w* de un buscador secuencial con coste c por candidato y
   * valores W ~ N(mean, sd²): E[(W − w*)⁺] = c. (Stigler 1961; McCall 1970.)
   * Es un vínculo teórico entre "cuánto cuesta buscar" y "cuánto exijo".
   */
  function reservationValue(cost, mean, sd) {
    if (!(cost > 0)) throw new RangeError('cost debe ser > 0');
    if (!(sd > 0)) throw new RangeError('sd debe ser > 0');
    function excess(z) { // E[(Z − z)⁺] para Z ~ N(0,1)
      return normalPdf(z) - z * (1 - normalCdf(z));
    }
    var target = cost / sd;
    var lo = -12;
    var hi = 12;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2;
      if (excess(mid) > target) lo = mid; else hi = mid; // excess decrece con z
    }
    return mean + sd * ((lo + hi) / 2);
  }

  // ---------- Atención focal y decisión de cambio ----------

  /**
   * Pesos de atención: los factores en los que la opción actual queda por debajo
   * de la aspiración reciben más peso (γ = 0 → sin efecto). El MISMO vector se
   * aplica después a ambas personas, para no puntuar con criterios distintos.
   *   wᵢ' ∝ wᵢ · (1 + γ · max(0, aspiración − mᵢ,actual) / 100)
   */
  function focalWeights(weights, currentPerceived, aspiration, gamma) {
    var w = normalizeWeights(weights);
    if (!w) return null;
    if (!(gamma > 0)) return w;
    var raw = w.map(function (wi, i) {
      return wi * (1 + (gamma * Math.max(0, aspiration - currentPerceived[i])) / 100);
    });
    return normalizeWeights(raw);
  }

  /**
   * Utilidad de cambio con aversión a la pérdida (λ ≥ 1 pondera más las pérdidas):
   *   G = Σ wᵢ·max(mᵢ,B − mᵢ,A, 0)     L = Σ wᵢ·max(mᵢ,A − mᵢ,B, 0)
   *   neto = G − λ·L + novedad
   * Con λ = 1 y novedad = 0 equivale a U_B − U_A.
   */
  function switchUtility(weights, perceivedA, perceivedB, lambda, noveltyDiff) {
    var gain = 0;
    var loss = 0;
    for (var i = 0; i < weights.length; i++) {
      var d = perceivedB[i] - perceivedA[i];
      if (d > 0) gain += weights[i] * d; else loss += weights[i] * -d;
    }
    var nov = noveltyDiff || 0;
    return { gain: gain, loss: loss, net: gain - lambda * loss + nov };
  }


  // ---------- Comparación de dos personas (calculadora) ----------

  /**
   * Evalúa a una persona A (actual) y a una B (nueva) con el MISMO criterio.
   * Cada lado aporta valores observados por factor, si se conocen, y unidades de información n.
   * Un factor desconocido conserva la previa (media y desvío de la población): no se trata como "50 observado".
   *
   * @param {object} p
   * @param {number[]} p.weights importancias (cualquier escala, >= 0)
   * @param {number[]} p.essential índices de los factores esenciales
   * @param {number} p.threshold umbral mínimo para esenciales; p.minProb probabilidad mínima exigida
   * @param {{obs:number[], known:boolean[], n:number}} p.A  p.B
   * @param {'bayes'|'naive'} p.agent
   * @param {{mean:number, sd:number}} p.prior  p.obsSd
   * @param {number} p.gamma foco, p.lambda aversión a la pérdida, p.aspiration, p.switchCost, p.noveltyDiff
   */
  function evaluatePair(p) {
    var w = normalizeWeights(p.weights);
    if (!w) return { error: 'Todos los pesos son 0: la utilidad es indefinida.' };
    var K = w.length;
    function side(s) {
      var m = [];
      var sd = [];
      for (var i = 0; i < K; i++) {
        var known = s.known[i] && s.n > 0;
        if (p.agent === 'naive') {
          m.push(known ? s.obs[i] : p.prior.mean);
          sd.push(0);
        } else {
          var post = posterior(p.prior.mean, p.prior.sd, p.obsSd, known ? s.n : 0, known ? s.obs[i] : 0);
          m.push(post.mean);
          sd.push(post.sd);
        }
      }
      var varU = 0;
      for (var j = 0; j < K; j++) varU += w[j] * w[j] * sd[j] * sd[j];
      var probs = p.essential.map(function (idx) { return probAtLeast(m[idx], sd[idx], p.threshold); });
      return { m: m, sd: sd, U: weightedUtility(m, w), sdU: Math.sqrt(varU), probsEssential: probs };
    }
    var A = side(p.A);
    var B = side(p.B);
    var admissibleB = B.probsEssential.every(function (q) { return q >= p.minProb; });
    var wDec = focalWeights(w, A.m, p.aspiration, p.gamma);
    var sw = switchUtility(wDec, A.m, B.m, p.lambda, p.noveltyDiff || 0);
    var contributions = [];
    for (var i = 0; i < K; i++) contributions.push(w[i] * (B.m[i] - A.m[i]));
    return {
      weights: w, decisionWeights: wDec, A: A, B: B,
      admissibleB: admissibleB,
      gain: sw.gain, loss: sw.loss, net: sw.net,
      wouldSwitch: admissibleB && sw.net > p.switchCost,
      contributions: contributions
    };
  }

  var api = {
    evaluatePair: evaluatePair,
    normalPdf: normalPdf,
    normalCdf: normalCdf,
    expectedMaxStdNormal: expectedMaxStdNormal,
    normalizeWeights: normalizeWeights,
    weightedUtility: weightedUtility,
    posterior: posterior,
    probAtLeast: probAtLeast,
    reservationValue: reservationValue,
    focalWeights: focalWeights,
    switchUtility: switchUtility
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.RCM = root.RCM || {};
    root.RCM.model = api;
  }
})(typeof self !== 'undefined' ? self : this);
