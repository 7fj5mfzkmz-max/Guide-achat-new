/* Illustrations de concepts (SVG inline, sans dépendance). Remplacent du texte par un schéma animé. */
(function () {
  'use strict';
  var S = function (body, cls) {
    return '<svg class="cv ' + (cls || '') + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + body + '</svg>';
  };
  var ICONS = {
    /* Méthode en 4 étapes */
    usage: S('<rect x="22" y="6" width="22" height="42" rx="5"/><rect class="g cv-pop" x="26" y="12" width="6" height="6" rx="2"/><rect class="f cv-pop" x="34" y="12" width="6" height="6" rx="2"/><rect class="h cv-pop" x="26" y="22" width="6" height="6" rx="2"/><circle class="a" cx="11" cy="44" r="5"/><path class="a" d="M3 58c0-6 4-9 8-9s8 3 8 9"/>'),
    fiche: S('<rect x="10" y="6" width="38" height="50" rx="4"/><path d="M17 16h24M17 38h24M17 46h16"/><rect class="g cv-scan" x="14" y="22" width="30" height="10" rx="2" opacity=".85"/>'),
    releve: S('<path class="a cv-draw" d="M8 16l5 5 9-10"/><path class="a cv-draw" d="M8 32l5 5 9-10"/><path class="a cv-draw" d="M8 48l5 5 9-10"/><path d="M30 17h26M30 33h26M30 49h18"/>'),
    interprete: S('<path d="M32 10v44M20 54h24"/><g class="cv-tilt"><path class="b" d="M10 22h44"/><path d="M10 22l-5 14h14zM54 22l-5 14h14z"/></g>'),
    /* Cinq familles */
    ecran: S('<rect x="19" y="5" width="26" height="54" rx="6"/><g style="clip-path:inset(0)"><g class="cv-scroll"><rect class="f" x="23" y="12" width="18" height="8" rx="2"/><rect class="g" x="23" y="25" width="18" height="8" rx="2"/><rect class="h" x="23" y="38" width="18" height="8" rx="2"/><rect class="f" x="23" y="51" width="18" height="8" rx="2"/></g></g>'),
    batterie: S('<rect x="6" y="20" width="46" height="24" rx="5"/><path d="M52 28h5v8h-5"/><rect class="f cv-fill" x="10" y="24" width="38" height="16" rx="2"/><path class="c" d="M31 24l-6 9h7l-4 8"/>'),
    performance: S('<rect x="18" y="18" width="28" height="28" rx="4"/><rect class="g cv-pulse" x="26" y="26" width="12" height="12" rx="2"/><path d="M24 10v8M32 10v8M40 10v8M24 46v8M32 46v8M40 46v8M10 24h8M10 32h8M10 40h8M46 24h8M46 32h8M46 40h8"/>'),
    photo: S('<rect x="6" y="16" width="52" height="36" rx="6"/><path d="M22 16l3-6h14l3 6"/><circle class="a" cx="32" cy="34" r="12"/><circle class="h cv-pulse" cx="32" cy="34" r="5"/>'),
    duree: S('<circle cx="32" cy="32" r="18" opacity=".25"/><circle class="a cv-ring" cx="32" cy="32" r="18" transform="rotate(-90 32 32)"/><path class="a" d="M24 33l6 6 11-13"/>'),
    /* Profils */
    etudiant: S('<path d="M6 16c8-3 16-2 26 4v34c-10-6-18-7-26-4z"/><path class="a" d="M58 16c-8-3-16-2-26 4v34c10-6 18-7 26-4z"/><path d="M14 26c4-1 8 0 12 2M14 35c4-1 8 0 12 2"/>'),
    professionnel: S('<rect x="6" y="20" width="52" height="34" rx="5"/><path d="M22 20v-6a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v6"/><path class="a" d="M6 34h52"/><rect class="g" x="28" y="31" width="8" height="7" rx="2"/>'),
    gamer: S('<path d="M16 22h32c6 0 10 8 12 20 1 6-5 9-9 4l-6-8H19l-6 8c-4 5-10 2-9-4 2-12 6-20 12-20z"/><path class="a" d="M20 31v8M16 35h8"/><circle class="h" cx="42" cy="32" r="2.6"/><circle class="g" cx="48" cy="37" r="2.6"/>'),
    photographe: S('<rect x="6" y="18" width="52" height="34" rx="6"/><path d="M22 18l3-7h14l3 7"/><circle class="b" cx="32" cy="35" r="11"/><circle class="h cv-pulse" cx="32" cy="35" r="4"/><circle class="g" cx="50" cy="26" r="2.4"/>')
  };
  var FAMILIES = { 'Écran': 'ecran', 'Batterie': 'batterie', 'Performance': 'performance', 'Photo': 'photo', 'Durée de vie': 'duree' };
  var STEPS = ['usage', 'fiche', 'releve', 'interprete'];
  var PROFILES = ['etudiant', 'professionnel', 'gamer', 'photographe'];

  function init() {
    var count = 0;
    document.querySelectorAll('.guide-journey .journey-step').forEach(function (el) {
      var n = parseInt((el.querySelector('.journey-number') || {}).textContent, 10);
      if (!n || !STEPS[n - 1] || el.querySelector('.cv')) return;
      el.insertAdjacentHTML('afterbegin', ICONS[STEPS[n - 1]]); count++;
    });
    document.querySelectorAll('.reading-list > div').forEach(function (el) {
      var key = FAMILIES[(el.querySelector('strong') || {}).textContent];
      if (!key || el.querySelector('.cv')) return;
      el.insertAdjacentHTML('afterbegin', ICONS[key]); count++;
    });
    PROFILES.forEach(function (id) {
      var box = document.querySelector('#' + id + ' .profile-icon');
      if (!box || box.querySelector('.cv')) return;
      box.innerHTML = ICONS[id]; count++;
    });
    document.documentElement.setAttribute('data-visuals', count);
    document.dispatchEvent(new CustomEvent('cv:ready', { detail: count }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
