# Guide·Achat v97 — précision des profils smartphone

## Changements du moteur
- Pondérations explicites, normalisées à 100 %, pour les quatre profils : Étudiant, Professionnel, Gamer et Photographe.
- Suppression des bonus/corrections inscrits en dur pour des modèles nommés : deux appareils avec les mêmes données obtiennent le même résultat.
- Le prix transmis à l’analyse est enfin intégré, sur une échelle commune de prix indicatif. Le site ne demande pas encore de budget personnel ; ce score n’équivaut donc pas à un contrôle d’un plafond de dépense choisi par l’utilisateur.
- La recharge rapide est un critère distinct et ne gonfle plus la note d’autonomie. L’estimation de batterie tient compte de la diagonale lorsqu’elle est disponible ; cela reste une approximation, pas un test d’endurance.
- Les mégapixels et autres indices matériels photo sont traités comme des proxys plafonnés. Les scores Jeu et Photo restent provisoires et plafonnés à 7,4/9 tant qu’un test spécialisé explicite n’est pas disponible.
- Une note externe déjà calibrée sur 0–9 n’est plus recalibrée une seconde fois ; les résultats de reviews sont maintenant transmis au calcul.
- Les caractéristiques inconnues restent exclues de la moyenne et de la pénalité. Une faible couverture abaisse le plafond de la note et affiche une étoile « provisoire » avec l’explication de la couverture.

## Validation
- Syntaxe de tous les fichiers JavaScript : OK.
- Tests de régression : neutralité au nom, parsing de prix en format français, sensibilité au prix du profil Étudiant, recharge séparée, données inconnues, scores externes déjà calibrés et plafonds sans essai Photo/Jeu : OK.
- Tests de routage historique Vercel/GitHub Pages : OK.
- Vérification navigateur : le moteur charge dans `smartphones.html` et rend les quatre profils.
