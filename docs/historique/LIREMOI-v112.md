# v112 — analyse de liens : correctifs de la v111 adaptés à la v110

La v111 était écrite en TypeScript pour une autre application (`src/lib/engine.ts`) : elle ne peut pas se greffer sur ce dépôt (JavaScript, site statique GitHub Pages + fonction Vercel `api/resolve.js`). Ses corrections ont été reportées dans les modules JavaScript de la v110, et ses cas d'usage sont devenus des tests.

## Corrigé (partagé par le site et le serveur Vercel)
- **Cdiscount** : le nom lisible du produit l'emporte sur le code court `f-<id>-<code>.html` ; seul l'ancien format à mots collés garde la priorité (`identify.js`, `static-resolver.js`).
- **Pages de recherche Cdiscount** `/r-….html` refusées comme « page de résultats », pas analysées comme fiche.
- **Fnac, Darty, Rakuten** : le résolveur de secours du navigateur lit désormais le même indice d'URL que le serveur (il lisait `w-4`).
- **Sous-marques** : « XIAOMI X8 Pro » est reconnu comme **POCO X8 Pro** seulement si le fabricant est le même, si le libellé n'a aucune famille (poco, redmi), si le cœur du nom (x 8 pro) est identique sans variante en plus, et si un seul produit correspond.
- **Nom affiché** : plus de slug brut avec tirets ; capacités de stockage retirées du nom.
- **Repli catalogue** (`fetcher.js`) : si le marchand bloque le serveur et que rien n'est retrouvé ailleurs, le navigateur tente le nom de l'adresse + le catalogue local. Jamais en cas de « conflit d'identité » signalé par le serveur, ni pour une page qui n'est pas une fiche. Un avertissement précise que prix et variante ne sont pas vérifiés.
- Déjà correct en v110, désormais verrouillé par des tests : iPhone 17 Pro ≠ 17 Pro Max, X8 ≠ 7, Note 15 5G ≠ 4G, Moto G06 ≠ G06 Power, générations à un chiffre (Black Shark 7, Shark 8).

## Catalogue
- Ajouts : **Apple iPhone 17 Pro Max** (1 479 € indicatif ; note étudiant 6/10 : le profil étudiant pèse d'abord le prix) et **POCO X8 Pro** (349 € indicatif). 86 produits.

## Outils
- `tools/scraper_lab.py` (laboratoire Python, non déployé) : nouvelle option `--save tests/fixtures`. Voir `tools/README.md`.
- `npm run fixtures:test` rejoue l'extraction du serveur sur des pages enregistrées, hors ligne.
- `npm run analyzer:identification-test` : 20 vérifications de non-régression.

## Limites
- Aucune requête réelle vers Amazon, Fnac, Cdiscount, PhonesData, Kimovil ou GSMArena n'a pu être faite ici : les URL de test sont reconstituées d'après leurs formats connus. À valider après déploiement, puis à enrichir avec de vraies pages via `scraper_lab.py --save`.
- Le moteur de classement (audit, scores par profil) de la v111 n'a pas été reporté : seule l'identification de modèle l'était.
