(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  var inner = header && header.querySelector(".header-inner");
  if (!header || !inner) return;

  var toggle = document.getElementById("category-menu-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.className = "brand-menu-toggle";
    toggle.id = "category-menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "category-menu");
    toggle.setAttribute("aria-label", "Ouvrir les catégories");
    toggle.innerHTML = '<span aria-hidden="true"><i></i><i></i><i></i></span><span class="brand-menu-label">Catégories</span>';
    var tools = inner.querySelector(".header-tools");
    if (tools) tools.insertAdjacentElement("afterend", toggle); else inner.appendChild(toggle);
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); }

  /* Le contenu vient du registre des catégories (source unique) : le menu est identique sur toutes les pages. */
  function items() {
    var C = window.GuideCategories;
    if (!C) return '<a class="category-menu-item is-live" href="smartphones.html"><span class="cm-txt"><strong>Smartphones</strong><small>Guide disponible</small></span></a>';
    return C.list.map(function (c) {
      var inside = '<span class="cm-ico" aria-hidden="true">' + C.icon(c) + '</span>' +
        '<span class="cm-txt"><strong>' + esc(c.label) + '</strong><small>' + (c.live ? "Guide disponible" : "Bientôt disponible") + '</small></span>' +
        (c.live ? '<i class="cm-go" aria-hidden="true">→</i>' : "");
      return c.live
        ? '<a class="category-menu-item is-live" data-tone="' + c.tone + '" href="' + c.href + '">' + inside + '</a>'
        : '<div class="category-menu-item is-soon" data-tone="' + c.tone + '" aria-disabled="true">' + inside + '</div>';
    }).join("");
  }

  var menu = document.getElementById("category-menu");
  if (!menu) {
    menu = document.createElement("section");
    menu.className = "category-menu";
    menu.id = "category-menu";
    menu.hidden = true;
    document.body.appendChild(menu);
  }
  menu.setAttribute("aria-label", "Catégories de produits");
  menu.innerHTML =
    '<button class="category-menu-backdrop" type="button" aria-label="Fermer le menu"></button>' +
    '<div class="category-menu-panel" role="dialog" aria-modal="true" aria-labelledby="category-menu-title">' +
      '<div class="category-menu-head"><h2 id="category-menu-title">Catégories</h2>' +
      '<button class="drawer-close" id="category-menu-close" type="button" aria-label="Fermer">×</button></div>' +
      '<nav class="category-menu-list" aria-label="Toutes les catégories">' + items() + '</nav>' +
      '<a class="category-menu-home" href="index.html">← Retour à l’accueil</a>' +
    '</div>';

  var close = menu.querySelector("#category-menu-close");
  var backdrop = menu.querySelector(".category-menu-backdrop");
  var previousFocus = null;
  function openMenu() { previousFocus = document.activeElement; menu.hidden = false; toggle.setAttribute("aria-expanded", "true"); document.body.classList.add("menu-open"); if (close) close.focus(); }
  function closeMenu() { menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open"); if (previousFocus && previousFocus.focus) previousFocus.focus(); }
  toggle.addEventListener("click", function (e) { e.preventDefault(); menu.hidden ? openMenu() : closeMenu(); });
  if (close) close.addEventListener("click", closeMenu);
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) closeMenu(); });
})();
