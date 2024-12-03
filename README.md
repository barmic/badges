# Badge generator

This project use `uv` as project management (https://github.com/astral-sh/uv).


## Create bagdes

### Get need files

- CSV input
  - export from billetweb
- list of university speakers email

### Year

Generate year image with `year.html`.
Copy the base64 in svg file.

### Run the script

Run the `generate_badges.py` as

```sh
uv run generate_badges.py billetweb.csv speakers.txt
```

### Merges PDF

Merge all resulting PDF in one multipages PDF.
