/* PC portables — audit illustré.
   Décore l'audit existant (pc-visuals.js) sans modifier sa logique :
   1. chaque option porte un dessin animé ;
   2. le profil trouvé s'affiche avec son dessin ;
   3. tous les profils sont présentés, avec les modèles correspondants. */
(function () {
'use strict';
var PCICON = window.PCICON || {};
var audit = document.getElementById('pc-audit');
if (!audit) return;

var PROF = [
  { id: 'etudiant', label: 'Étudiant', line: 'Autonomie, prix, écran lisible', mini: PCICON.etudiant },
  { id: 'professionnel', label: 'Professionnel', line: 'Réactivité et confort de travail', mini: PCICON.professionnel },
  { id: 'createur', label: 'Créateur / montage', line: 'Couleur, stockage et export rapide', mini: PCICON.createur },
  { id: 'gamer', label: 'Gamer', line: 'Carte graphique et fluidité', mini: PCICON.gamer }
];

/* ---------- Dessins compacts : un par option, chacun porteur de sens ---------- */
function scene(cls, lift) {
  return '<i class="ag ag-scn ' + cls + '"><svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="320" height="180" fill="#000"/><circle cx="252" cy="40" r="15" fill="#f6efd2"/>' +
    '<g fill="#0e1118"><rect x="14" y="90" width="52" height="90"/><rect x="74" y="60" width="44" height="120"/><rect x="126" y="104" width="58" height="76"/><rect x="192" y="70" width="46" height="110"/><rect x="246" y="100" width="60" height="80"/></g>' +
    '<g class="w" fill="#ffd86b"><rect x="26" y="104" width="9" height="12"/><rect x="44" y="130" width="9" height="12"/><rect x="86" y="80" width="9" height="12"/><rect x="100" y="112" width="9" height="12"/><rect x="140" y="120" width="9" height="12"/><rect x="204" y="86" width="9" height="12"/><rect x="262" y="116" width="9" height="12"/><rect x="284" y="140" width="9" height="12"/></g></svg>' +
    (lift ? '<u class="lift"></u>' : '') + '</i>';
}
function ramBar(cap) {
  var items = [[4, 0], [3, 1], [1.5, 2], [0.5, 4]], room = cap, used = 0, segs = '';
  items.forEach(function (it, i) {
    used += it[0];
    var take = Math.min(it[0], Math.max(room, 0)); room -= take;
    if (take > 0) segs += '<b style="--w:' + (take / cap * 100).toFixed(1) + '%;--c:var(--k' + it[1] + ');--d:' + (i * 0.45).toFixed(2) + 's"></b>';
  });
  var over = Math.max(0, used - cap);
  return '<i class="ag ag-ram' + (over ? ' is-over' : '') + '"><span class="rb">' + segs + '</span>' +
    (over ? '<span class="ro" style="--w:' + Math.min(100, over / cap * 100).toFixed(1) + '%"></span>' : '') +
    '<small>' + used.toString().replace('.', ',') + ' Go utilisés sur ' + cap + ' Go' + (over ? ' : ça déborde' : '') + '</small></i>';
}
var CPU = { leger: [1, '12 min'], courant: [0.63, '8 min'], haut: [0.44, '5 min'] };
function cpuGlyph(k) {
  var r = CPU[k][0], d = (1 + r * 3).toFixed(2);
  return '<i class="ag ag-time"><span class="tr"><em>Site web</em><span class="tk"><b class="web"></b></span><small>≈ 1 s</small></span>' +
    '<span class="tr"><em>Export vidéo 4K</em><span class="tk"><b style="--r:' + r + ';--dur:' + d + 's"></b></span><small>≈ ' + CPU[k][1] + '</small></span></i>';
}
var GPU = { bureau: [100, 24, 20], creation: [100, 64, 76], jeu: [100, 95, 100] };
function gpuGlyph(k) {
  var v = GPU[k], lab = ['Bureau, vidéo', 'Montage 4K', 'Jeu récent'];
  return '<i class="ag ag-cap">' + v.map(function (n, i) {
    var c = n < 35 ? 'lo' : (n < 70 ? 'mid' : 'hi'), w = n < 35 ? 'difficile' : (n < 70 ? 'limite' : 'fluide');
    return '<span class="cr ' + c + '"><em>' + lab[i] + '</em><span class="ck"><b style="--w:' + n + '%;--d:' + (i * 0.12) + 's"></b></span><small>' + w + '</small></span>';
  }).join('') + '</i>';
}
var BAGS = {
  livre: PCICON.livre.replace('<svg ', '<svg width="50" height="50" '),
  main: '<svg width="48" height="48" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M21 27c0-14 22-14 22 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path class="bd" d="M9 27h46l4 25a5 5 0 0 1-5 6H10a5 5 0 0 1-5-6z"/><path class="bf" d="M9 27h46l-2 11H11z"/><circle cx="32" cy="38" r="3" class="bk"/></svg>',
  dos: '<svg width="60" height="60" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M26 13c0-8 12-8 12 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path class="bd" d="M13 28c0-11 6-16 19-16s19 5 19 16v26a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5z"/><path class="bl" d="M20 27h24"/><rect class="pk" x="20" y="36" width="24" height="16" rx="4"/><path class="bl" d="M8 34v14M56 34v14"/></svg>',
  rando: '<svg width="76" height="76" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect class="bm" x="17" y="2" width="30" height="8" rx="4"/><path class="bd2" d="M13 12h38a2 2 0 0 1 2 2v8H11v-8a2 2 0 0 1 2-2z"/><path class="bd" d="M11 22h42l-2 34a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5z"/><rect class="bd" x="3" y="36" width="9" height="20" rx="3"/><rect class="bd" x="52" y="36" width="9" height="20" rx="3"/><path class="bl" d="M12 32h40M12 46h40"/><rect class="pk" x="21" y="36" width="22" height="14" rx="3"/></svg>'
};
function bag(kind, kg, w) {
  return '<i class="ag ag-bag">' + BAGS[kind] + '<span class="bw"><b>≈ ' + kg + ' kg</b><small>chargeur ' + w + ' W</small></span></i>';
}
function euros(n) { var s = ''; for (var i = 1; i <= 4; i++) s += '<b' + (i <= n ? ' class="on"' : '') + '>€</b>'; return '<i class="eu" aria-hidden="true">' + s + '</i>'; }

function hz(n, label, steps) {
  return '<span class="agw"><i class="ag ag-hz1" style="--n:' + n + ';--s:' + steps + '"><em><b></b></em></i><span class="ag-tag">' + label + '</span></span>';
}
function gamBar(w, grad, label) {
  return '<span class="agw"><i class="ag ag-bar2" style="--p:' + w + ';--spec:' + grad + '"><b></b></i><span class="ag-tag">' + label + '</span></span>';
}
function fill(to, label) {
  return '<span class="agw"><i class="ag ag-fill" style="--to:' + to + '"><b></b></i><span class="ag-tag">' + label + '</span></span>';
}
function gam(from, to, label) {
  return '<span class="agw"><i class="ag ag-gam" style="--from:' + from + ';--to:' + to + '"><b class="s"></b><b class="p"></b></i><span class="ag-tag">' + label + '</span></span>';
}
function lap(w) {
  return '<i class="ag ag-lap"><svg width="' + w + '" height="' + Math.round(w * 0.68) + '" viewBox="0 0 60 41" aria-hidden="true" focusable="false"><rect class="ls" x="8" y="2" width="44" height="29" rx="3"/><path class="lb" d="M2 34h56l-3 5H5z"/></svg></i>';
}
var GLYPH = {
  ecran: {
    ips: '<span class="agw">' + scene('ips', true) + '<span class="ag-tag">IPS</span></span>',
    oled: '<span class="agw">' + scene('oled', false) + '<span class="ag-tag">OLED</span></span>',
    '60': hz(10, '60 Hz', 6), '120': hz(20, '120 Hz', 12), '144': hz(24, '144 Hz +', 18),
    srgb: gamBar('50%', 'linear-gradient(90deg,#e0352b,#2fbf5b,#2f6fe0)', 'sRGB'),
    p3: gamBar('75%', 'linear-gradient(90deg,#ff2a1f,#20e05a,#1f5bff)', 'DCI-P3'),
    adobe: gamBar('100%', 'linear-gradient(90deg,#ff1f1f,#1cff4a,#1a2bff)', 'Adobe RGB'),
    de: gamBar('100%', 'linear-gradient(90deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff)', 'ΔE < 2'),
    '13': lap(30), '15': lap(38), '16': lap(45), '18': lap(54)
  },
  memoire: {
    '8': '<i class="ag ag-bar ag-over" style="--w:100%"></i>',
    '16': '<i class="ag ag-bar" style="--w:60%"></i>',
    '32': '<i class="ag ag-bar" style="--w:35%"></i>'
  },
  processeur: { leger: cpuGlyph('leger'), courant: cpuGlyph('courant'), haut: cpuGlyph('haut') },
  graphique: { bureau: gpuGlyph('bureau'), creation: gpuGlyph('creation'), jeu: gpuGlyph('jeu') },
  mobilite: { ultra: bag('livre', '1,2', 65), polyvalent: bag('dos', '1,8', 100), station: bag('rando', '2,7', 240) },
  budget: { under800: euros(1), '800-1200': euros(2), '1200-1800': euros(3), over1800: euros(4) }
};

/* Ce que vous gagnez / ce que vous perdez, en mots simples. */
var COPY = {
  ecran: {
    ips: ['', 'Lumineux, fiable, tout usage', 'Noirs un peu grisés'],
    oled: ['', 'Noirs parfaits, contraste fort', 'Plus cher, luminosité soutenue plus faible'],
    '60': ['Bureau et usage courant', '', ''],
    '120': ['Plus fluide au quotidien', '', ''],
    '144': ['Jeu compétitif', '', ''],
    srgb: ['Standard, suffisant', '', ''],
    p3: ['Vidéo, photo, design', '', ''],
    adobe: ['Photo et impression pro', '', ''],
    de: ['Teintes justes, calibré', '', ''],
    '13': ['Très léger', '', ''], '15': ['Équilibré', '', ''], '16': ['Confort', '', ''], '18': ['Station', '', '']
  },
  memoire: {
    '8': ['Juste pour le web et les cours', 'Prix bas', 'Ralentit dès que plusieurs logiciels sont ouverts'],
    '16': ['Le bon point de départ', 'Cours, bureau, multitâche', 'Juste pour le montage lourd'],
    '32': ['Large marge de travail', 'Montage et projets lourds', 'Superflu pour la bureautique seule']
  },
  processeur: {
    leger: ['Web, visio, bureautique', 'Silencieux et autonome', 'Exporter une vidéo prend longtemps'],
    courant: ['Le polyvalent', 'Bureau, code léger, photo', 'Exports vidéo assez longs'],
    haut: ['Calculs lourds rapides', 'Montage, 3D, exports', 'Plus cher, chauffe davantage']
  },
  graphique: {
    bureau: ['Intégrée au processeur', 'Légère, économique, autonome', 'Insuffisante pour les jeux récents et la 3D'],
    creation: ['Carte dédiée, milieu de gamme', 'Effets vidéo, 3D légère', 'Plus lourde et plus chère'],
    jeu: ['Carte dédiée haut de gamme', 'Jeux et rendus exigeants', 'Lourde, bruyante, autonomie réduite']
  },
  mobilite: {
    ultra: ['Se glisse partout', 'Léger, longue autonomie', 'Puissance limitée'],
    polyvalent: ['Le compromis', 'Transport et confort', 'Ni le plus léger, ni le plus puissant'],
    station: ['Puissance avant tout', 'Refroidissement, performances soutenues', 'Lourd, chargeur volumineux']
  }
};

/* Effet de l'option sur le prix (relatif). -1 moins cher, 0 base, 1 plus cher, 2 nettement plus cher. */
var PRICE = {
  ecran: { ips: 0, oled: 1, '60': 0, '120': 1, '144': 2, srgb: 0, p3: 1, adobe: 2, de: 1 },
  memoire: { '8': -1, '16': 0, '32': 1 },
  processeur: { leger: -1, courant: 0, haut: 1 },
  graphique: { bureau: -1, creation: 1, jeu: 2 },
  mobilite: { ultra: 1, polyvalent: 0, station: 2 }
};
var PRICE_LABEL = { '-1': '▼ moins cher', '0': '≈ prix de base', '1': '▲ plus cher', '2': '▲▲ très cher' };
var LAYOUT = { dalle: 'g2', hz: 'g3', couleur: 'g4', taille: 'size', budget: 'plain', os: 'plain' };
/* Icône discrète en pied de carte (à droite du badge de prix) : elle n'empiète pas sur le texte. */
var ICON = {
  processeur: '<svg class="ao-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg>',
  memoire: '<svg class="ao-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2" y="6" width="20" height="10" rx="1.5"/><path d="M5 9.5h2.5v3H5zM9.5 9.5H12v3H9.5zM14 9.5h2.5v3H14zM18 9.5h1.5v3H18z"/><path d="M4 19h16" stroke-dasharray="1.6 1.6"/></svg>',
  graphique: '<svg class="ao-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2" y="6" width="20" height="11" rx="1.5"/><circle cx="9" cy="11.5" r="3.2"/><circle cx="9" cy="11.5" r="1"/><circle cx="16" cy="11.5" r="3.2"/><circle cx="16" cy="11.5" r="1"/><path d="M5 17v3M9 17v3"/></svg>'
};

/* 1. Dessins, résumés et prix sur les options de l'audit */
var opened = false;
function decorate() {
  audit.querySelectorAll('.pc-audit-card').forEach(function (card) {
    var fam = card.getAttribute('data-family');
    card.querySelectorAll('.pc-options').forEach(function (opts) {
      if (opts.dataset.lay) return;
      var g = opts.closest('.pc-group');
      opts.dataset.lay = LAYOUT[g ? g.getAttribute('data-group') : fam] || 'rows';
    });
    card.querySelectorAll('[data-value]').forEach(function (btn) {
      if (btn.dataset.ag) return;
      btn.dataset.ag = '1';
      [].slice.call(btn.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) { var sp = document.createElement('span'); sp.className = 'ao-name'; sp.textContent = n.textContent.trim(); btn.replaceChild(sp, n); }
      });
      var v = btn.getAttribute('data-value');
      var g = GLYPH[fam] && GLYPH[fam][v];
      if (g) { btn.classList.add('has-ag'); btn.insertAdjacentHTML('afterbegin', g); }
      var c = COPY[fam] && COPY[fam][v];
      if (c) btn.insertAdjacentHTML('beforeend',
        (c[0] ? '<span class="ao-say">' + c[0] + '</span>' : '') +
        (c[1] ? '<span class="ao-pro"><i>✓</i>' + c[1] + '</span>' : '') +
        (c[2] ? '<span class="ao-con"><i>✗</i>' + c[2] + '</span>' : ''));
      var pr = PRICE[fam] && PRICE[fam][v];
      var ap = pr === undefined ? '' : '<span class="ap ap-' + (pr < 0 ? 'down' : pr === 0 ? 'base' : pr === 1 ? 'up' : 'up2') + '">' + PRICE_LABEL[String(pr)] + '</span>';
      if (ICON[fam]) btn.insertAdjacentHTML('beforeend', '<span class="ao-foot">' + ap + ICON[fam] + '</span>');
      else if (ap) btn.insertAdjacentHTML('beforeend', ap);
    });
    var help = card.querySelector('.pc-audit-help');
    if (help && !help.closest('.ao-more') && COPY[fam]) {
      var d = document.createElement('details'); d.className = 'ao-more';
      d.innerHTML = '<summary>Pourquoi ça compte ?</summary>';
      help.parentNode.insertBefore(d, help); d.appendChild(help);
    }
  });
  if (!opened) {
    var first = audit.querySelector('.pc-audit-card');
    if (first) { opened = true; first.classList.add('is-open'); var h = first.querySelector('.pc-audit-head'); if (h) h.setAttribute('aria-expanded', 'true'); }
  }
  if (!document.querySelector('.ap-note')) {
    audit.insertAdjacentHTML('beforebegin', '<p class="ap-note">Touchez ce qui vous ressemble. <span class="ap ap-down">▼ moins cher</span> <span class="ap ap-up">▲ plus cher</span></p>');
  }
}
decorate();
new MutationObserver(decorate).observe(audit, { childList: true, subtree: true });

