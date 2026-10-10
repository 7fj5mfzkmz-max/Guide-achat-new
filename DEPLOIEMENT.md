# Déploiement du Guide·Achat

L’archive fonctionne en site statique sur GitHub Pages et Netlify. L’analyse approfondie des liens marchands requiert un backend Node :

- **Netlify (recommandé pour l’analyse des URL)** : publier la racine de ce dossier. `netlify.toml` publie les fichiers statiques et route `/api/resolve` vers `netlify/functions/resolve.js`.
- **Vercel** : la route historique `api/resolve.js` et `vercel.json` sont conservées.
- **GitHub Pages** : sert les pages et le catalogue statiques ; l’analyseur utilise alors son repli local (identification par URL/catalogue) et n’a pas les capacités du résolveur serveur.

Vous pouvez conserver le dépôt GitHub comme source de version et connecter ce même dépôt à Netlify ou Vercel. Le ZIP contient aussi la fonction Netlify, mais un simple glisser-déposer de fichiers statiques n’exécute pas les fonctions : pour que `/api/resolve` fonctionne sur Netlify, connectez le dépôt à Netlify ou utilisez Netlify CLI après extraction (`netlify deploy --prod --dir=. --functions=netlify/functions`). Pour une mise en ligne statique par glisser-déposer, l’interface et le catalogue fonctionneront, mais l’analyse avancée côté serveur ne sera pas disponible. Pour un déploiement manuel, téléversez le contenu complet du ZIP (pas seulement les fichiers HTML). Ne supprimez pas `server/`, `phone-analyzer/`, `category-kit/`, `sources/` ou `netlify/functions/` : le code d’exécution en dépend.

Les marchands peuvent bloquer les requêtes serveur et certaines caractéristiques ne sont pas publiques. Dans ce cas l’outil présente les données disponibles et propose la saisie/capture manuelle ; il ne doit pas inventer de spécifications. Les fiches et résultats de sources tierces peuvent évoluer sans préavis.
