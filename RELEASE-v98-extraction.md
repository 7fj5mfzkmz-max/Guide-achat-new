# Guide·Achat v98 — extraction plus sûre des fiches marchandes

Le résolveur choisit désormais un produit JSON-LD à partir du nom de modèle et de variante présents dans l’URL ou le titre de la fiche. Il sait parcourir les nœuds `hasVariant`, conserve les capacités comme 128/256 Go pour différencier les variantes et ne prend plus arbitrairement le premier produit structuré trouvé. Les offres multiples aux prix divergents ne deviennent pas un prix certain.

Des adaptateurs ajoutent des sélecteurs de titre et de prix propres à Amazon, Fnac, Darty, Cdiscount, LDLC, Boulanger et Rakuten, avec un repli sur les métadonnées standard et JSON-LD. Les identifiants structurés peuvent être rapprochés de ceux du lien. Si l’URL, le titre visible, JSON-LD, l’ASIN ou le GTIN se contredisent clairement, l’analyse s’arrête et explique le conflit au lieu de fusionner des caractéristiques possiblement erronées.

Les caractéristiques JSON-LD `additionalProperty` et celles des tableaux techniques reconnus sont examinées avant le texte libre. L’API retourne une provenance par valeur (`merchant-jsonld-property`, `merchant-specification-table`, `merchant-page-text`, référentiel externe, etc.) et distingue l’origine du prix. Le texte général reste un repli et n’est pas présenté comme une donnée structurée.

Les protections anti-robot ne sont pas contournées. Les cas où le marchand bloque la lecture continuent d’utiliser les solutions de capture/saisie déjà présentes. Les sélecteurs marchands peuvent changer ; le test local utilise des fixtures synthétiques et ne certifie pas l’accès en direct aux pages Amazon ou Fnac.

## Vérifications
- Syntaxe de tous les fichiers JavaScript : OK.
- Tests de scoring, de routage GitHub/Vercel et nouveaux tests d’extraction : OK.
- Cas couverts : variantes JSON-LD, prix Amazon/Fnac, tableau technique Fnac, ASIN/GTIN incohérents, désaccord titre/JSON-LD et arrêt bout en bout avant fusion : OK.
- Test de fumée Netlify : prévol 204, entrée vide 400 et santé 200.
