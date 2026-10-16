# v113 — analyse de liens, recherche manuelle et score photo

La v112 avait une cascade logique mais trois pannes réelles : la recherche PhonesData interrogeait un endpoint GET qui ne renvoie que la page d'accueil du formulaire, la recherche manuelle n'appelait pas le serveur Vercel sur la même origine, et le score photo se fiait aux mégapixels.

## 1. Analyseur de liens (Darty, Fnac, Cdiscount)

### Causes constatées
- **Darty et Fnac** répondent `403` (page « FNAC DARTY - Maintenance ») à toute lecture serveur : blocage anti-robot, aucun contournement tenté. La cascade retombe sur l'indice d'URL puis les référentiels techniques.
- **Cdiscount** répond `200` mais avec une coquille JavaScript de 14 Ko (`og:title` = « Cdiscount.com »). Cette coquille était acceptée comme « fiche lue » car le nom du marchand seul passait le filtre `usableName` : l'analyseur affichait « Cdiscount.com » comme modèle.
- **Cdiscount ancien format** : `samsunggalaxya165g` était découpé en « samsung galaxy a 165 g » — le suffixe `5g` collé au numéro rendait l'indice inutilisable par PhonesData.

### Corrections
- `server/extract.js` : un nom qui n'est que le marchand (« Cdiscount.com », « Fnac ») n'est plus un nom de modèle. La coquille Cdiscount est maintenant détectée pour ce qu'elle est, et la cascade continue vers l'indice d'URL.
- `phone-analyzer/identify.js` : la connectivité collée (`a165g`) est découpée avant le fractionnement lettre/chiffre générique → « samsung galaxy a 16 5g ». Testé sur les trois marchands : tous identifient maintenant le bon modèle (voir « Tests »).

### Ce qui n'a pas changé
Le blocage 403 de Darty/Fnac est volontaire de leur part : le guide ne contourne ni CAPTCHA ni anti-robot. Le modèle est identifié à partir du lien + PhonesData (voir ci-dessous), avec un avertissement explicite « la fiche marchand n'a pas pu être lue ».

## 2. Recherche manuelle (catalogue + référentiels)

### Causes constatées
- `phone-analyzer/fetcher.js` : `resolveModel()` n'appelait `/api/resolve` **que si `apiBase()` renvoyait une URL explicite**. Sur Vercel même-origine (le déploiement GitHub+Vercel décrit dans DEPLOIEMENT-VERCEL-GITHUB.md), `apiBase()` renvoie `""` → la saisie manuelle partait sur le résolveur statique (catalogue uniquement), sans jamais interroger PhonesData/Kimovil/GSMArena.
- `sources/phonesdata.js` : la recherche réelle du site est un **formulaire POST** vers `/fr/search/smartphone/` (champ `model`). Le code essayait des URL GET (`/search/?q=…`) qui renvoient la page du formulaire, vide de résultats.
- `server/resolve.js` : `resolveModel()` lisait `options.catalogue` que personne ne fournissait → l'étape « catalogue » travaillait sur une liste vide.

### Corrections
- `fetcher.js` : la recherche manuelle appelle maintenant `/api/resolve` sur toute origine qui n'est pas GitHub Pages (avec repli statique en cas d'indisponibilité). GitHub Pages garde le résolveur statique + le backend Vercel explicite.
- `phonesdata.js` : recherche POST identique au formulaire du site. Vérifié en direct : « Samsung Galaxy A16 » → fiche `galaxy-a16-5465360` avec 13 caractéristiques ; « Oppo Find X9 Ultra » → fiche complète ; « iPhone 17 Pro » → fiche Apple.
- `phonesdata.js` : le nom affiché vient maintenant de la ligne « Marque et modèle » de la fiche (« Samsung Galaxy A16 »), pas d'un titre tronqué.
- `server/resolve.js` : le catalogue local (`smartphones.json`) est lu au démarrage de la fonction et sert d'accélérateur — la réponse garde un contrat uniforme (`product.name`, `specs`, `specSources`, `identity`).
- `phone-analyzer/ui.js` : l'avertissement du serveur (« prix et variante non vérifiés ») est maintenant affiché, et la fiche catalogue reconnue alimente points forts / points de vigilance.

## 3. Score de compatibilité (photo)

### Cause constatée
`photoScore()` notait un A16 à 6.6/10 parce qu'il additionnait : mégapixels (50 MP → 6.2), OIS (6.8), ultra-grand-angle (6.4)… Autrement dit, **des chiffres marketing**. Le plafond sans test (7.4) était trop proche du score d'entrée de gamme, et la batterie n'entrait jamais dans les moyennes (le critère s'appelait `autonomy`, les pondérations `autonomie`).

