/**
 * Temps de lecture calculé à partir du contenu réellement présent dans la page.
 * Le nombre affiché se recalcule après les contenus injectés par JavaScript.
 */
(function () {
  "use strict";
  var WORDS_PER_MIN = 200;
  var SECONDS_PER_VISUAL = 3;

  function countWords(el) {
    if (!el) return 0;
    var clone = el.cloneNode(true);
    clone.querySelectorAll('script, style, [role="presentation"], [data-reading-ignore], .hx-reading-time, .hx-page-reading-time').forEach(function (s) { s.remove(); });
    var text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').length : 0;
  }

  function getReadingTime(section) {
    return Math.max(1, Math.ceil(countWords(section) / WORDS_PER_MIN));
  }

  function addReadingTimeBadges() {
    document.querySelectorAll('.hx-page .section, .hx-page .lexique-section, .hx-page .falc-chapter, .hx-page details.profile-toggle').forEach(function (sec) {
      var minutes = getReadingTime(sec);
      var existing = sec.__rtBadge;
      if (existing && existing.isConnected) { existing.setAttribute('data-reading-time', minutes); existing.textContent = minutes + ' min'; return; }
      var badge = document.createElement('span');
      badge.setAttribute('data-reading-time', minutes);
      badge.className = 'hx-reading-time';
      badge.textContent = minutes + ' min';
      badge.setAttribute('aria-label', 'Temps de lecture estimé : ' + minutes + ' minutes');
      sec.__rtBadge = badge;
      var heading = sec.querySelector(':scope > h2, :scope > h3, :scope > .section-heading, :scope > summary');
      if (heading) heading.appendChild(badge); else sec.insertBefore(badge, sec.firstChild);
    });
  }

  function getTotalReadingTime() {
    var main = document.querySelector('main');
    if (!main) return 0;
    var words = countWords(main);
    var visuals = main.querySelectorAll('svg.cv').length;
    var seconds = (words / WORDS_PER_MIN) * 60 + visuals * SECONDS_PER_VISUAL;
    return Math.max(1, Math.round(seconds / 60));
  }

  function updatePageReadingTime() {
    var hero = document.querySelector('.hx-hero--page .hx-lead');
    if (!hero) return;
    var badge = document.querySelector('.hx-page-reading-time');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'hx-page-reading-time';
      hero.parentNode.insertBefore(badge, hero.nextSibling);
    }
    badge.innerHTML = '<strong>⏱</strong> Parcours complet : ≈ ' + getTotalReadingTime() + ' min';
  }

  function refresh() {
    if (!document.querySelector('.hx-page')) return;
    updatePageReadingTime();
    addReadingTimeBadges();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(refresh); });
  else requestAnimationFrame(refresh);
  window.addEventListener('load', refresh);
  document.addEventListener('cv:ready', refresh);
  window.addEventListener('debunk:ready', refresh);
  window.ReadingTimeCalculator = { getReadingTime: getReadingTime, getTotalReadingTime: getTotalReadingTime, countWords: countWords };
})();
