# Guide d’achat — v81

- Specs manquantes dérivées uniquement des caractéristiques déjà présentes dans le catalogue.
- Indice d’analyse 0–100 selon les caractéristiques essentielles disponibles.
- Analyseur : prise en charge fiable Amazon et sites constructeurs ; autres boutiques en expérimental.
- Nettoyage prudent des fichiers de développement non nécessaires au runtime.

## v80
- Accueil : le bandeau affiche uniquement des mots (toutes catégories mélangées), sans définition. Cause du bug : home.css n'était pas chargé.
- Accueil : « Les mots de la fiche » devient une grille de notions illustrées (dessin + mot).
- Audit : pastilles compactes (dessin animé + libellé), une seule définition par groupe, affichée pour l'option choisie.
- Nouveaux fichiers : notions.js, v79-fixes.css.
- Audit : les 52 définitions réécrites (une phrase courte et concrète chacune) ; légendes des dessins raccourcies pour ne plus déborder.
- Affichage : en-tête opaque (le texte ne transparaît plus), ancres décalées sous l'en-tête, coupures de mots sur mobile corrigées.

## v81
- Bandeau de mots : en mode « mouvement réduit », une seule ligne par rangée, défilement au doigt (plus de bloc géant).
- Définitions cliquables : « mAh », « Hz », « Nits » ne s’affichaient pas (recherche sensible à la casse) ; ajout du toucher sur mobile, infobulle bornée à l’écran, nouveaux termes (OIS, Wh, mégapixels).
- « Mpx » écrit « mégapixels » ; carte « 200 mégapixels » recentrée sur la taille fixe du capteur, avec renvois vers le lexique et les explications.
- En-tête de nouveau translucide ; fond animé façon lampe à lave (lava.js) ; couleurs ajoutées aux cartes de catégories, notions et sections.

## v82
- Liens Idealo : l'ancien format « /s/smartphones/nom.html » n'existe pas (404). Les 84 liens du catalogue pointent maintenant vers la recherche Idealo du modèle, et le lien est reconstruit depuis le nom à l'affichage.

## v83
- Accueil : l'icône de la catégorie Smartphones est remplacée par un éventail de cinq cartes photo posées sur un socle lumineux (assets/phones/fan-1 à fan-5.webp). L'éventail s'ouvre à l'apparition de la carte, s'écarte au survol, et reste statique en mode « mouvement réduit ».
