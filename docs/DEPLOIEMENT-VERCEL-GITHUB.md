# Mettre le site en ligne avec GitHub + Vercel (guide pas à pas)

## Ce que fait chaque service
- **GitHub** : stocke les fichiers du site (comme un dossier en ligne).
- **Vercel** : lit ce dossier et publie le site. Il fait aussi tourner la petite fonction `api/resolve.js` (l'analyseur de lien), sans que vous ayez de serveur à gérer.

## Étapes (sur ordinateur, le plus simple)
1. Décompressez le ZIP : vous obtenez un dossier avec `index.html`, `api/`, `server/`, `vercel.json`, etc.
2. Sur github.com : **New repository** (nom au choix, public ou privé), puis **uploading an existing file**.
3. Glissez **le contenu du dossier décompressé** (pas le ZIP lui-même) : `index.html` doit se trouver à la racine du dépôt. Validez avec **Commit changes**.
4. Sur vercel.com : **Add New… → Project**, connectez GitHub, choisissez le dépôt.
5. Ne changez rien : Framework « Other », Build Command vide, Root Directory vide. Cliquez **Deploy**.
6. Une fois déployé, ouvrez `https://VOTRE-SITE.vercel.app/api/health` : vous devez voir `{"ok":true,...}`. Puis testez l'analyseur sur la page Smartphones.

## Mettre à jour plus tard
Dans le dépôt GitHub, remplacez les fichiers par ceux de la nouvelle version (upload) et validez : Vercel redéploie tout seul en une minute.

## Pourquoi pas Netlify seulement ?
Le projet fonctionne aussi sur Netlify (`netlify.toml`), mais l'analyseur de lien utilise la fonction serveur : sur Vercel elle est `api/resolve.js`, sur Netlify `netlify/functions/`. Un site hébergé sans fonction (GitHub Pages seul) affichera tout sauf l'analyse en direct.

## À ne pas déplacer
`vercel.json`, `api/`, `server/`, `package.json` doivent rester à la racine du dépôt.

## Depuis un iPhone
GitHub accepte l'envoi de fichiers depuis Safari, mais pas de dossier entier ni de ZIP à décompresser : si les dossiers (`api/`, `server/`, `assets/`…) ne sont pas déjà dans le dépôt, utilisez un ordinateur pour cette première mise en place. Les mises à jour de quelques fichiers (par exemple `bats.css`) se font ensuite très bien depuis le téléphone.

---

## Notes techniques de la version précédente

Le projet contient une route serverless Vercel (`api/resolve.js`) et sa configuration (`vercel.json`). `api/resolve.js` appelle le résolveur partagé dans `server/resolve.js`.

## Import initial

1. Décompresser l’archive du projet.
2. Placer **les fichiers et dossiers extraits** dans le dépôt GitHub, à sa racine. Ne déposer pas uniquement le fichier ZIP : Vercel ne décompressera pas ce ZIP en projet source lors de l’import Git.
3. Dans Vercel, choisir **Add New → Project**, connecter GitHub et sélectionner le dépôt.
4. Pour ce site HTML/JavaScript sans étape de compilation, conserver la racine du dépôt comme **Root Directory** et laisser vide la commande **Build Command** si Vercel la demande. Ne pas définir un autre dossier de sortie.
5. Déployer. Vercel sert les pages du dépôt et expose la fonction sous `/api/resolve`.
6. Après le déploiement, vérifier `https://VOTRE-SITE.vercel.app/api/health`, puis tester une analyse depuis la page smartphones.

## Mise à jour ultérieure

Remplacer les fichiers du dépôt par ceux de la nouvelle version puis pousser les modifications sur la branche de production (habituellement `main`). Vercel lancera un nouveau déploiement automatiquement. Les branches non-production peuvent servir aux aperçus.

## À conserver à la racine

- `vercel.json`
- `api/resolve.js`
- `server/` et les autres dossiers/fichiers du site référencés par les pages et fonctions
- `package.json`

Ne pas déplacer `api/resolve.js` ni `vercel.json` dans un sous-dossier si ce sous-dossier n’est pas configuré comme racine du projet Vercel.

## Précision pour iPhone

GitHub et Vercel peuvent être administrés dans Safari, mais l’archive est un projet avec de nombreux fichiers et dossiers. Téléverser le ZIP seul dans un dépôt ne suffit pas. L’import Vercel depuis GitHub suppose que les fichiers extraits soient déjà présents dans le dépôt. Si cette préparation n’est pas faisable sur iPhone, il faut utiliser un ordinateur pour extraire et pousser le projet, ou continuer à mettre à jour le dépôt par un moyen déjà configuré.

## Netlify

La compatibilité Netlify est conservée séparément (`netlify.toml` et `netlify/functions/`). Le même dépôt peut être relié à Netlify si besoin. Chaque plateforme effectue son propre déploiement.
