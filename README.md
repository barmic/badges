# Badge generator

[Outil en ligne](https://barmic.github.io/badges/)

## CSV d'entrée

On prend un fichier CSV qui possède 6 collones

- Prénom
- Nom
- Type
- Code bare
- Université 1
- Université 2

La première ligne du CSV doit être une ligne de titre. Le nom des colonnes est libre.

La colonnes du type doit contenir les valeurs : `attendee`, `staff`, `speaker`, `sponsor`.

Un exemple de csv se trouve dans `examples/compl.csv`.

## Usage

1. charger le fichier CSV
2. sélectionner les colonnes de chaque champ des badges
3. il est possible de vérifier le résultats sur différents exemples
4. exporter les badges


## Modèle

Le modèle du badge se fait via le svg `static/badge.svg`. Le SVG doit contenir les identifiants :

- `snc-firstname`, `snc-lastname`, `snc-barcode`, `snc-type`, `snc-univ1`, `snc-univ2`, `snc-year` qui vont recevoir comme textContent les valeurs appropriés
- `snc-type-background` qui va recevoir comme style la couleur de fond associée au type
