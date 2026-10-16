# PC portables — données et génération

Générateur des données PC portables.

## Fichier à modifier

`construire.py` — source de référence : liste des modèles, prix, caractéristiques et scores. Les règles d'identification des titres/marques sont dans `category-kit/pc-portables.js` (à la racine du dépôt).

## Sorties

Lancez depuis la racine du dépôt : `python3 tools/pc-portables/construire.py`

- `data/pc-portables.json` — catalogue chargé par `assets/js/pc-visuals.js` ;
- `data/lexique-pc-portables.json` — données du lexique ;
- `lexique-pc-portables.html` — lexique (généré à partir du gabarit `lexique.html`).

## Lecture des scores et des données

Les scores vont de 1 à 9 et mesurent l'adéquation à un profil, pas la qualité absolue du PC. Chaque donnée non confirmée doit rester inconnue plutôt que d'être inventée. Consultez les champs `spec_provenance` pour distinguer les autonomies annoncées, mesurées ou estimées.
