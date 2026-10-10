# v100 — BATS (Batman, la série animée, 1992)

## Visuel
- `bats.css` (chargé en dernier sur les 9 pages) + `bats.js`. Palette : papier noir, bleu nuit, bleu cape, or du sous-titre « Guide·Achat · outil indépendant » (#b9a77c), ocre et corail en touches rares. Aplats, aucun néon.
- Police : Space Grotesk (500/600/700), celle du sous-titre de la capture.
- Grain : relégué DERRIÈRE le contenu (z-index -1), fixe, opacité .075. Il ne recouvre plus le texte. Réglage : `html .dd-grain { opacity }` dans bats.css.
- En-tête : recherche, thème et menu font exactement 42 × 42 px, icônes vectorielles centrées (plus de glyphes texte ni de barres <i>), même rendu en mode clair et sombre, aucun décalage au survol.
- Bandeau de mots de l'accueil : plus de cadre ni de lignes ; mots en capitales espacées séparés par un losange, bords en fondu.
- Flèches haut/bas : un seul bouton « haut de page », carré, visible seulement après défilement (mobile et tablette).

## Audit 45 s : résultat vide corrigé
Les cartes de résultat étaient bien générées (6 cartes, 1 346 px de hauteur) mais restaient à `opacity: 0` : style.css fixait l'opacité à 0 et l'animation de v90-night.css (`from` seul) revenait à cette valeur. Correctif dans bats.css section 8. Le bloc s'intitule désormais « Résultat de l'audit » et la première carte porte « Meilleure correspondance ».

## Déploiement
- Ajout de `api/health.js` : l'adresse `/api/health` annoncée dans la doc n'existait pas sur Vercel.
- Voir DEPLOIEMENT-VERCEL-GITHUB.md (guide pas à pas).