/* 2 & 3. Profil trouvé, puis tous les profils avec leurs modèles */
var products = [], sel = null;
var res = document.getElementById('pc-audit-result');
var box = document.createElement('div');
box.className = 'pav';
box.innerHTML =
  '<div class="pav-now" aria-live="polite"></div>' +
  '<p class="pav-h">Tous les profils, et les modèles qui leur correspondent</p>' +
  '<div class="pav-grid" role="group" aria-label="Profils"></div>' +
  '<div class="pav-match" aria-live="polite"></div>';
if (res) res.appendChild(box);

function euro(n) { return n ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n) : 'Prix à vérifier'; }
function score(p, id) { return ((p.profil_scores || {})[id]) || 0; }
function matches(id) {
  return products.filter(function (p) { return score(p, id) >= 7; })
    .sort(function (a, b) { return score(b, id) - score(a, id); });
}

function grid() {
  box.querySelector('.pav-grid').innerHTML = PROF.map(function (p) {
    var n = products.length ? matches(p.id).length : null;
    return '<button type="button" class="pav-card" data-pav="' + p.id + '" aria-pressed="' + (p.id === sel) + '">' +
      '<span class="pav-mini" aria-hidden="true">' + p.mini + '</span>' +
      '<strong>' + p.label + '</strong><small>' + p.line + '</small>' +
      '<em>' + (n === null ? '…' : n + ' modèle' + (n > 1 ? 's' : '') + ' adapté' + (n > 1 ? 's' : '')) + '</em></button>';
  }).join('');
}

function show(id) {
  sel = id;
  var p = PROF.filter(function (x) { return x.id === id; })[0]; if (!p) return;
  box.querySelector('.pav-now').innerHTML = '<span class="pav-mini" aria-hidden="true">' + p.mini + '</span><p>Votre profil : <b>' + p.label + '</b> · ' + p.line + '</p>';
  grid();
  box.querySelector('.pav-match').innerHTML = '';
  if (window.pcSetProfile) window.pcSetProfile(id);

}

box.addEventListener('click', function (e) {
  var b = e.target.closest('[data-pav]'); if (b) show(b.getAttribute('data-pav'));
});
document.addEventListener('pc:profile', function (e) {
  var id = e.detail && e.detail.id; if (id && id !== sel) show(id);
});

fetch('data/pc-portables.json').then(function (r) { return r.json(); }).then(function (d) {
  products = d.produits || d.products || [];
  if (sel) show(sel); else grid();
}).catch(function () { grid(); });
grid();
})();
