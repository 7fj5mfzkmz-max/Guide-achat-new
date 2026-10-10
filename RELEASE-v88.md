# Guide·Achat v88 — refonte analyseur

## Identification
- Le mode « Je connais déjà le modèle » est désormais directement accessible depuis l’analyseur.
- La résolution manuelle interroge PhonesData, Kimovil et GSMArena en parallèle.
- Une recherche web publique sert de dernier filet lorsqu’aucun référentiel ne répond.
- Les variantes commerciales (RAM, stockage, couleur) sont retirées de la requête canonique.

## Données techniques
- PhonesData reste la source principale lorsqu’une valeur est disponible.
- Kimovil et GSMArena complètent les champs absents.
- La provenance de chaque caractéristique est conservée.
- Les divergences entre sources sont signalées au lieu d’être silencieusement moyennées.

## Scoring
- `phone-analyzer/spec-score.js` devient le moteur de score unique de l’analyseur.
- Les anciennes pondérations concurrentes ne pilotent plus l’analyseur.
- Les profils Gamer et Photographe ont désormais un critère critique qui limite fortement un score élevé lorsqu’une faiblesse majeure est présente.
- 120 Hz, 5 000 mAh ou 50 MP ne suffisent plus à produire une note élevée à eux seuls.
- 9/10 est réservé à un niveau exceptionnel et aux références explicitement ancrées.
- OPPO Find X9 Ultra : ancre 9/10.
- Xiaomi 18 Pro Max : ancre 8,5/10.

## Vérifications
- Test automatique `scripts/analyzer-selftest.js`.
- Vérification syntaxique de tous les fichiers JavaScript.
