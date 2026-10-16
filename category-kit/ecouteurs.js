(function (root) {
  "use strict";
  /* COQUILLE « Écouteurs » : profil prêt à être complété, PAS encore validé.
     status "shell" = la catégorie existe dans le registre mais n'est pas ouverte au public.
     Pour l'activer, suivre BLUEPRINT.md (corpus de titres réels, règles de variantes, catalogue, puis status "active"). */
  var profile = {
    id: "ecouteurs",
    status: "shell",
    label: "Écouteurs",
    itemNoun: "écouteurs",
    makers: {
      apple: { names: ["apple"], families: ["airpods"] },
      sony: { names: ["sony"], families: ["wf", "wh"] },
      samsung: { names: ["samsung"], families: ["galaxy", "buds"] },
      bose: { names: ["bose"], families: ["quietcomfort"] },
      jabra: { names: ["jabra"], families: ["elite"] },
      google: { names: ["google"], families: ["pixel"] },
      nothing: { names: ["nothing"], families: ["ear"] },
      anker: { names: ["anker", "soundcore"], families: ["liberty", "life"] },
      jbl: { names: ["jbl"], families: [] },
      sennheiser: { names: ["sennheiser"], families: ["momentum"] },
      beats: { names: ["beats"], families: ["studio", "fit"] }
    },
    /* À VALIDER sur des titres réels : mots qui font d'un produit un AUTRE modèle quand ils suivent son nom. */
    variantWords: ["pro", "max", "plus", "ultra", "mini", "lite", "se"],
    noiseWords: ("noir noire blanc blanche bleu bleue vert verte rouge rose gris grise argent or violet jaune orange black white blue green red pink gray grey silver gold neuf reconditionne occasion garantie ans de du des le la les un une et avec pour en version francaise edition ecouteurs ecouteur casque sans fil bluetooth true wireless intra-auriculaires reduction bruit anc").split(" "),
    softPatterns: [],
    aliasMerges: [],
    bareNumberNoise: null,
    comboPattern: null,
    unitWords: "go|gb|to|tb|mo|mb|mah|hz|mp|w|wh|kg|g|mm|cm|po|pouces?|inch|lumens?|ansi|lm|db|h",
    productWord: /\b(?:[ée]couteurs?|casque|earbuds?|airpods|headphones?)\b/i,
    specLabels: {"autonomie": "Autonomie", "anc": "Réduction de bruit", "codec": "Codecs", "ip": "Étanchéité", "bluetooth": "Bluetooth"},
    coreSpecs: ["autonomie", "anc", "bluetooth"],
    textSpecRules: [
      { key: "autonomie", patterns: [/\b(\d{1,2})\s*(?:h|heures?|hours?)\b/i] },
      { key: "bluetooth", patterns: [/\bBluetooth\s*(\d(?:\.\d)?)/i] },
      { key: "ip", patterns: [/\bIP[XP]?\d{1,2}\b/i] }
    ],
    referenceRules: [],
    ramFallbackName: null,
    ramMaxGb: 0
  };
  if (typeof module !== "undefined" && module.exports) module.exports = profile;
  else if (root.GuideCategoryKit) root.GuideCategoryKit.register(profile);
})(typeof window !== "undefined" ? window : globalThis);
