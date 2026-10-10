/* Dark Deco : fond animé uniquement en mode sombre ; le choix est géré par site-tools.js. */
(function () {
  "use strict";
  function mount() {
    if (document.querySelector(".dd-bg")) return;
    var d = document.createElement("div");
    d.className = "dd-bg"; d.setAttribute("aria-hidden", "true");
    d.innerHTML = "<i></i><i></i><i></i><i></i>";
    document.body.insertBefore(d, document.body.firstChild);
    ["dd-grain", "dd-vig"].forEach(function (c) {
      var e = document.createElement("div"); e.className = c; e.setAttribute("aria-hidden", "true"); document.body.appendChild(e);
    });
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
