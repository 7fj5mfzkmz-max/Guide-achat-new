(function (root) {
  "use strict";
  /* COQUILLE « PC portables » : profil prêt à être complété, PAS encore validé.
     status "shell" = la catégorie existe dans le registre mais n'est pas ouverte au public.
     Pour l'activer, suivre BLUEPRINT.md (corpus de titres réels, règles de variantes, catalogue, puis status "active"). */
  var profile = {
    id: "pc-portables",
    status: "shell",
    label: "PC portables",
    itemNoun: "PC portable",
    makers: {
      apple: { names: ["apple"], families: ["macbook"] },
      asus: { names: ["asus"], families: ["zenbook", "vivobook", "rog", "tuf"] },
      lenovo: { names: ["lenovo"], families: ["thinkpad", "ideapad", "legion", "yoga"] },
      hp: { names: ["hp"], families: ["pavilion", "omen", "envy", "spectre"] },
      dell: { names: ["dell"], families: ["xps", "inspiron", "latitude"] },
      acer: { names: ["acer"], families: ["aspire", "swift", "nitro", "predator"] },
      msi: { names: ["msi"], families: ["katana", "stealth", "cyborg"] },
      microsoft: { names: ["microsoft"], families: ["surface"] },
      samsung: { names: ["samsung"], families: ["galaxy"] }
    },
    /* À VALIDER sur des titres réels : mots qui font d'un produit un AUTRE modèle quand ils suivent son nom. */
    variantWords: ["pro", "max", "plus", "ultra", "air", "slim", "oled", "gaming"],
    noiseWords: ("noir noire blanc blanche bleu bleue vert verte rouge rose gris grise argent or violet jaune orange black white blue green red pink gray grey silver gold neuf reconditionne occasion garantie ans de du des le la les un une et avec pour en version francaise edition pc portable ordinateur laptop notebook windows 11 azerty clavier").split(" "),
    softPatterns: [],
    aliasMerges: [],
    bareNumberNoise: null,
    comboPattern: null,
    unitWords: "go|gb|to|tb|mo|mb|mah|hz|mp|w|wh|kg|g|mm|cm|po|pouces?|inch|lumens?|ansi|lm|db|h",
    productWord: /\b(?:pc portable|ordinateur portable|laptop|notebook|macbook)\b/i,
    specLabels: {"processeur": "Processeur", "ram": "Mémoire", "stockage": "Stockage", "ecran": "Écran", "gpu": "Carte graphique", "poids": "Poids", "autonomie": "Autonomie"},
    coreSpecs: ["processeur", "ram", "stockage", "ecran"],
    textSpecRules: [
      { key: "processeur", patterns: [/\b(?:Intel\s+Core\s+(?:Ultra\s+)?[im]?\d[\w-]*|AMD\s+Ryzen\s+\d[\w -]{0,12}|Apple\s+M\d(?:\s+(?:Pro|Max|Ultra))?|Snapdragon\s+X[\w ]{0,12})/i] },
      { key: "ram", patterns: [/\b(\d{1,3})\s*(?:Go|GB)\s*(?:de\s+)?(?:RAM|DDR\d|LPDDR\d|m[ée]moire)/i] },
      { key: "stockage", patterns: [/\b(\d{1,4})\s*(?:Go|GB|To|TB)\s*(?:SSD|NVMe|eMMC)/i, /\bSSD\s*(?:de\s*)?(\d{1,4})\s*(?:Go|GB|To|TB)/i] },
      { key: "ecran", patterns: [/\b(\d{2}(?:[.,]\d)?)\s*(?:pouces|po|"|″|inch)/i] }
    ],
    referenceRules: [],
    ramFallbackName: null,
    ramMaxGb: 0
  };
  if (typeof module !== "undefined" && module.exports) module.exports = profile;
  else if (root.GuideCategoryKit) root.GuideCategoryKit.register(profile);
})(typeof window !== "undefined" ? window : globalThis);
