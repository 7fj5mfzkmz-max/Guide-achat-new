(function (root) {
  "use strict";
  /* Registre des catégories. Une catégorie = un « profil » (données, pas de logique) :
     marques, mots de variante, mots parasites, règles de lecture des caractéristiques, libellés.
     Le moteur (identity.js, icecat.js, resolve.js…) ne contient plus rien de spécifique à une catégorie. */
  var profiles = {};
  var kit = {
    DEFAULT: "smartphones",
    register: function (p) { profiles[p.id] = p; return p; },
    get: function (id) { return profiles[id || kit.DEFAULT] || null; },
    ids: function () { return Object.keys(profiles); },
    active: function () { return Object.keys(profiles).filter(function (k) { return profiles[k].status === "active"; }); }
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = kit;
    ["smartphones", "projecteurs", "batteries-externes", "pc-portables", "ecouteurs"].forEach(function (name) { kit.register(require("./" + name + ".js")); });
  } else root.GuideCategoryKit = kit;
})(typeof window !== "undefined" ? window : globalThis);
