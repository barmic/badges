# Badge generator

[Outil en ligne](https://barmic.github.io/badges/)

## CSV input

Input CSV should have at least 6 columns:

- firstname
- lastname
- type (`attendee`, `staff`, `speaker`, `sponsor` case insensitive)
- bare code value
- University 1
- University 2

The first line should be columns titles.

An example of csv can be found here: [examples/compl.csv](https://github.com/barmic/badges/blob/main/examples/compl.csv).

## Usage

1. load CSV
2. select column of each field of badge
3. you can check result on some examples
4. export badges

## Template

The badge template can be found here [static/badge.svg](https://github.com/barmic/badges/blob/main/static/badge.svg). The SVG must have somes ids :

- `snc-firstname`, `snc-lastname`, `snc-barcode`, `snc-type`, `snc-univ1`, `snc-univ2`, `snc-year` that will receive value in `textContent`
- `snc-type-background` that will receive background color of type
