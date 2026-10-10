# v95 — Dark Deco
- Nouvelle feuille `deco.css` (chargée en dernier, remplace `dark-deco.css`) + `deco.js` (thème sombre unique, fond lave, grain).
- Direction : Batman TAS 1992 — papier noir, bleu nuit, bleu acier, ambre, filets Art déco, skyline (assets/deco/skyline.svg), trame de points.
- Grain façon intros A24 : particules claires grossières, scintillement ~10 i/s, vignettage (calques .dd-grain / .dd-vig).
- Cartes de catégories (.ct-grid, .ct-*, .hx-fan*) : code inchangé ; variables figées en tête de section 10 de deco.css.
- Correctif : libellé « undefined » (clé `ecran`) dans theme.js et home.js.
- Thème clair retiré (bouton masqué, site-tools.js force « dark »).
- Réglages rapides : opacité du grain = `.dd-grain` ; intensité de la lave = `.dd-bg i` (opacity).
