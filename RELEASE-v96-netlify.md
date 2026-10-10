# v96 — Dark Deco, analyse et Netlify

- Le mode sombre reste sélectionné au premier accès ; le choix clair/sombre est désormais fonctionnel et mémorisé.
- La palette vintage Art déco est conservée, avec une hiérarchie typographique plus technique (IBM Plex Mono pour repères et chiffres).
- Le bloc recommandations de l’audit ne conserve plus un `display:block` en ligne après avoir été masqué : il se réaffiche et se masque correctement au fil des sélections et réinitialisations.
- Ajout d’une Netlify Function à `/api/resolve`, avec support URL et recherche manuelle par modèle ; la route Vercel existante est conservée.
- Ajout de `DEPLOIEMENT.md`. Le résolveur n’invente pas les caractéristiques si un vendeur ou une source technique est inaccessible.
- Grain, vignettage et niveaux de noir adoucis après inspection visuelle : le décor reste film noir sans écraser le contraste du contenu.

- Le module PhonesData préexistant est maintenant réellement appelé en parallèle de Kimovil et GSMArena. Les compléments ne sont fusionnés qu’après concordance du nom ; les liens/fiches de variantes divergentes sont rejetés.
- L’interface n’affiche plus une liste de sources par défaut : elle indique celles présentes dans le résultat.
