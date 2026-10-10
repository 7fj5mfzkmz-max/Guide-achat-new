/* Fond « lampe à lave » : blobs flous qui dérivent lentement. Purement décoratif. */
(function () {
  "use strict";
  if (document.querySelector(".lava")) return;
  var d = document.createElement("div");
  d.className = "lava"; d.setAttribute("aria-hidden", "true");
  d.innerHTML = "<i></i><i></i><i></i><i></i>";
  document.body.insertBefore(d, document.body.firstChild);
})();
