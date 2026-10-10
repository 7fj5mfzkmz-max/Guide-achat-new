# Guide·Achat v91 — correctif analyseur

## Problème principal
Le site public est hébergé sur GitHub Pages. GitHub Pages sert les fichiers statiques mais n'exécute pas `api/resolve.js`. L'analyseur appelait pourtant `/api/resolve`, donc le moteur serveur existant était hors circuit sur le site public.

## Correctif
- Ajout de `phone-analyzer/static-resolver.js`.
- Sur GitHub Pages, l'analyseur utilise automatiquement ce résolveur si aucun `GUIDE_API_BASE` n'est configuré.
- Si un backend est configuré, le backend reste prioritaire.
- Si le backend tombe en erreur, le résolveur statique sert de secours.
- Les URLs Amazon sont reconnues via le slug et l'ASIN.
- Les URLs Cdiscount sont reconnues via `f-<id>-<slug>.html`, y compris les slugs compacts.
- Le catalogue local de 84 smartphones est réactivé comme filet d'identification et de caractéristiques.
- Une correspondance alphanumérique exacte est utilisée pour les slugs collés afin d'éviter les faux échecs de segmentation.
- Une lecture publique facultative via Jina Reader complète l'identification quand le navigateur l'autorise.
- Une URL inconnue peut maintenant être reconnue génériquement sans inventer de caractéristiques.
- Les saisies manuelles utilisent également le même résolveur au lieu d'un `fetch('/api/resolve')` direct.
- Ajout de fabricants/familles manquants dans le profil smartphone et correction de la variante `A` / des modèles secondaires.

## Validation
- Syntaxe de tous les fichiers JavaScript : OK.
- `npm run analyzer:test` : OK.
- Test de 84 modèles du catalogue avec URLs Amazon synthétiques : 83/84 = 98,8 %.
- Test de 84 modèles du catalogue avec URLs Cdiscount synthétiques : 83/84 = 98,8 %.
- Le seul échec synthétique est `Galaxy S26+` lorsque le générateur de test supprime le signe `+` ; avec une URL contenant `s26-plus` ou `s26plus`, il est reconnu correctement.
