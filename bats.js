/* BATS v100 — petits comportements : bouton « haut de page » discret (visible après défilement). */
(function () {
  "use strict";
  var ticking = false;
  function update() {
    ticking = false;
    var fab = document.querySelector(".scroll-fab");
    if (!fab) return;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    fab.classList.toggle("is-visible", y > 480);
  }
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", update);
  document.addEventListener("DOMContentLoaded", update);
})();
