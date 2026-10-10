/**
 * POINT 4 - GLOSSAIRE ANIMÉ AU HOVER
 * Termes techniques avec popup explicatif et impact sur scoring
 */
(function () {
  "use strict";

  var glossaire = {
    'Hz': {
      def: 'Hertz — fréquence de rafraîchissement de l\'écran par seconde.',
      impact: 'À 60 Hz, l\'écran se redessine 60× par sec. À 120 Hz, mouvements plus fluides.',
      anim: '🔄'
    },
    'OLED': {
      def: 'Organic Light-Emitting Diode — technologie d\'écran où chaque pixel produit sa lumière.',
      impact: 'Noirs profonds, contraste infini, consommation plus variable selon le contenu.',
      anim: '⚫'
    },
    'LCD': {
      def: 'Liquid Crystal Display — écran rétroéclairé, moins cher et plus stable.',
      impact: 'Noirs moins profonds que l\'OLED, mais meilleure durabilité et moins de consommation variable.',
      anim: '◻️'
    },
    'mAh': {
      def: 'Milliampère-heure — unité de capacité électrique (non l\'énergie réelle).',
      impact: '5000 mAh sur une batterie 3.8V ≠ 5000 mAh sur 5V. L\'énergie réelle en Wh compte plus.',
      anim: '🔋'
    },
    'NPU': {
      def: 'Neural Processing Unit — processeur spécialisé pour l\'IA et traitement d\'image.',
      impact: 'Impact majeur pour photo/vidéo en post-traitement temps réel et IA générative locale.',
      anim: '🧠'
    },
    'TOPS': {
      def: 'Trillions Of Operations Per Second — capacité brute du processeur.',
      impact: 'Plus haut = plus rapide, mais ne suffit pas sans refroidissement et architecture optimale.',
      anim: '⚡'
    },
    'IP67': {
      def: 'Indice de Protection — IP6 = anti-poussière; 7 = immersion jusqu\'à 1m, 30 min.',
      impact: 'Utile en usage quotidien (pluie, éclaboussures). Pas critique pour bureau/étude.',
      anim: '💧'
    },
    'RAM': {
      def: 'Random Access Memory — mémoire vive, gère les applications simultanées.',
      impact: 'Au-delà de 8 GB, l\'impact sur fluidité est minimal ; 12 GB utile pour multitâche lourd.',
      anim: '↔️'
    },
    'UFS': {
      def: 'Universal Flash Storage — norme de stockage rapide (vs eMMC lent).',
      impact: 'UFS 4.0 = écritures rapides et latence basse. eMMC = bottleneck visible au quotidien.',
      anim: '⚙️'
    },
    'OIS': { def: 'Stabilisation optique : la lentille bouge pour compenser les tremblements de la main.', impact: 'Photos plus nettes le soir et vidéos plus stables.', anim: '🎯' },
    'Wh': { def: 'Wattheure : l’énergie réellement stockée dans une batterie (tension × capacité).', impact: 'C’est l’unité qui compte en avion (limite courante : 100 Wh) et pour comparer deux batteries.', anim: '🔋' },
    'mégapixels': { def: 'Un mégapixel = un million de pixels sur le capteur photo.', impact: 'Plus de pixels sur un même capteur = des pixels plus petits, qui captent moins de lumière.', anim: '📷' },
    'Mpx': { def: 'Mégapixels : le nombre de millions de pixels du capteur photo.', impact: 'Plus de pixels sur un même capteur = des pixels plus petits, qui captent moins de lumière.', anim: '📷' },
    'Nits': {
      def: 'Unité de luminance (intensité lumineuse visible).',
      impact: '300 nits = lisible en intérieur; 800+ = lisible au soleil; 2000+ = confort HDR.',
      anim: '☀️'
    }
  };

  function wrapTerms() {
    var main = document.querySelector('main') || document.body;
    var terms = Object.keys(glossaire);

    // Parcourir le DOM et envelopper les termes trouvés
    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.textContent;
        var regex = new RegExp('\\b(' + terms.join('|') + ')\\b', 'gi');
        if (regex.test(text)) {
          var span = document.createElement('span');
          span.innerHTML = text.replace(regex, function (match) {
            return '<span class="hx-glossaire-term" tabindex="0" data-term="' + match + '">' + match + '</span>';
          });
          node.parentNode.replaceChild(span, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', 'STYLE', 'BUTTON', 'A', 'SUMMARY', 'H1', 'INPUT', 'TEXTAREA'].includes(node.tagName) && !(node.classList && (node.classList.contains('hx-marquee') || node.classList.contains('audit-board') || node.classList.contains('hx-glossaire-term')))) {
        Array.from(node.childNodes).forEach(walk);
      }
    }

    walk(main);
  }

  function initTooltips() {
    var container = document.createElement('div');
    container.className = 'hx-glossaire-tooltip';
    container.setAttribute('role', 'tooltip');
    document.body.appendChild(container);
    var map = {}; Object.keys(glossaire).forEach(function (k) { map[k.toLowerCase()] = k; });
    var current = null;
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    function hide() { container.classList.remove('is-visible'); current = null; }
    function show(term) {
      var key = map[term.textContent.trim().toLowerCase()], data = key && glossaire[key];
      if (!data) return;
      container.innerHTML = '<b>' + data.anim + ' ' + key + '</b><p>' + data.def + '</p><p class="hx-glossaire-impact"><strong>À retenir :</strong> ' + data.impact + '</p>';
      container.style.transform = 'none'; container.style.display = 'block';
      var w = container.offsetWidth, h = container.offsetHeight, r = term.getBoundingClientRect();
      var left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
      var top = r.top - h - 10; if (top < 8) top = r.bottom + 10;
      container.style.left = left + 'px'; container.style.top = top + 'px';
      container.classList.add('is-visible'); current = term;
    }
    document.addEventListener('mouseover', function (e) {
      if (!canHover) return;
      var t = e.target.closest && e.target.closest('.hx-glossaire-term');
      if (t) show(t); else if (current) hide();
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.hx-glossaire-term');
      if (t && !canHover) { current === t ? hide() : show(t); } else if (!t) hide();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hide();
      if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('hx-glossaire-term')) { current === e.target ? hide() : show(e.target); }
    });
    window.addEventListener('scroll', hide, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(function () { wrapTerms(); initTooltips(); });
    });
  } else {
    requestAnimationFrame(function () { wrapTerms(); initTooltips(); });
  }
})();
