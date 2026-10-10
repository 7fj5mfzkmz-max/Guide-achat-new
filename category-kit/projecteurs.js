(function (root) {
  "use strict";
  /* COQUILLE « Projecteurs » : profil prêt à être complété, PAS encore validé.
     status "shell" = la catégorie existe dans le registre mais n'est pas ouverte au public.
     Pour l'activer, suivre BLUEPRINT.md (corpus de titres réels, règles de variantes, catalogue, puis status "active"). */
  var profile = {
    id: "projecteurs",
    status: "shell",
    label: "Projecteurs",
    itemNoun: "projecteur",
    makers: {
      epson: { names: ["epson"], families: ["eh", "eb"] },
      benq: { names: ["benq"], families: [] },
      xgimi: { names: ["xgimi"], families: ["horizon", "halo", "elfin"] },
      optoma: { names: ["optoma"], families: [] },
      anker: { names: ["anker", "nebula"], families: ["capsule"] },
      lg: { names: ["lg"], families: ["cinebeam"] },
      viewsonic: { names: ["viewsonic"], families: [] },
      samsung: { names: ["samsung"], families: ["freestyle"] },
      yaber: { names: ["yaber"], families: [] },
      wanbo: { names: ["wanbo"], families: [] }
    },
    /* À VALIDER sur des titres réels : mots qui font d'un produit un AUTRE modèle quand ils suivent son nom. */
    variantWords: ["pro", "max", "plus", "ultra", "mini", "lite", "se", "air", "4k", "laser"],
    noiseWords: ("noir noire blanc blanche bleu bleue vert verte rouge rose gris grise argent or violet jaune orange black white blue green red pink gray grey silver gold neuf reconditionne occasion garantie ans de du des le la les un une et avec pour en version francaise edition projecteur videoprojecteur video portable led full hd").split(" "),
    softPatterns: [],
    aliasMerges: [],
    bareNumberNoise: null,
    comboPattern: null,
    unitWords: "go|gb|to|tb|mo|mb|mah|hz|mp|w|wh|kg|g|mm|cm|po|pouces?|inch|lumens?|ansi|lm|db|h",
    productWord: /\b(?:projecteur|vid[ée]oprojecteur|projector)\b/i,
    specLabels: {"lumens": "Luminosité", "resolution": "Résolution", "contraste": "Contraste", "distance": "Distance de projection", "bruit": "Niveau sonore"},
    coreSpecs: ["lumens", "resolution", "contraste"],
    textSpecRules: [
      { key: "lumens", patterns: [/\b(\d[\d\s.]{2,6})\s*(?:ANSI\s*)?(?:lumens?|lm)\b/i] },
      { key: "resolution", patterns: [/\b(?:4K|UHD|Full\s?HD|1080p|720p|WXGA|1920\s?[x×]\s?1080|3840\s?[x×]\s?2160)\b/i] },
      { key: "contraste", patterns: [/\b(\d[\d\s.]{2,8})\s?:\s?1\b/i] }
    ],
    referenceRules: [],
    ramFallbackName: null,
    ramMaxGb: 0
  };
  if (typeof module !== "undefined" && module.exports) module.exports = profile;
  else if (root.GuideCategoryKit) root.GuideCategoryKit.register(profile);
})(typeof window !== "undefined" ? window : globalThis);
