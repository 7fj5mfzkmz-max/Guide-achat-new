(function (root) {
  "use strict";
  /* COQUILLE « Batteries externes » : profil prêt à être complété, PAS encore validé.
     status "shell" = la catégorie existe dans le registre mais n'est pas ouverte au public.
     Pour l'activer, suivre BLUEPRINT.md (corpus de titres réels, règles de variantes, catalogue, puis status "active"). */
  var profile = {
    id: "batteries-externes",
    status: "shell",
    label: "Batteries externes",
    itemNoun: "batterie externe",
    makers: {
      anker: { names: ["anker"], families: ["powercore", "nano", "prime"] },
      xiaomi: { names: ["xiaomi"], families: [] },
      samsung: { names: ["samsung"], families: [] },
      belkin: { names: ["belkin"], families: [] },
      baseus: { names: ["baseus"], families: [] },
      ugreen: { names: ["ugreen"], families: [] },
      aukey: { names: ["aukey"], families: [] },
      romoss: { names: ["romoss"], families: [] },
      cuktech: { names: ["cuktech"], families: [] },
      INIU: { names: ["iniu"], families: [] }
    },
    /* À VALIDER sur des titres réels : mots qui font d'un produit un AUTRE modèle quand ils suivent son nom. */
    variantWords: ["pro", "max", "plus", "ultra", "mini", "lite", "slim"],
    noiseWords: ("noir noire blanc blanche bleu bleue vert verte rouge rose gris grise argent or violet jaune orange black white blue green red pink gray grey silver gold neuf reconditionne occasion garantie ans de du des le la les un une et avec pour en version francaise edition batterie externe powerbank power bank chargeur portable usb pd").split(" "),
    softPatterns: [],
    aliasMerges: [],
    bareNumberNoise: null,
    comboPattern: null,
    unitWords: "go|gb|to|tb|mo|mb|mah|hz|mp|w|wh|kg|g|mm|cm|po|pouces?|inch|lumens?|ansi|lm|db|h",
    productWord: /\b(?:batterie externe|power ?bank|chargeur portable)\b/i,
    specLabels: {"capacite": "Capacité", "puissance": "Puissance de sortie", "ports": "Ports", "poids": "Poids"},
    coreSpecs: ["capacite", "puissance", "ports"],
    textSpecRules: [
      { key: "capacite", patterns: [/\b(\d[\d\s.]{2,6})\s*mAh\b/i] },
      { key: "puissance", patterns: [/\b(\d{2,3})\s*W\b/i] }
    ],
    referenceRules: [],
    ramFallbackName: null,
    ramMaxGb: 0
  };
  if (typeof module !== "undefined" && module.exports) module.exports = profile;
  else if (root.GuideCategoryKit) root.GuideCategoryKit.register(profile);
})(typeof window !== "undefined" ? window : globalThis);
