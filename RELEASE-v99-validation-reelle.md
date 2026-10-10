# Guide·Achat v99 — validation sur des URL réelles

Date : 10 octobre 2026. Le ZIP v98 a été extrait dans un répertoire isolé et son résolveur a été exécuté sur des URL publiques de fiches produit.

## Amazon — iPhone 16 128 Go
URL : https://www.amazon.fr/Apple-iPhone-16-128-Go/dp/B0DGHY5KG8

- Le fetch serveur retourne HTTP 200 et le titre extrait est **Apple iPhone 16 (128 Go) - Noir**.
- Le bloc Amazon `#poExpander` contient les données structurées de la variante sélectionnée ; le parseur les expose avec la provenance `merchant-specification-table` : stockage 128 Go, écran 6,1 pouces, 60 Hz, RAM 8 Go et iOS 18.
- Le texte libre donne aussi A18, extrait désormais sans le slogan commercial qui le suivait.
- Le HTML reçu ne fournit pas de prix principal lisible (le produit invite à l’ajouter au panier et présente séparément des offres tierces). Le résolveur retourne `price: null` et un avertissement, plutôt que d’associer au produit un prix d’autre offre.
- La fiche n’embarque pas de `Product` JSON-LD exploitable dans la réponse serveur observée : l’identité reste `partial` et l’interface doit présenter l’avertissement de vérification.

Les deux corrections issues de ce constat — lecture du véritable bloc Amazon `po-*` et motif processeur borné — sont intégrées au v99 et à ses tests.

## Fnac — Samsung Galaxy A56 256 Go
URL : https://www.fnac.com/Smartphone-Samsung-Galaxy-A56-6-7-5G-Nano-SIM-256-Go-Graphite/a21318589/w-4

- Dans le navigateur, la page est consultable et indique le titre A56 Graphite, 256 Go, écran 6,7 pouces/120 Hz, processeur Exynos 1580 et un prix affiché de 398 € ; des offres distinctes sont aussi affichées.
- Le fetch serveur utilisé par le résolveur renvoie HTTP 403. L’analyse complète s’arrête donc sur `reason: http`; elle **ne confirme pas** les données Fnac et ne prétend pas les avoir extraites. La recherche serveur de secours n’a pas trouvé de résultat exploitable pendant cet essai.
- Aucun contournement de protection n’a été tenté.

## Conclusion
Le scénario Amazon donne un résultat partiel mais cohérent : bonne identité/variante et plusieurs caractéristiques de la page, sans prix inventé. Le scénario Fnac révèle une limitation côté accès serveur (403) : cette URL précise n’est pas analysable automatiquement dans cet environnement tant que Fnac refuse la requête. Le ZIP inclut ces tests de régression et conserve la fonction Netlify/Vercel.
