(function (root) {
  "use strict";
  /* Profil « smartphones » — la référence (blueprint). Tout ce qui est propre aux téléphones est ICI. */
  var profile = {
    id: "smartphones",
    status: "active",
    label: "Smartphones",
    itemNoun: "smartphone",

    /* Fabricants (leurs mots sont ignorés pour comparer le modèle) et familles (mots qui font partie du nom du modèle). */
    makers: {
      apple: { names: ["apple"], families: ["iphone"] },
      samsung: { names: ["samsung"], families: ["galaxy"] },
      google: { names: ["google"], families: ["pixel"] },
      xiaomi: { names: ["xiaomi"], families: ["redmi", "poco"] },
      oneplus: { names: ["oneplus"], families: [] },
      oppo: { names: ["oppo"], families: [] },
      realme: { names: ["realme"], families: [] },
      motorola: { names: ["motorola"], families: ["moto"] },
      nokia: { names: ["nokia"], families: [] },
      sony: { names: ["sony"], families: ["xperia"] },
      honor: { names: ["honor"], families: [] },
      huawei: { names: ["huawei"], families: [] },
      nothing: { names: ["nothing"], families: [] },
      fairphone: { names: ["fairphone"], families: [] },
      asus: { names: ["asus"], families: ["rog", "zenfone"] },
      zte: { names: ["zte"], families: [] },
      blackview: { names: ["blackview"], families: [] },
      vivo: { names: ["vivo"], families: ["iqoo"] },
      tecno: { names: ["tecno"], families: ["camon", "pova"] },
      infinix: { names: ["infinix"], families: ["pova"] },
      htc: { names: ["htc"], families: [] }
    },

    /* Mots qui, juste après le nom du modèle, en font un AUTRE modèle (iPhone 17 Pro ≠ iPhone 17 Pro Max). */
    variantWords: ["pro", "max", "plus", "ultra", "mini", "fe", "lite", "se", "xl", "fold", "flip", "edge", "neo", "gt", "turbo", "power", "air", "ace", "a", "gaming"],

    /* Mots sans valeur d'identification (couleurs, jargon marchand). Ils sont retirés avant toute comparaison. */
    noiseWords: ("noir noire blanc blanche bleu bleue vert verte rouge rose gris grise argent or dore violet violette jaune orange titane titanium naturel graphite " +
      "midnight minuit starlight lumiere stellaire creme cream black white blue green red pink gray grey silver gold purple yellow lavande lavender menthe mint corail coral " +
      "obsidian obsidienne porcelaine sable desert cosmique ocean " +
      "smartphone smartphones telephone portable mobile debloque debloquee dual sim nfc android ios neuf reconditionne occasion grade " +
      "de du des le la les un une et avec pour en version francaise garantie ans ram rom edition").split(" "),

    /* Connectivité : deux libellés qui disent chacun 4G / 5G sans point commun désignent deux modèles. */
    softPatterns: [{ re: /\b3\s?g\b/g, token: "cthreeg" }, { re: /\b4\s?g\b/g, token: "cfourg" }, { re: /\b5\s?g\b/g, token: "cfiveg" }],
    aliasMerges: [[/\bone\s+plus\b/g, "oneplus"]],
    /* Capacités de stockage écrites sans unité : jamais un élément de modèle. */
    bareNumberNoise: /^(?:32|64|128|256|512|1024)$/,
    /* Combinaisons « RAM+stockage » (8+256 Go, 12GB+256GB, 8/256) : retirées avant de lire un éventuel « + » de variante. */
    comboPattern: /\b\d{1,2}\s?(?:go|gb)?\s*[+\/]\s*\d{2,4}\s?(?:go|gb|to|tb)?\b/g,
    unitWords: "go|gb|to|tb|mo|mb|mah|hz|mp|mpx|w|po|pouces?|inch|kg|mm|cm",

    /* Mots qui signalent qu'un titre de résultat web parle d'un objet de cette catégorie. */
    productWord: /\b(?:iphone|galaxy|pixel|xiaomi|redmi|poco|oneplus|oppo|realme|honor|motorola|moto|nokia|sony|xperia|huawei|nothing|fairphone|asus|zenfone|smartphone|t[ée]l[ée]phone)\b/i,

    /* Interface */
    specLabels: { ecran: "Écran", refresh: "Fréquence d’écran", processeur: "Processeur", ram: "Mémoire", stockage: "Stockage", batterie: "Batterie", charge: "Charge", photo: "Photo", etancheite: "Étanchéité", os: "Système" },
    coreSpecs: ["ecran", "processeur", "ram", "batterie", "charge", "refresh"],

    /* Lecture de caractéristiques dans le texte d'une page (le premier motif qui correspond gagne ; la valeur est le texte trouvé). */
    textSpecRules: [
      { key: "ecran", patterns: [/(?:écran|display|screen)[^\d]{0,80}(\d+(?:[.,]\d+)?)\s*(?:pouces|po|inch|inches|"|″)/i, /(\d+(?:[.,]\d+)?)\s*(?:pouces|po|inch|inches|"|″)\b/i] },
      { key: "refresh", patterns: [/(?:écran|display|refresh|fréquence|taux)[^\d]{0,50}(\d{2,3})\s*Hz/i, /\b(\d{2,3})\s*Hz\b/i] },
      { key: "batterie", patterns: [/(?:batterie|battery|capacité)[^\d]{0,50}(\d[\d\s.]*)\s*mAh/i, /\b(\d[\d\s.]*)\s*mAh\b/i] },
      { key: "ram", patterns: [/(?:RAM|mémoire vive|mémoire)[^\d]{0,30}(\d+(?:[.,]\d+)?)\s*(?:Go|GB)\b/i, /\b(\d+(?:[.,]\d+)?)\s*(?:Go|GB)\s*RAM\b/i] },
      { key: "stockage", patterns: [/(?:stockage|mémoire interne|storage)[^\d]{0,40}(\d+(?:[.,]\d+)?)\s*(?:Go|GB|To|TB)\b/i, /\b(\d+(?:[.,]\d+)?)\s*(?:Go|GB|To|TB)\s*(?:de stockage|stockage|mémoire interne)\b/i] },
      { key: "charge", patterns: [/(?:charge|recharge|charging)[^\d]{0,50}(\d{2,3})\s*W\b/i, /\b(\d{2,3})\s*W\s*(?:charge|recharge|charging)\b/i] },
      { key: "photo", patterns: [/(?:appareil photo|caméra|camera|photo)[^\d]{0,60}(\d{2,3})\s*MP/i, /\b(\d{2,3})\s*MP\b/i] },
      { key: "processeur", patterns: [/\b(?:Snapdragon\s+(?:\d+\s+Gen\s+\d+|\d+s?\s+Gen\s+\d+|\d+[A-Za-z]?)|Dimensity\s+\d{3,4}|Exynos\s+\d{3,4}|Tensor\s+G?\d{1,2}|Helio\s+[A-Z]\d{2,3}|Kirin\s+\d{3,4}|Unisoc\s+[A-Z]\d{3,4}|A\d{2}(?:\s+Bionic)?|Apple\s+M\d(?:\s+(?:Pro|Max))?)\b/i] },
      { key: "os", patterns: [/\b(?:Android\s+[\d.]+|iOS\s+[\d.]+|HarmonyOS\s+[\d.]+)\b/i] }
    ],

    /* Lecture d'une fiche de référentiel produit (Icecat) : nom de caractéristique → clé, avec contrôle d'unité. */
    referenceRules: [
      { key: "batterie", name: /battery capacity|capacit[eé] de (?:la )?batterie/i, accept: { re: /\d\s*mAh/i } },
      { key: "refresh", name: /refresh rate|taux de rafra[iî]chissement|fr[eé]quence de rafra[iî]chissement/i, accept: { re: /\d\s*Hz/i } },
      { key: "charge", name: /charging (?:power|speed)|puissance de charge|fast charging power/i, accept: { re: /\d\s*W\b/i } },
      { key: "ecran", name: /display diagonal|diagonale de l.[eé]cran|screen diagonal/i, accept: { re: /\d/ } },
      { key: "processeur", name: /processor model|mod[eè]le du processeur|processor family|famille de processeur/i, accept: { minLen: 3 } },
      { key: "ram", name: /\bRAM\b|m[eé]moire vive/i, accept: { re: /\d\s*(?:GB|Go)\b/i, maxGb: 24 } },
      { key: "stockage", name: /storage capacity|capacit[eé] de stockage|internal storage|stockage interne/i, accept: { re: /\d\s*(?:GB|Go|TB|To)\b/i } },
      { key: "photo", name: /rear camera.*resolution|r[eé]solution.*arri[eè]re|rear camera \(megapixels?\)|rear camera megapixel/i, accept: { re: /\d\s*(?:MP|Mpx|megapixels?)/i } },
      { key: "etancheite", name: /ingress protection|IP code|indice de protection|degr[eé] de protection/i, accept: { re: /\bIP\s?\d{2}/i } },
      { key: "os", name: /operating system installed|syst[eè]me d.exploitation install[eé]/i, accept: { re: /\b(?:Android|iOS|HarmonyOS)\b/i } }
    ],
    /* Cas particulier Icecat : « Internal memory » = RAM si un stockage distinct existe. */
    ramFallbackName: /^(?:internal memory|m[eé]moire interne)$/i,
    ramMaxGb: 24
  };
  if (typeof module !== "undefined" && module.exports) module.exports = profile;
  else if (root.GuideCategoryKit) root.GuideCategoryKit.register(profile);
})(typeof window !== "undefined" ? window : globalThis);
