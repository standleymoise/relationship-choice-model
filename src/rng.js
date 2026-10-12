/*
 * rng.js — generador pseudoaleatorio con semilla explícita.
 *
 * Cada flujo se deriva de una lista de "partes" (semilla base, índice de corrida,
 * identificador de candidato...). Dos flujos con las mismas partes producen
 * exactamente la misma secuencia, sin importar en qué orden se ejecuten.
 * No es criptográfico; sirve solo para simulación reproducible.
 */
(function (root) {
  'use strict';

  /** Hash de 32 bits (FNV-1a + mezcla final de MurmurHash3) de una lista de partes. */
  function hashSeed(parts) {
    var s = parts.map(String).join('|');
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
  }

  /** mulberry32: generador uniforme en [0, 1) de 32 bits de estado. */
  function mulberry32(a) {
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Crea un flujo aleatorio independiente a partir de una lista de partes.
   * @param {Array} parts p. ej. [semilla, 'corrida', 7, 'candidato', 3]
   * @returns {{uniform: function(): number, normal: function(): number}}
   */
  function createRng(parts) {
    var uniform = mulberry32(hashSeed(parts));
    var spare = null;
    function normal() {
      // Box–Muller, aprovechando las dos salidas.
      if (spare !== null) {
        var s = spare;
        spare = null;
        return s;
      }
      var a = uniform();
      var b = uniform();
      if (a < 1e-300) a = 1e-300;
      var r = Math.sqrt(-2 * Math.log(a));
      var theta = 2 * Math.PI * b;
      spare = r * Math.sin(theta);
      return r * Math.cos(theta);
    }
    return { uniform: uniform, normal: normal };
  }

  var api = { hashSeed: hashSeed, createRng: createRng };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.RCM = root.RCM || {};
    root.RCM.rng = api;
  }
})(typeof self !== 'undefined' ? self : this);
