/* app.js — interfaz del simulador. Toda la lógica matemática vive en ../src (probada con Node). */
(function () {
  'use strict';
  var M = RCM.model;
  var S = RCM.sim;

  // ---------- utilidades de DOM (sin innerHTML con datos del usuario) ----------

  function el(tag, props) {
    var node = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      if (k === 'text') node.textContent = props[k];
      else if (k === 'class') node.className = props[k];
      else if (k === 'on') Object.keys(props.on).forEach(function (ev) { node.addEventListener(ev, props.on[ev]); });
      else if (props[k] !== undefined && props[k] !== null) node.setAttribute(k, props[k]);
    });
    function add(c) {
      if (c === null || c === undefined) return;
      if (Array.isArray(c)) { c.forEach(add); return; }
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    for (var i = 2; i < arguments.length; i++) add(arguments[i]);
    return node;
  }
  function $(id) { return document.getElementById(id); }
  function fmt(v, d) { return v === null || v === undefined || !Number.isFinite(v) ? '—' : v.toFixed(d === undefined ? 2 : d); }
  function pct(v) { return v === null || !Number.isFinite(v) ? '—' : (100 * v).toFixed(1) + ' %'; }

  // ---------- pestañas ----------

  var tabs = Array.prototype.slice.call(document.querySelectorAll('nav [role=tab]'));
  function selectTab(name) {
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      $(t.dataset.tab).classList.toggle('active', on);
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t.dataset.tab); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.focus();
        selectTab(n.dataset.tab);
      }
    });
  });

  // =====================================================================
  // 1. CALCULADORA
  // =====================================================================

  var FACTORS = [
    { id: 'respeto', label: 'Respeto y seguridad (trato digno, ausencia de violencia)', kind: 'essential' },
    { id: 'honestidad', label: 'Honestidad y confiabilidad', kind: 'essential' },
    { id: 'comunicacion', label: 'Comunicación y resolución de conflictos', kind: 'desirable' },
    { id: 'proyecto', label: 'Proyecto de vida (hijos, compromiso, metas)', kind: 'desirable' },
    { id: 'estilo', label: 'Estilo de vida y valores cotidianos', kind: 'desirable' },
    { id: 'quimica', label: 'Atracción y química', kind: 'desirable' },
    { id: 'intereses', label: 'Intereses y actividades compartidas', kind: 'desirable' },
    { id: 'practico', label: 'Aspectos prácticos (trabajo, economía, logística)', kind: 'desirable' }
  ];
  var PRESET_8020 = {
    weights: [20, 20, 15, 15, 10, 10, 5, 5],
    A: [85, 85, 85, 85, 85, 45, 45, 45],
    B: [75, 75, 75, 75, 75, 85, 85, 85],
    nA: 8, nB: 1
  };
  var calcInputs = { weight: [], A: [], B: [], Aknown: [], Bknown: [] };

  function numInput(value, min, max, step, onChange, label) {
    var i = el('input', { type: 'number', min: min, max: max, step: step, value: value, 'aria-label': label });
    i.addEventListener('input', onChange);
    return i;
  }

  function buildCalc() {
    var root = $('calc');
    root.appendChild(el('div', { class: 'grid' },
      el('div', { class: 'card s12' },
        el('h2', { text: 'Compará una relación conocida (A) con una persona poco conocida (B)' }),
        el('p', { class: 'sub', text: 'Cargá lo que observaste de cada persona en una escala de 0 a 100 y cuánto te importa cada factor. Los valores iniciales son un ejemplo inventado que ilustra el caso «80–20»: no son datos de nadie.' }),
        el('div', { class: 'cols' },
          el('button', { class: 'btn', id: 'preset', type: 'button', text: 'Cargar ejemplo 80–20 (ilustrativo)' }),
          el('button', { class: 'btn', id: 'clear', type: 'button', text: 'Poner todo en blanco (50, peso 10)' })
        )
      ),
      el('div', { class: 'card s8' }, el('h2', { text: 'Factores' }),
        el('p', { class: 'sub', text: '«Se conoce» desmarcado significa que no sabés nada de ese factor en esa persona: el modelo conserva la incertidumbre de la población en vez de tratarlo como un 50 medido. Los factores esenciales funcionan como filtro: si es poco probable que B cumpla el umbral, no se la considera aunque el resto sea excelente.' }),
        el('div', { class: 'scroll' }, el('table', { class: 'ftable' }, el('thead', null, el('tr', null,
          el('th', { text: 'Factor' }), el('th', { class: 'num', text: 'Peso' }),
          el('th', { class: 'num', text: 'Valor A' }), el('th', { text: 'A se conoce' }),
          el('th', { class: 'num', text: 'Valor B' }), el('th', { text: 'B se conoce' }))),
          el('tbody', { id: 'frows' })))),
      el('div', { class: 'card s4' }, el('h2', { text: 'Supuestos de la evaluación' }), el('div', { id: 'ctrl' })),
      el('div', { class: 'card s12', id: 'calcOut', 'aria-live': 'polite' }),
      el('div', { class: 'card s12' }, el('h2', { text: 'Expectativas y coste de búsqueda' }),
        el('p', { class: 'sub', text: 'Pregunta de diseño, no de diagnóstico: si cada candidato nuevo «cuesta» c puntos de utilidad (tiempo, esfuerzo), una regla de búsqueda secuencial óptima (Stigler, 1961; McCall, 1970) acepta a quien supere un valor de reserva w*. Sirve para pensar cómo se relacionan costes y exigencia; no dice cuánto exigir.' }),
        el('div', { class: 'cols' }, el('div', null, el('label', { class: 'l', for: 'cost', text: 'Coste por candidato (puntos)' }), el('input', { id: 'cost', type: 'number', min: '0.1', max: '30', step: '0.1', value: '2' }))),
        el('div', { id: 'reserve', class: 'notice' }))
    ));

    var tb = $('frows');
    FACTORS.forEach(function (f, i) {
      var rec = function () { render(); };
      var w = numInput(0, 0, 1000, 1, rec, 'Peso de ' + f.label);
      var a = numInput(50, 0, 100, 1, rec, 'Valor de A en ' + f.label);
      var b = numInput(50, 0, 100, 1, rec, 'Valor de B en ' + f.label);
      var ak = el('input', { type: 'checkbox', checked: 'checked', 'aria-label': 'A se conoce en ' + f.label });
      var bk = el('input', { type: 'checkbox', checked: 'checked', 'aria-label': 'B se conoce en ' + f.label });
      ak.addEventListener('change', rec);
      bk.addEventListener('change', rec);
      calcInputs.weight.push(w); calcInputs.A.push(a); calcInputs.B.push(b); calcInputs.Aknown.push(ak); calcInputs.Bknown.push(bk);
      tb.appendChild(el('tr', null,
        el('td', null, f.label, el('div', { class: 'kind', text: f.kind === 'essential' ? 'Esencial (filtro)' : 'Deseable' })),
        el('td', { class: 'num' }, w), el('td', { class: 'num' }, a), el('td', null, ak), el('td', { class: 'num' }, b), el('td', null, bk)));
    });

    var ctrl = $('ctrl');
    function field(id, label, value, min, max, step) {
      ctrl.appendChild(el('label', { class: 'l', for: id, text: label }));
      var i = el('input', { id: id, type: 'number', min: min, max: max, step: step, value: value });
      i.addEventListener('input', render);
      ctrl.appendChild(i);
    }
    ctrl.appendChild(el('label', { class: 'l', for: 'agent', text: 'Cómo procesa la información quien decide' }));
    var ag = el('select', { id: 'agent' }, el('option', { value: 'bayes', text: 'Corrige por la incertidumbre (bayesiano)' }), el('option', { value: 'naive', text: 'Toma lo observado como verdadero (ingenuo)' }));
    ag.addEventListener('change', render);
    ctrl.appendChild(ag);
    field('nA', 'Información sobre A (unidades)', 8, 0, 1000, 1);
    field('nB', 'Información sobre B (unidades)', 1, 0, 1000, 1);
    field('thr', 'Umbral mínimo de factores esenciales', 40, 0, 100, 1);
    field('asp', 'Nivel de aspiración', 70, 0, 100, 1);
    field('gamma', 'Foco en lo que falta en A (γ ≥ 0)', 0, 0, 10, 0.5);
    field('lambda', 'Aversión a la pérdida (λ ≥ 1)', 1, 1, 5, 0.25);
    field('novel', 'Bonificación por novedad de B (puntos)', 0, 0, 50, 1);
    field('scost', 'Coste de cambiar (puntos)', 0, 0, 50, 1);
    ctrl.appendChild(el('p', { class: 'sub', text: 'Población previa: media 50, desvío 15; ruido de cada observación: desvío 15 (supuestos de diseño, no estimaciones).' }));

    $('cost').addEventListener('input', render);
    $('preset').addEventListener('click', function () { loadPreset(); render(); });
    $('clear').addEventListener('click', function () {
      FACTORS.forEach(function (f, i) {
        calcInputs.weight[i].value = 10; calcInputs.A[i].value = 50; calcInputs.B[i].value = 50;
        calcInputs.Aknown[i].checked = true; calcInputs.Bknown[i].checked = true;
      });
      render();
    });
    loadPreset();
    render();
  }

  function loadPreset() {
    FACTORS.forEach(function (f, i) {
      calcInputs.weight[i].value = PRESET_8020.weights[i];
      calcInputs.A[i].value = PRESET_8020.A[i];
      calcInputs.B[i].value = PRESET_8020.B[i];
      calcInputs.Aknown[i].checked = true;
      calcInputs.Bknown[i].checked = true;
    });
    $('nA').value = PRESET_8020.nA;
    $('nB').value = PRESET_8020.nB;
  }

  function readNum(input, min, max) {
    var raw = input.value.trim();
    var v = Number(raw);
    var ok = raw !== '' && Number.isFinite(v) && v >= min && v <= max;
    input.classList.toggle('invalid', !ok);
    return ok ? v : null;
  }

  function render() {
    var errors = 0;
    var rd = function (input, min, max) { var v = readNum(input, min, max); if (v === null) errors++; return v; };
    var weights = calcInputs.weight.map(function (i) { return rd(i, 0, 1000); });
    var A = calcInputs.A.map(function (i) { return rd(i, 0, 100); });
    var B = calcInputs.B.map(function (i) { return rd(i, 0, 100); });
    var nA = rd($('nA'), 0, 1000), nB = rd($('nB'), 0, 1000), thr = rd($('thr'), 0, 100), asp = rd($('asp'), 0, 100);
    var gamma = rd($('gamma'), 0, 10), lambda = rd($('lambda'), 1, 5), nov = rd($('novel'), 0, 50), sc = rd($('scost'), 0, 50);
    var out = $('calcOut');
    out.textContent = '';
    if (errors > 0) {
      out.appendChild(el('div', { class: 'notice bad', text: 'Hay ' + errors + ' campo(s) vacío(s) o fuera de rango (marcados en rojo). No se calcula nada hasta corregirlos, para que lo que ves coincida con lo que se usa.' }));
      return;
    }
    var essential = [];
    FACTORS.forEach(function (f, i) { if (f.kind === 'essential') essential.push(i); });
    var r = M.evaluatePair({
      weights: weights, essential: essential, threshold: thr, minProb: 0.5,
      A: { obs: A, known: calcInputs.Aknown.map(function (c) { return c.checked; }), n: nA },
      B: { obs: B, known: calcInputs.Bknown.map(function (c) { return c.checked; }), n: nB },
      agent: $('agent').value, prior: { mean: 50, sd: 15 }, obsSd: 15,
      gamma: gamma, lambda: lambda, aspiration: asp, switchCost: sc, noveltyDiff: nov
    });
    if (r.error) {
      out.appendChild(el('div', { class: 'notice bad', text: r.error + ' Asigná un peso mayor que 0 al menos a un factor.' }));
      $('reserve').textContent = '';
      return;
    }
    out.appendChild(el('h2', { text: 'Resultado según las reglas de este modelo' }));
    out.appendChild(el('div', { class: 'metrics' },
      metric(fmt(r.A.U, 1) + ' ± ' + fmt(r.A.sdU, 1), 'Utilidad percibida de A (media ± desvío de la incertidumbre)'),
      metric(fmt(r.B.U, 1) + ' ± ' + fmt(r.B.sdU, 1), 'Utilidad percibida de B'),
      metric(fmt(r.gain, 1) + ' / ' + fmt(r.loss, 1), 'Ganancia / pérdida de cambiar (ponderadas)'),
      metric(fmt(r.net, 1), 'Utilidad neta de cambiar, antes del coste')));
    var probs = r.B.probsEssential.map(function (q, k) { return FACTORS[essential[k]].label.split(' (')[0] + ': ' + pct(q); }).join(' · ');
    out.appendChild(el('div', { class: 'notice', text: 'Probabilidad de que B cumpla cada requisito esencial (mínimo exigido 50 %): ' + probs + '. ' + (r.admissibleB ? 'B pasa el filtro.' : 'B NO pasa el filtro: el modelo no la considera, sin importar el resto.') }));
    var verdict = r.wouldSwitch
      ? 'Con estos supuestos, el modelo «cambiaría» a B (neto ' + fmt(r.net, 1) + ' > coste ' + fmt(sc, 1) + ').'
      : 'Con estos supuestos, el modelo «se quedaría» con A (' + (r.admissibleB ? 'neto ' + fmt(r.net, 1) + ' ≤ coste ' + fmt(sc, 1) : 'B no cumple los requisitos esenciales') + ').';
    out.appendChild(el('div', { class: 'notice ' + (r.wouldSwitch ? 'warn' : ''), text: verdict + ' Esto describe cómo funciona la regla, no lo que le conviene a una persona real.' }));
    var ev = M.evaluatePair({ weights: weights, essential: essential, threshold: thr, minProb: 0.5, A: { obs: A, known: calcInputs.Aknown.map(function (c) { return c.checked; }), n: nA }, B: { obs: B, known: calcInputs.Bknown.map(function (c) { return c.checked; }), n: nB }, agent: 'bayes', prior: { mean: 50, sd: 15 }, obsSd: 15, gamma: 0, lambda: 1, aspiration: asp, switchCost: 0, noveltyDiff: 0 });
    out.appendChild(el('div', { class: 'notice', text: 'Referencia: si se corrige por la incertidumbre y se comparan ambas personas sin foco ni aversión a la pérdida, la ganancia esperada del valor verdadero de cambiar es ' + fmt(ev.B.U - ev.A.U, 1) + ' puntos (esperanza matemática bajo los supuestos del modelo; no una predicción).' }));
    out.appendChild(el('h3', { text: 'Qué factores explican la diferencia (peso × (B − A), valores percibidos)' }));
    var maxAbs = Math.max.apply(null, r.contributions.map(Math.abs).concat([1e-9]));
    r.contributions.map(function (c, i) { return { c: c, i: i }; }).sort(function (x, y) { return Math.abs(y.c) - Math.abs(x.c); }).forEach(function (o) {
      var width = (Math.abs(o.c) / maxAbs) * 50;
      var fill = el('div', { class: 'fill', style: 'background:var(' + (o.c >= 0 ? '--b' : '--a') + ');width:' + width + '%;' + (o.c >= 0 ? 'left:50%' : 'right:50%') });
      out.appendChild(el('div', { class: 'contrib' }, el('span', { text: FACTORS[o.i].label.split(' (')[0] }),
        el('div', { class: 'track' }, el('div', { class: 'mid' }), fill), el('span', { class: 'num', text: fmt(o.c, 2) })));
    });
    out.appendChild(el('div', { class: 'legend' }, el('span', null, el('i', { style: 'background:var(--a)' }), 'a favor de A'), el('span', null, el('i', { style: 'background:var(--b)' }), 'a favor de B')));

    var cost = Number($('cost').value);
    var sumSq = r.weights.reduce(function (a, w) { return a + w * w; }, 0);
    var sdPop = 15 * Math.sqrt(sumSq);
    $('reserve').textContent = Number.isFinite(cost) && cost > 0
      ? 'Con coste ' + fmt(cost, 1) + ' puntos por candidato y una población cuyo valor global tiene media 50 y desvío ' + fmt(sdPop, 1) + ', el valor de reserva es w* = ' + fmt(M.reservationValue(cost, 50, sdPop), 1) + '. A mayor coste de buscar, menor w*.'
      : 'Ingresá un coste mayor que 0.';
  }
  function metric(value, label) { return el('div', { class: 'metric' }, el('b', { text: value }), el('span', { text: label })); }

  // =====================================================================
  // 2. SIMULACIÓN
  // =====================================================================

  var PARAMS = [
    ['seed', 'Semilla (reproduce exactamente la simulación)', 1, 1, 999999, 1],
    ['runs', 'Corridas independientes por punto', 300, 10, 2000, 10],
    ['periods', 'Períodos por corrida', 40, 5, 200, 5],
    ['agent', 'Tipo de agente', 'bayes', null, null, null, [['bayes', 'Corrige por la incertidumbre (bayesiano)'], ['naive', 'Toma lo observado como verdadero (ingenuo)']]],
    ['candidatesPerPeriod', 'Candidatos conocidos por período', 3, 0, 20, 1],
    ['firstImpression', 'Información al conocer a un candidato (unidades)', 1, 0, 20, 1],
    ['initialInfo', 'Información previa sobre la pareja actual (unidades)', 8, 0, 40, 1],
    ['initialQualityShift', 'Calidad de la pareja actual sobre el promedio (puntos)', 0, -20, 40, 1],
    ['essentialThreshold', 'Umbral de requisitos esenciales', 35, -100, 100, 1],
    ['weightConcentration', 'Desigualdad entre las importancias', 0.5, 0, 3, 0.1],
    ['searchTrigger', 'Cuándo busca', 'always', null, null, null, [['always', 'En todos los períodos'], ['below_aspiration', 'Solo si su satisfacción percibida < aspiración']]],
    ['aspiration', 'Nivel de aspiración', 60, 30, 95, 1],
    ['mechanisms.focal', 'Foco en lo que falta (γ)', 0, 0, 6, 0.5],
    ['mechanisms.novelty', 'Bonificación de novedad (ν, puntos)', 0, 0, 20, 1],
    ['mechanisms.lossAversion', 'Aversión a la pérdida (λ ≥ 1)', 1, 1, 4, 0.25],
    ['mechanisms.comparison', 'Arrastre por comparación (η)', 0, 0, 1, 0.25],
    ['costs.dateCost', 'Coste monetario por unidad de información', 1, 0, 100, 1],
    ['costs.switchCost', 'Coste de cambiar (puntos)', 0, 0, 20, 0.5],
    ['costs.moneyToUtility', 'Conversión dinero → puntos (arbitraria)', 0, 0, 5, 0.05]
  ];
  var SWEEPABLE = ['candidatesPerPeriod', 'firstImpression', 'initialInfo', 'initialQualityShift', 'essentialThreshold', 'weightConcentration', 'aspiration', 'mechanisms.focal', 'mechanisms.novelty', 'mechanisms.lossAversion', 'mechanisms.comparison'];
  var METRIC_LABEL = {
    switches: 'Cambios de pareja por corrida', regretShare: 'Proporción de cambios que empeoran el ajuste verdadero',
    meanGainPerSwitch: 'Ganancia verdadera por cambio (puntos)', meanOverestimation: 'Sobreestimación al elegir (percibido − verdadero)',
    meanTrueWelfare: 'Ajuste verdadero medio (puntos)', welfareVsStaying: 'Ajuste verdadero vs. no cambiar (puntos)',
    moneyCost: 'Coste monetario total', netWelfare: 'Ajuste neto de costes (puntos)', netVsStaying: 'Neto de costes vs. no cambiar (puntos)',
    meanPerceivedSatisfaction: 'Satisfacción percibida con la pareja actual'
  };
  var paramInputs = {};
  var lastResult = null;

  function buildSim() {
    var root = $('sim');
    var form = el('div', { class: 'cols' });
    PARAMS.forEach(function (p) {
      var wrap = el('div', null, el('label', { class: 'l', for: 'p_' + p[0], text: p[1] }));
      var input;
      if (p[6]) {
        input = el('select', { id: 'p_' + p[0] });
        p[6].forEach(function (o) { var opt = el('option', { value: o[0], text: o[1] }); if (o[0] === p[2]) opt.selected = true; input.appendChild(opt); });
      } else {
        input = el('input', { id: 'p_' + p[0], type: 'number', min: p[3], max: p[4], step: p[5], value: p[2] });
      }
      paramInputs[p[0]] = input;
      wrap.appendChild(input);
      form.appendChild(wrap);
    });

    var sweepSel = el('select', { id: 'sweepParam' });
    SWEEPABLE.forEach(function (k) {
      var def = PARAMS.filter(function (p) { return p[0] === k; })[0];
      sweepSel.appendChild(el('option', { value: k, text: def[1] }));
    });
    var metricSel = el('select', { id: 'metric' });
    Object.keys(METRIC_LABEL).forEach(function (k) { metricSel.appendChild(el('option', { value: k, text: METRIC_LABEL[k] })); });
    metricSel.value = 'regretShare';

    root.appendChild(el('div', { class: 'grid' },
      el('div', { class: 'card s12' }, el('h2', { text: 'Agentes ficticios' }),
        el('p', { class: 'sub', text: 'Cada «agente» es una regla programada: tiene una pareja actual con información abundante, conoce candidatos con información escasa y decide si cambiar. Sus preferencias y su forma de decidir son supuestos de diseño. Nada de lo que sigue es una estimación de cómo se comportan las personas.' }),
        form),
      el('div', { class: 'card s12' }, el('h2', { text: 'Barrido de un parámetro (el resto queda constante)' }),
        el('div', { class: 'cols' },
          el('div', null, el('label', { class: 'l', for: 'sweepParam', text: 'Parámetro a variar' }), sweepSel),
          el('div', null, el('label', { class: 'l', for: 'sweepFrom', text: 'Desde' }), el('input', { id: 'sweepFrom', type: 'number', value: 1, step: 'any' })),
          el('div', null, el('label', { class: 'l', for: 'sweepTo', text: 'Hasta' }), el('input', { id: 'sweepTo', type: 'number', value: 12, step: 'any' })),
          el('div', null, el('label', { class: 'l', for: 'sweepSteps', text: 'Puntos (2 a 12)' }), el('input', { id: 'sweepSteps', type: 'number', min: 2, max: 12, value: 6 })),
          el('div', null, el('label', { class: 'l', for: 'metric', text: 'Métrica a graficar' }), metricSel)),
        el('div', { class: 'cols', style: 'margin-top:12px' },
          el('button', { class: 'btn primary', id: 'runSweep', type: 'button', text: 'Ejecutar barrido (bayesiano e ingenuo)' }),
          el('button', { class: 'btn', id: 'runOne', type: 'button', text: 'Ejecutar un solo punto' }),
          el('button', { class: 'btn', id: 'dlJson', type: 'button', text: 'Descargar JSON (con configuración)' }),
          el('button', { class: 'btn', id: 'dlCsv', type: 'button', text: 'Descargar CSV' })),
        el('div', { id: 'simStatus', class: 'notice', 'aria-live': 'polite', text: 'Todavía no se ejecutó nada.' })),
      el('div', { class: 'card s12', id: 'simOut' })
    ));
    sweepSel.addEventListener('change', syncSweepDefaults);
    syncSweepDefaults();
    $('runSweep').addEventListener('click', function () { run('sweep'); });
    $('runOne').addEventListener('click', function () { run('one'); });
    $('dlJson').addEventListener('click', function () { download('json'); });
    $('dlCsv').addEventListener('click', function () { download('csv'); });
    $('metric').addEventListener('change', function () { if (lastResult) draw(); });
  }

  var SWEEP_DEFAULT = {
    candidatesPerPeriod: [1, 12], firstImpression: [1, 12], initialInfo: [0, 24], initialQualityShift: [0, 25], essentialThreshold: [20, 75],
    weightConcentration: [0, 2.5], aspiration: [40, 80], 'mechanisms.focal': [0, 6], 'mechanisms.novelty': [0, 20], 'mechanisms.lossAversion': [1, 3], 'mechanisms.comparison': [0, 1]
  };
  function syncSweepDefaults() {
    var d = SWEEP_DEFAULT[$('sweepParam').value];
    $('sweepFrom').value = d[0];
    $('sweepTo').value = d[1];
    if ($('sweepParam').value === 'aspiration') paramInputs.searchTrigger.value = 'below_aspiration';
  }

  function collectConfig() {
    var cfg = {};
    var bad = [];
    PARAMS.forEach(function (p) {
      var input = paramInputs[p[0]];
      var v = p[6] ? input.value : Number(input.value);
      if (!p[6] && (input.value.trim() === '' || !Number.isFinite(v) || v < p[3] || v > p[4])) { bad.push(p[1]); input.classList.add('invalid'); } else input.classList.remove('invalid');
      S.setPath(cfg, p[0], v);
    });
    return { cfg: cfg, bad: bad };
  }

  function run(mode) {
    var status = $('simStatus');
    var c = collectConfig();
    if (c.bad.length) { status.className = 'notice bad'; status.textContent = 'Valores fuera de rango: ' + c.bad.join('; ') + '.'; return; }
    var def = { base: c.cfg };
    var values = null;
    if (mode === 'sweep') {
      var from = Number($('sweepFrom').value), to = Number($('sweepTo').value), steps = Math.round(Number($('sweepSteps').value));
      if (![from, to, steps].every(Number.isFinite) || steps < 2 || steps > 12) { status.className = 'notice bad'; status.textContent = 'Revisá desde / hasta / puntos (entre 2 y 12).'; return; }
      values = [];
      for (var i = 0; i < steps; i++) {
        var v = from + ((to - from) * i) / (steps - 1);
        var path = $('sweepParam').value;
        if (['candidatesPerPeriod', 'firstImpression', 'initialInfo'].indexOf(path) >= 0) v = Math.round(v);
        else v = Math.round(v * 1000) / 1000;
        if (values.indexOf(v) < 0) values.push(v);
      }
      def.sweep = { path: $('sweepParam').value, values: values };
    }
    status.className = 'notice';
    status.textContent = 'Calculando…';
    setTimeout(function () {
      try {
        var series = [];
        var agents = mode === 'sweep' ? ['bayes', 'naive'] : [c.cfg.agent];
        agents.forEach(function (agent) {
          var base = JSON.parse(JSON.stringify(c.cfg));
          base.agent = agent;
          if (mode === 'sweep') {
            series.push({ label: agent, points: S.runSweep(base, def.sweep.path, values) });
          } else {
            series.push({ label: agent, points: [{ value: null, summary: S.runExperiment(base).summary }] });
          }
        });
        lastResult = { version: S.VERSION, mode: mode, definition: def, series: series, notice: 'Agentes ficticios con reglas programadas: no son observaciones de personas reales.' };
        status.className = 'notice';
        status.textContent = 'Listo. Versión ' + S.VERSION + ', semilla ' + c.cfg.seed + ', ' + c.cfg.runs + ' corridas por punto. Repetir con los mismos valores da exactamente lo mismo.';
        draw();
      } catch (e) {
        status.className = 'notice bad';
        status.textContent = 'Error: ' + e.message;
      }
    }, 20);
  }

  var COLORS = { bayes: '#3659a8', naive: '#c27a16' };
  var NAMES = { bayes: 'Bayesiano (corrige)', naive: 'Ingenuo (toma lo observado)' };

  function draw() {
    var out = $('simOut');
    out.textContent = '';
    var metric = $('metric').value;
    var r = lastResult;
    out.appendChild(el('h2', { text: METRIC_LABEL[metric] }));
    if (r.mode === 'sweep') {
      var canvas = el('canvas', { 'aria-label': 'Gráfico: ' + METRIC_LABEL[metric] + ' según ' + r.definition.sweep.path });
      out.appendChild(canvas);
      out.appendChild(el('div', { class: 'legend' }, ['bayes', 'naive'].map(function (k) { return el('span', null, el('i', { style: 'background:' + COLORS[k] }), NAMES[k]); })));
      out.appendChild(el('p', { class: 'sub', text: 'Barras: intervalo de 95 % de la media entre corridas independientes. Eje X: ' + r.definition.sweep.path + '.' }));
      plot(canvas, r, metric);
    }
    var head = ['Agente'].concat(r.mode === 'sweep' ? [r.definition.sweep.path] : [], ['Media', 'IC 95 %', 'Desvío']);
    var tbody = el('tbody');
    r.series.forEach(function (s) {
      s.points.forEach(function (p) {
        var m = p.summary[metric];
        var isP = metric === 'regretShare';
        var f = function (x) { return isP ? pct(x) : fmt(x, 2); };
        var cells = [el('td', { text: NAMES[s.label] })];
        if (r.mode === 'sweep') cells.push(el('td', { class: 'num', text: String(p.value) }));
        cells.push(el('td', { class: 'num', text: f(m.mean) }), el('td', { class: 'num', text: '[' + f(m.ci95[0]) + ', ' + f(m.ci95[1]) + ']' }), el('td', { class: 'num', text: f(m.sd) }));
        tbody.appendChild(el('tr', null, cells));
      });
    });
    out.appendChild(el('div', { class: 'scroll' }, el('table', null, el('thead', null, el('tr', null, head.map(function (h, i) { return el('th', { class: i > 0 ? 'num' : '', text: h }); }))), tbody)));
    if (r.mode === 'one') {
      var s0 = r.series[0].points[0].summary;
      var rows = el('tbody');
      Object.keys(METRIC_LABEL).forEach(function (k) {
        var isP = k === 'regretShare';
        rows.appendChild(el('tr', null, el('td', { text: METRIC_LABEL[k] }), el('td', { class: 'num', text: isP ? pct(s0[k].mean) : fmt(s0[k].mean, 2) }), el('td', { class: 'num', text: '± ' + (isP ? pct(1.96 * s0[k].se) : fmt(1.96 * s0[k].se, 2)) })));
      });
      out.appendChild(el('h3', { text: 'Todas las métricas (media ± IC 95 %)' }));
      out.appendChild(el('div', { class: 'scroll' }, el('table', null, rows)));
    }
    out.appendChild(el('div', { class: 'notice', text: 'Cómo leerlo: «empeoran» significa que el ajuste verdadero —que el agente no puede observar— queda más bajo tras el cambio. Es una cantidad que solo existe dentro de la simulación. Un resultado que contradice la hipótesis inicial es un resultado válido: se documenta igual.' }));
  }

  function plot(canvas, r, metric) {
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || 700, cssH = canvas.clientHeight || 320;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var cs = getComputedStyle(document.documentElement);
    var ink = cs.getPropertyValue('--ink').trim() || '#17243a', line = cs.getPropertyValue('--line').trim() || '#dfe5ee', muted = cs.getPropertyValue('--muted').trim() || '#5d6b82';
    var pad = { l: 56, r: 14, t: 12, b: 36 };
    var xs = r.series[0].points.map(function (p) { return p.value; });
    var ymin = Infinity, ymax = -Infinity;
    r.series.forEach(function (s) { s.points.forEach(function (p) { var m = p.summary[metric]; if (m.mean === null) return; ymin = Math.min(ymin, m.ci95[0]); ymax = Math.max(ymax, m.ci95[1]); }); });
    if (!Number.isFinite(ymin)) { ctx.fillStyle = muted; ctx.fillText('Sin datos para esta métrica (por ejemplo, no hubo cambios).', 20, 30); return; }
    if (metric === 'regretShare') { ymin = Math.min(ymin, 0); ymax = Math.max(ymax, 0.05); }
    if (ymax === ymin) { ymax += 1; ymin -= 1; }
    var padY = (ymax - ymin) * 0.08; ymin -= padY; ymax += padY;
    var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs);
    if (xmax === xmin) xmax += 1;
    var X = function (x) { return pad.l + ((x - xmin) / (xmax - xmin)) * (cssW - pad.l - pad.r); };
    var Y = function (y) { return pad.t + (1 - (y - ymin) / (ymax - ymin)) * (cssH - pad.t - pad.b); };
    ctx.font = '12px system-ui'; ctx.fillStyle = muted; ctx.strokeStyle = line; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var yv = ymin + ((ymax - ymin) * i) / 4, y = Y(yv);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(cssW - pad.r, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(metric === 'regretShare' ? (100 * yv).toFixed(0) + '%' : yv.toFixed(1), pad.l - 6, y + 4);
    }
    ctx.textAlign = 'center';
    xs.forEach(function (x) { ctx.fillText(String(x), X(x), cssH - 14); });
    ctx.save(); ctx.strokeStyle = ink; ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, cssH - pad.b); ctx.lineTo(cssW - pad.r, cssH - pad.b); ctx.stroke(); ctx.restore();
    if (ymin < 0 && ymax > 0) { ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = muted; ctx.beginPath(); ctx.moveTo(pad.l, Y(0)); ctx.lineTo(cssW - pad.r, Y(0)); ctx.stroke(); ctx.restore(); }
    r.series.forEach(function (s) {
      ctx.strokeStyle = COLORS[s.label]; ctx.fillStyle = COLORS[s.label]; ctx.lineWidth = 2;
      ctx.beginPath(); var started = false;
      s.points.forEach(function (p) { var m = p.summary[metric]; if (m.mean === null) return; var x = X(p.value), y = Y(m.mean); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
      ctx.stroke();
      s.points.forEach(function (p) {
        var m = p.summary[metric]; if (m.mean === null) return;
        var x = X(p.value);
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, Y(m.ci95[0])); ctx.lineTo(x, Y(m.ci95[1])); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, Y(m.mean), 3.5, 0, 6.2832); ctx.fill();
      });
    });
  }

  function download(kind) {
    if (!lastResult) { $('simStatus').className = 'notice warn'; $('simStatus').textContent = 'Primero ejecutá una simulación.'; return; }
    var text, name, type;
    if (kind === 'json') {
      text = JSON.stringify(lastResult, null, 2); name = 'resultado-simulacion.json'; type = 'application/json';
    } else {
      var rows = [['version', 'semilla', 'agente', 'parametro', 'valor', 'metrica', 'n', 'media', 'sd', 'se', 'ic95_inf', 'ic95_sup']];
      var cfg = lastResult.definition.base;
      lastResult.series.forEach(function (s) {
        s.points.forEach(function (p) {
          S.METRICS.forEach(function (m) {
            var x = p.summary[m];
            rows.push([lastResult.version, cfg.seed, s.label, lastResult.definition.sweep ? lastResult.definition.sweep.path : '', p.value === null ? '' : p.value, m, x.n, x.mean, x.sd, x.se, x.ci95[0], x.ci95[1]]);
          });
        });
      });
      text = rows.map(function (r) { return r.map(function (v) { return v === null ? '' : String(v); }).join(','); }).join('\n') + '\n'; name = 'resultado-simulacion.csv'; type = 'text/csv;charset=utf-8';
    }
    var blob = new Blob([text], { type: type });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // =====================================================================
  // 3. MODELO y 4. LÍMITES (texto)
  // =====================================================================

  function buildModel() {
    var root = $('model');
    var eq = function (t) { return el('pre', { text: t }); };
    root.appendChild(el('div', { class: 'grid' }, el('div', { class: 'card s12' },
      el('h2', { text: 'Ecuaciones (versión 0.2)' }),
      el('p', { class: 'sub', text: 'Resumen. La derivación, los supuestos y qué parámetros son decisiones de diseño están en docs/modelo-matematico.md. Ninguna de estas fórmulas es una ley psicológica.' }),
      el('h3', { text: '1. Utilidad de una persona' }),
      eq('U = Σ wᵢ · mᵢ        con  Σ wᵢ = 1,  wᵢ ≥ 0\nmᵢ = valor percibido del factor i (0–100)'),
      el('p', { text: 'Es un promedio ponderado: compensatorio. Por eso los requisitos esenciales no entran aquí sino como filtro (punto 3).' }),
      el('h3', { text: '2. Información e incertidumbre (normal–normal)' }),
      eq('x ~ N(μ, σ₀²)           valor verdadero, desconocido\nyₖ = x + εₖ, εₖ ~ N(0, σ²)    n observaciones, media ȳ\nposterior: media = (μ/σ₀² + n·ȳ/σ²) / (1/σ₀² + n/σ²)\n           desvío = (1/σ₀² + n/σ²)^(−1/2)'),
      el('p', { text: 'Con n = 0 se conserva la previa: desconocer no equivale a «50». El agente «ingenuo» usa ȳ sin corregir; el bayesiano usa la media posterior.' }),
      el('h3', { text: '3. Requisitos esenciales (no compensatorios)' }),
      eq('B es admisible si  P(xᵢ ≥ θ | datos) ≥ p_min  para todo factor esencial i'),
      el('h3', { text: '4. Decisión de cambio' }),
      eq('wᵢ′ ∝ wᵢ · (1 + γ · max(0, aspiración − mᵢ,A)/100)      foco en lo que falta (γ = 0: sin efecto)\nG = Σ wᵢ′ · max(mᵢ,B − mᵢ,A, 0)     L = Σ wᵢ′ · max(mᵢ,A − mᵢ,B, 0)\nneto = G − λ·L + novedad            se cambia si B es admisible y neto > coste de cambiar'),
      el('p', { text: 'Con γ = 0, λ = 1 y sin novedad, neto = U_B − U_A. El mismo vector de pesos se aplica a ambas personas.' }),
      el('h3', { text: '5. Maldición del ganador (resultado analítico verificado en las pruebas)' }),
      eq('Si se elige el mejor de N candidatos por valor observado:\nE[observado − verdadero | elegido] = σ_e² / √(σ_v² + σ_e²) · E[máx de N normales estándar]'),
      el('p', { text: 'El sesgo crece con el ruido σ_e (poca información) y con N, y desaparece si se corrige por la incertidumbre. Es estadística de selección, no un hecho psicológico: que las personas la cometan es una pregunta empírica.' }),
      el('h3', { text: '6. Expectativas y coste de búsqueda' }),
      eq('valor de reserva w*:  E[(W − w*)⁺] = c      (Stigler 1961; McCall 1970)'),
      el('h3', { text: 'Parámetros' }),
      el('ul', { class: 'tight' },
        el('li', { text: 'Decisiones de diseño (no estimadas): población previa N(50, 15²), ruido de observación 15, γ, ν, λ, η, pesos y umbrales por defecto, conversión dinero → puntos.' }),
        el('li', { text: 'Podrían estimarse con datos: importancias wᵢ (preferencias declaradas y reveladas), ruido de observación (fiabilidad de las impresiones iniciales), λ y ν (experimentos), costes de búsqueda.' }))
    )));
  }

  function buildLimits() {
    $('limits').appendChild(el('div', { class: 'grid' }, el('div', { class: 'card s12' },
      el('h2', { text: 'Lo que este modelo NO demuestra' }),
      el('ul', null,
        el('li', { text: 'No evalúa objetivamente el valor de una persona ni de una relación.' }),
        el('li', { text: 'No determina la pareja ideal ni dice a nadie qué hacer.' }),
        el('li', { text: 'No predice el éxito o el fracaso de ninguna relación real.' }),
        el('li', { text: 'No demuestra que las personas cometan los errores que simulan los agentes «ingenuos»: ese comportamiento es un supuesto programado.' }),
        el('li', { text: 'No estima porcentajes de abandono, de arrepentimiento ni de éxito en poblaciones reales. Las cifras que produce son propiedades de reglas inventadas.' }),
        el('li', { text: 'No distingue culturas, géneros, orientaciones, edades ni contextos; todos los agentes son idénticos salvo por el azar.' }),
        el('li', { text: 'No incluye la reciprocidad: la otra persona no decide ni cambia. Una relación son dos personas.' }),
        el('li', { text: 'Los factores son independientes y normales; en la realidad hay correlaciones y valores acotados.' }),
        el('li', { text: 'El «ajuste verdadero» es una cantidad que solo existe dentro de la simulación; en la vida real nadie lo observa.' })),
      el('h3', { text: 'Cómo se usa de forma responsable' }),
      el('p', { text: 'Como herramienta para razonar: ver qué supuestos hacen falta para que comparar con una alternativa poco conocida lleve a una mala decisión, y cuáles hacen que no ocurra. Los resultados que contradicen la hipótesis original (por ejemplo, que un agente que corrige por la incertidumbre casi nunca se arrepiente en promedio) se documentan en el repositorio con el mismo peso que los que la apoyan.' }),
      el('p', { text: 'Más: docs/limitaciones.md, docs/hipotesis.md y docs/antecedentes.md en el repositorio.' }))));
  }

  buildCalc();
  buildSim();
  buildModel();
  buildLimits();
  $('footer').textContent = 'Modelo standleymoise v' + S.VERSION + ' · exploratorio · código MIT, documentación CC BY 4.0 · se ejecuta localmente en tu navegador; no envía ni almacena datos.';
})();
