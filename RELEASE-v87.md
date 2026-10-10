# Guide·Achat v87 — PhonesData comme référentiel technique

## Changement principal
L’analyseur ne récupère plus les caractéristiques techniques depuis le site marchand.

Flux :
1. Le lien marchand sert uniquement à lire les indices d’identité du produit : nom, marque, référence et éventuellement identifiants présents dans l’URL.
2. Le modèle identifié est recherché dans PhonesData.
3. La fiche PhonesData est la seule source utilisée pour les caractéristiques envoyées au moteur de score.
4. Le score Guide·Achat est recalculé à partir des caractéristiques PhonesData disponibles.
5. Le résultat affiche la fiche PhonesData utilisée comme source technique.

## Fallback
- Si le marchand bloque la lecture, le nom présent dans l’URL peut encore être utilisé.
- Si le HTML est rendu uniquement par JavaScript, le rendu navigateur sert uniquement à obtenir le nom du modèle.
- Le lecteur secondaire sert uniquement à récupérer le nom.
- Si le modèle n’est pas retrouvé dans PhonesData, l’analyse ne substitue plus silencieusement une fiche GSMArena/Kimovil/Icecat.

## Attribution
Le résultat affiche un lien vers la fiche PhonesData utilisée.

## Limite importante
PhonesData est traité comme référentiel source, pas comme garantie absolue d’exactitude : ses conditions indiquent que son contenu est présenté sans garantie d’exactitude, d’exhaustivité ou d’actualité.
