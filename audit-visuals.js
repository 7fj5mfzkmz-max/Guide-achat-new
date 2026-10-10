/* Illustrations des 5 critères (audit « 45 secondes »). Chaque schéma montre la grandeur réelle : taille à l'échelle, nombre d'images, épaisseur, etc. */
(function () {
  'use strict';
  var T = 'var(--teal)', O = 'var(--orchid)', L = 'var(--lime)', C = 'var(--coral,#e8745a)', K = 'var(--ink)', B = 'var(--blue,#3b82f6)', uid = 0;
  var tx = function (x, y, s, t, f, a) { return '<text x="' + x + '" y="' + y + '" font-size="' + s + '" font-weight="800" text-anchor="' + (a || 'middle') + '" fill="' + (f || K) + '" stroke="none">' + t + '</text>'; };
  var rc = function (x, y, w, h, r, fill, st, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r || 0) + '" fill="' + (fill || 'none') + '" ' + (st ? 'stroke="' + st + '" ' : 'stroke="none" ') + (extra || '') + '/>'; };
  var bar = function (n, on, x0, y, w, gap, col) { var s = ''; for (var i = 0; i < n; i++) s += rc(x0 + i * (w + gap), y, w, 5, 2.5, i < on ? col : K, '', i < on ? '' : 'opacity=".15"'); return s; };

  var V = {
    tech: function (v) {
      /* Zoom sur 6 × 3 pixels : OLED/AMOLED = chaque pixel s'allume seul (la zone noire est éteinte) ;
         LCD = lumière derrière tout l'écran (le noir reste gris) ; LTPO = la cadence s'adapte au contenu. */
      var cols = [T, O, L], cw = 12.6, ch = 12, x0 = 10, y0 = 8, s = '', lcd = v === 'lcd';
      if (v === 'ltpo') {
        s += tx(14, 15, 8.5, 'défilement 120 Hz', K, 'start') + '<path d="M14 25h68" stroke="' + K + '" stroke-opacity=".25" stroke-width="2"/>';
        for (var i = 0; i < 12; i++) s += '<circle cx="' + (14 + i * 68 / 11).toFixed(1) + '" cy="25" r="2" fill="' + T + '" stroke="none" opacity=".6"/>';
        s += '<circle class="av-slide" style="--n:12" cx="14" cy="25" r="5" fill="' + O + '" stroke="none"/>';
        s += tx(14, 41, 8.5, 'image fixe 1 Hz', K, 'start') + '<path d="M14 51h68" stroke="' + K + '" stroke-opacity=".25" stroke-width="2"/>';
        for (var j = 0; j < 3; j++) s += '<circle cx="' + (14 + j * 34) + '" cy="51" r="2" fill="' + T + '" stroke="none" opacity=".6"/>';
        return s + '<circle class="av-slide" style="--n:2" cx="14" cy="51" r="5" fill="' + L + '" stroke="' + K + '" stroke-width="1.2"/>' + tx(48, 62, 8, 'économe', K);
      }
      s += rc(x0 - 2, y0 - 2, 80, 40, 6, lcd ? '#dfe9f2' : '#0b0b12', K, 'stroke-width="2.4"');
      if (lcd) s += rc(x0 - 2, y0 - 2, 80, 40, 6, '#fff', '', 'class="av-pulse" opacity=".35"');
      for (var r = 0; r < 3; r++) for (var c = 0; c < 6; c++) {
        var dark = c > 3, x = x0 + c * cw + .8, y = y0 + r * ch + .8, w = cw - 1.6, h = ch - 1.6;
        if (dark) s += lcd ? rc(x, y, w, h, 2, '#8a949e') : rc(x, y, w, h, 2, 'none', '#fff', 'stroke-opacity=".18" stroke-dasharray="2 2"');
        else s += rc(x, y, w, h, 2, cols[(r + c) % 3], '', (lcd ? '' : 'class="av-pulse" style="--dl:' + (((r * 6 + c) % 5) * .25) + 's"'));
      }
      if (v === 'amoled') {
        for (var g = 1; g < 6; g++) s += '<path d="M' + (x0 + g * cw) + ' ' + (y0 - 2) + 'v40" stroke="#fff" stroke-opacity=".22"/>';
        for (var q = 1; q < 3; q++) s += '<path d="M' + (x0 - 2) + ' ' + (y0 + q * ch) + 'h80" stroke="#fff" stroke-opacity=".22"/>';
        s += rc(x0 - 2, y0, 80, 3, 1.5, '#fff', '', 'class="av-scan" opacity=".55"');
      }
      s += tx(x0 + 5 * cw, y0 + 20, 9, lcd ? 'gris' : 'noir', lcd ? '#1d2430' : '#8892a6');
      return s + tx(48, 58, 8.5, lcd ? 'lumière partout' : (v === 'amoled' ? 'pixels allumés seuls' : 'pixel éteint = noir'), K);
    },
    refresh: function (v) {
      var n = { '60': 6, '90': 9, '120': 12, '144': 14 }[v] || 6, s = tx(48, 15, 12, v + ' images', K) + '<path d="M14 40h68" stroke="' + K + '" stroke-opacity=".25" stroke-width="2"/>';
      for (var i = 0; i < n; i++) s += '<circle cx="' + (14 + i * 68 / (n - 1)) + '" cy="40" r="2.2" fill="' + T + '" stroke="none" opacity=".6"/>';
      return s + '<circle class="av-slide" style="--n:' + n + '" cx="14" cy="40" r="6" fill="' + O + '" stroke="none"/>' + tx(14, 58, 10, '0 s') + tx(82, 58, 10, '1 s');
    },
    brightness: function (v) {
      var g = { '600': .7, '1000': .5, '1600': .3, '2500': .1 }[v], k = { '600': 4, '1000': 6, '1600': 8, '2500': 10 }[v], lv = { '600': 1, '1000': 2, '1600': 3, '2500': 4 }[v], s = '<circle cx="78" cy="15" r="6" fill="' + L + '" stroke="' + K + '"/>';
      for (var i = 0; i < k; i++) { var a = Math.PI * (0.55 + i * 0.9 / (k - 1)); s += '<path d="M' + (78 + Math.cos(a) * 9).toFixed(1) + ' ' + (15 + Math.sin(a) * 9).toFixed(1) + 'L' + (78 + Math.cos(a) * 13).toFixed(1) + ' ' + (15 + Math.sin(a) * 13).toFixed(1) + '" stroke="' + K + '" stroke-width="1.6"/>'; }
      s += rc(10, 14, 52, 34, 5, '#101520', K, 'stroke-width="2.2"') + rc(16, 21, 36, 4, 2, '#fff') + rc(16, 29, 28, 4, 2, '#fff') + rc(16, 37, 32, 4, 2, '#fff') + rc(10, 14, 52, 34, 5, '#fff', '', 'opacity="' + g + '"');
      return s + bar(4, lv, 10, 55, 18, 3, T);
    },
    capacity: function (v) {
      var p = { '3000': .5, '4000': .67, '5000': .83, '6000': 1 }[v];
      return rc(8, 14, 72, 32, 6, 'none', K, 'stroke-width="3"') + rc(80, 25, 5, 10, 2, K) + rc(12, 18, 64 * p, 24, 3, T, '', 'class="av-grow"') + tx(44, 60, 11, v.replace(/(\d)(\d{3})$/, '$1 $2') + ' mAh');
    },
    chemistry: function (v) {
      var si = v === 'silicon', t = si ? 15 : 24, y = 36 - t / 2, s = tx(46, 12, 10, 'même capacité');
      if (si) s += rc(12, 24, 56, 24, 4, 'none', K, 'stroke-dasharray="3 3" opacity=".4"');
      s += rc(12, y, 56, t, v === 'lipoly' ? 9 : 3, si ? L : T, K, 'stroke-width="2.2" fill-opacity=".55"');
      if (v === 'liion') s += rc(12, y, 5, t, 2, K) + rc(63, y, 5, t, 2, K);
      if (v === 'lipoly') s += rc(68, 33, 7, 6, 1, K, '', 'opacity=".5"');
      return s + '<path d="M82 ' + y + 'v' + t + 'M79 ' + y + 'h6M79 ' + (y + t) + 'h6" stroke="' + K + '" stroke-width="1.6"/>' + tx(46, 62, 10, si ? 'plus fin' : 'standard', K);
    },
    charge: function (v) {
      var k = { '25': 1, '45': 2, '67': 3, '100': 4 }[v], d = { '25': 4, '45': 2.2, '67': 1.5, '100': 1 }[v], s = '';
      for (var i = 0; i < k; i++) s += '<path transform="translate(' + (48 - k * 6 + i * 12 + 3) + ' 6)" d="M3 0L-3 8H1L-1 14L6 5H2Z" fill="' + L + '" stroke="' + K + '" stroke-width=".9"/>';
      return s + rc(8, 26, 72, 24, 6, 'none', K, 'stroke-width="3"') + rc(80, 33, 5, 10, 2, K) + rc(12, 30, 64, 16, 3, T, '', 'class="av-charge" style="--d:' + d + 's"') + tx(46, 62, 11, v + ' W');
    },
    reference: function (v) {
      var lv = { basic: 2, mid: 3, high: 4, apple: 4 }[v], on = v === 'basic' ? [1, 1, 0] : [1, 1, 1], s = rc(10, 12, 24, 24, 4, 'none', K, 'stroke-width="2.4"') + rc(17, 19, 10, 10, 2, K);
      for (var i = 0; i < 4; i++) s += '<path d="M' + (15 + i * 5) + ' 8v4m0 24v4" stroke="' + K + '" stroke-width="1.6"/>';
      var ic = ['<path d="M-3.5 -2.5h7v5h-4l-2 2v-2h-1z" fill="#fff" stroke="none"/>', '<path d="M-2 -3.5l5 3.5-5 3.5z" fill="#fff" stroke="none"/>', '<path d="M-1 -4h2v3h3v2h-3v3h-2v-3h-3v-2h3z" fill="#fff" stroke="none"/>'];
      for (var j = 0; j < 3; j++) s += '<g transform="translate(' + (50 + j * 17) + ' 24)">' + (on[j] ? '<circle r="8" fill="' + T + '" stroke="none"/>' + ic[j] : '<circle r="8" fill="none" stroke="' + K + '" stroke-dasharray="2 2" opacity=".45"/>') + '</g>';
      return s + bar(4, lv, 10, 50, 17, 4, O);
    },
    gaming: function (v) {
      var n = { daily: 3, heavy: 4, pro: 5 }[v], s = '';
      if (v === 'daily') s = '<path d="M30 14h36a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H48l-8 7v-7h-10a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" fill="' + T + '" fill-opacity=".3" stroke="' + K + '" stroke-width="2.2"/>' + '<path d="M44 20l10 6-10 6z" fill="' + K + '" stroke="none"/>';
      if (v === 'heavy') s = rc(22, 12, 52, 28, 4, T, K, 'stroke-width="2.2" fill-opacity=".3"') + rc(28, 30, 14, 6, 2, O) + rc(44, 30, 22, 6, 2, L) + '<path d="M28 20h40" stroke="' + K + '" stroke-width="2"/>';
      if (v === 'pro') s = '<path d="M26 18h38c6 0 9 8 10 16 1 5-5 8-8 3l-5-6H29l-5 6c-3 5-9 2-8-3 1-8 4-16 10-16z" fill="' + O + '" fill-opacity=".3" stroke="' + K + '" stroke-width="2.2"/><path d="M30 22v8m-4-4h8" stroke="' + K + '" stroke-width="2"/><circle cx="58" cy="25" r="2.4" fill="' + K + '" stroke="none"/><circle cx="64" cy="30" r="2.4" fill="' + K + '" stroke="none"/><path d="M80 12c4 4 4 8 0 12-4-4-4-8 0-12z" fill="' + C + '" stroke="none"/>';
      for (var i = 0; i < 5; i++) s += '<circle cx="' + (28 + i * 10) + '" cy="56" r="3.2" fill="' + (i < n ? L : 'none') + '" stroke="' + K + '" stroke-width="1.4" opacity="' + (i < n ? 1 : .35) + '"/>';
      return s;
    },
    sensor: function (v) {
      var d = { small: [29, 22], medium: [51, 38], large: [82, 55] }, s = '';
      ['large', 'medium', 'small'].forEach(function (k) { var w = d[k][0], h = d[k][1], on = k === v; s += rc(48 - w / 2, 32 - h / 2, w, h, 3, on ? T : 'none', K, on ? 'stroke-width="2.4" fill-opacity=".4"' : 'stroke-dasharray="3 3" opacity=".3"'); });
      return s;
    },
    stabilization: function (v) {
      var eis = function (x, sc) { return '<g transform="translate(' + x + ' 0) scale(' + sc + ')" transform-origin="48 32">' + rc(20, 14, 56, 36, 3, 'none', K, 'stroke-dasharray="3 3" opacity=".4"') + '<g class="av-shift">' + rc(28, 20, 40, 24, 3, T, K, 'stroke-width="2.2" fill-opacity=".35"') + '</g></g>'; };
      var ois = function (x, sc) { return '<g transform="translate(' + x + ' 0) scale(' + sc + ')" transform-origin="48 32"><circle cx="48" cy="32" r="18" fill="none" stroke="' + K + '" stroke-width="2.4"/><circle class="av-float" cx="48" cy="32" r="8" fill="' + O + '" stroke="none"/></g>'; };
      if (v === 'ois') return ois(0, 1) + tx(48, 62, 10, 'la lentille bouge');
      if (v === 'both') return eis(-22, .62) + ois(24, .62);
      return eis(0, 1) + tx(48, 62, 10, 'logiciel');
    },
    zoom: function (v) {
      var sc = v === '5x' ? 5 : 2, id = 'z' + (uid++), s = '<defs><clipPath id="' + id + '"><rect x="10" y="8" width="76" height="48" rx="6"/></clipPath><pattern id="' + id + 'm" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="4.5" height="4.5" fill="#fff" opacity=".55"/><rect x="4.5" y="4.5" width="4.5" height="4.5" fill="#fff" opacity=".55"/></pattern></defs>';
      s += '<g clip-path="url(#' + id + ')">' + rc(0, 0, 96, 64, 0, 'var(--surface)') + '<g transform="translate(48 32) scale(' + sc + ') translate(-48 -38)"><path d="M0 64L24 36 44 50 66 30 96 64Z" fill="' + T + '" fill-opacity=".25" stroke="none"/><path d="M43.5 38.5L48 33.5 52.5 38.5" fill="' + O + '" stroke="none"/><rect x="44.5" y="38.5" width="7" height="6" fill="' + L + '" stroke="none"/><rect x="47" y="41" width="2" height="3.5" fill="' + K + '" stroke="none"/></g>' + (v === 'digital' ? rc(10, 8, 76, 48, 0, 'url(#' + id + 'm)') : '') + '</g>' + rc(10, 8, 76, 48, 6, 'none', K, 'stroke-width="2.4"');
      return s + rc(14, 42, v === 'digital' ? 52 : 40, 11, 5, '#fff', K, 'stroke-width="1.2"') + tx(v === 'digital' ? 40 : 34, 50.5, 9.5, v === 'digital' ? '×2 flou' : '×' + sc + ' net', '#1d2430');
    },
    resolution: function (v) {
      var g = { '12': [4, 3], '50': [8, 6], '108': [12, 9], '200': [16, 12] }[v], s = '', w = 68 / g[0], h = 48 / g[1];
      for (var r = 0; r < g[1]; r++) for (var c = 0; c < g[0]; c++) s += rc((14 + c * w + .4).toFixed(1), (8 + r * h + .4).toFixed(1), (w - .8).toFixed(1), (h - .8).toFixed(1), .6, T, '', 'opacity=".85"');
      return s;
    },
    updates: function (v) {
      var n = +v, s = tx(48, 20, 14, n + ' ans');
      for (var i = 0; i < 7; i++) s += rc(10 + i * 11.5, 30, 9.5, 20, 3, i < n ? O : 'none', i < n ? '' : K, i < n ? '' : 'stroke-dasharray="2 2" opacity=".4"');
      return s + tx(48, 61, 9.5, 'de sécurité');
    },
    repair: function (v) {
      var lv = { low: 1, standard: 2, good: 3 }[v], s = '<path d="M16 50L34 32" stroke="' + K + '" stroke-width="7" stroke-linecap="round"/><circle cx="38" cy="28" r="9" fill="none" stroke="' + K + '" stroke-width="3"/><path d="M33 20l5 8 8-5" stroke="var(--surface-2)" stroke-width="5" fill="none"/>';
      for (var i = 0; i < 3; i++) s += rc(60 + i * 11, 44 - (i * 9 + 10) + 10, 9, i * 9 + 10, 2, i < lv ? O : 'none', i < lv ? '' : K, i < lv ? '' : 'stroke-dasharray="2 2" opacity=".4"');
      return s + tx(72, 61, 9.5, 'pièces') + (v === 'good' ? '<path d="M14 18l5 5 9-10" stroke="' + T + '" stroke-width="3.2" fill="none"/>' : '');
    },
    protection: function (v) {
      var s = '';
      if (v === 'basic') return rc(36, 10, 24, 40, 5, 'none', K, 'stroke-width="2.4"') + '<path d="M18 14c3 4 3 7 0 9-3-2-3-5 0-9zM78 22c3 4 3 7 0 9-3-2-3-5 0-9zM20 40c3 4 3 7 0 9-3-2-3-5 0-9z" fill="' + B + '" stroke="none"/><path d="M40 20l16 20m0-20L40 40" stroke="' + C + '" stroke-width="3.2"/>';
      var top = v === 'ip67' ? 26 : 16, py = v === 'ip67' ? 30 : 36;
      return rc(6, top, 84, 58 - top, 0, B, '', 'opacity=".28"') + '<path d="M6 ' + top + 'q10-5 21 0t21 0 21 0 21 0" fill="none" stroke="' + B + '" stroke-width="2.4"/>' + rc(36, py, 20, 26, 4, 'var(--surface)', K, 'stroke-width="2.4"') + '<path d="M72 ' + top + 'v' + (py + 26 - top) + 'm-3 0h6" stroke="' + K + '" stroke-width="1.6"/>' + tx(90, 12, 10, v === 'ip67' ? '1 m' : '+ de 1 m', K, 'end');
    }
  };

  window.AuditVisuals = {
    V: V, tx: tx, rc: rc, bar: bar,
    render: function (group, value) {
      var f = V[group]; if (!f) return '';
      return '<span class="av" aria-hidden="true"><svg viewBox="0 0 96 64" focusable="false" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width="2">' + f(value) + '</svg></span>';
    }
  };
})();