### Nouveau jugement (`phone-analyzer/spec-score.js`)
Le score photo se fonde sur ce qui détermine réellement la qualité d'image, dans l'ordre :
1. **taille du capteur principal** (1/2.76" = petit ; ~1" = très grand) — poids 3 ;
2. **téléobjectif dédié** (périscope ou téléphoto avec capteur) — poids 2.5 ;
3. **ouverture** (f/1.8 ou plus lumineux) — poids 1.5 ;
4. **OIS** (les négations « sans OIS » sont ignorées) et **vidéo 4K** (proxy de l'ISP) ;
5. **nombre de modules utiles**.

Plafonds de cohérence : un capteur 1/2.5" ou plus petit ne dépasse jamais 4.2-4.8, même avec OIS ; sans téléobjectif dédié, jamais plus de 6.6. Le plafond absolu est **9.5/10**, réservé au matériel de référence attesté par un test terrain ≥ 9 (capteur ~1" + périscope + 4K) — l'Oppo Find X9 Ultra / Xiaomi 18 Pro Max de votre référentiel.

Calibration vérifiée (fiches GSMArena réelles) :
| Modèle | Ancien | Nouveau |
|---|---|---|
| Galaxy A16 (1/2.76", 1080p) | 6.6 | **≈ 4.0** |
| Galaxy A56 (1/1.56", 4K) | ~6.4 | **≈ 5.6** |
| Find X9 Ultra (1/1.4", périscope) — sans test | 7.4 (plafonné) | **7.4 (plafonné)** |
| Find X9 Ultra + test 9.5 | 8.7 | **9.2-9.5** |

Le profil **photographe** pèse maintenant la photo à 62 % (au lieu de 48 %) et un score photo < 4.5 plafonne la note du profil à 4.2 : un Galaxy A16 affiche **4.2/10 photographe** (contre 6 avant), tandis que son profil étudiant reste ~6.8 (le prix y pèse). La correction `autonomie` (au lieu de `autonomy`) fait entrer la batterie dans les moyennes.

## 4. Guides de fin de parcours
- Le bloc **« Guide 1 — La méthode en détail »** est supprimé de `smartphones.html` (aucune autre référence à `#comment-lire` ne subsiste).
- Les guides restants sont renumérotés (Guide 1 = fiche produit, Guide 2 = décoder le marketing) et reliés entre eux par deux liens de fin de section.
- L'intro indique « 2 guides détaillés ».

## Compatibilité avec votre déploiement (GitHub + Vercel)
- Aucun nouveau fichier à configurer : les modifications sont dans des fichiers existants (`server/`, `phone-analyzer/`, `sources/`, `smartphones.html`).
- Aucune variable d'environnement nouvelle. `BRAVE_API_KEY` / `SERPER_API_KEY` restent optionnelles.
- **Rien à changer au déploiement** : poussez les fichiers modifiés sur GitHub, Vercel redéploie.
- Le fichier `smartphones.json` doit rester à la racine (la fonction Vercel le lit au démarrage).

## Fichiers modifiés
| Fichier | Nature du changement |
|---|---|
| `server/extract.js` | rejet des noms = marchand seul |
| `server/resolve.js` | catalogue local branché dans `resolveModel`, contrat de réponse uniforme |
| `sources/phonesdata.js` | recherche POST (le vrai formulaire), nom complet « Marque et modèle » |
| `sources/gsmarena.js` | recherche web (DDG puis Bing) au lieu de la recherche interne bloquée ; modules caméra complets (capteur, ouverture, téléobjectif, 4K) |
| `phone-analyzer/fetcher.js` | recherche manuelle → `/api/resolve` sur toute origine non-GitHub-Pages |
| `phone-analyzer/identify.js` | connectivité collée (`a165g` → `a 16 5g`) |
| `phone-analyzer/spec-score.js` | score photo matériel + calibration ; critère `autonomie` ; profil photographe |
| `phone-analyzer/ui.js` | avertissement serveur affiché ; fiche catalogue reconnue |
| `smartphones.html` | Guide 1 supprimé, guides renumérotés et reliés |
| `scripts/v113-regression.js` (nouveau) | 12 vérifications de non-régression |

## Tests
```
npm run analyzer:test              # selftest complet
npm run analyzer:identification-test  # 20 vérifications d'identité
npm run analyzer:extract-test
npm run analyzer:routing-test
npm run analyzer:v113-test        # nouveaux tests v113
npm run kit:check
npm run network:test
npm run fixtures:test
```

Vérification bout en bout (réseau réel) : un lien Darty, Fnac et Cdiscount d'un Galaxy A16 identifient tous « Samsung Galaxy A16 5G » via `url-hint+phonesdata+crosscheck`, avec 13 caractéristiques et un profil photographe à 3.9-4.2/10.

## Limites connues
- **Kimovil** renvoie `403` (Cloudflare) côté serveur : la source reste branchée mais ne répond généralement pas. PhonesData est le référentiel principal effectif.
- **GSMArena** bloque sa recherche interne (Turnstile Cloudflare) : la découverte de fiche passe par une recherche web publique (DuckDuckGo, puis Bing). Ces moteurs peuvent limiter les requêtes à leur tour ; dans ce cas la source est silencieusement écartée sans casser l'analyse.
- Le blocage 403 de Darty/Fnac n'est pas contourné : c'est un choix (aucun contournement d'anti-robot), compensé par l'identification via le lien + les référentiels.
