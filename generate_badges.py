#!/usr/bin/env python3

import csv
import sys
from itertools import groupby
import jinja2
import qrcode
import qrcode.image.svg
import cairosvg
import os
from typing import Generator

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
    image_factory=qrcode.image.svg.SvgPathImage,
)

COLORS = {
    "attendee": "#3FC633",
    "speaker": "#FEAF00",
    "sponsor": "#E51AE2",
    "staff": "#EE0000",
}


def qrcode(code: str) -> str:
    qr.clear()
    qr.add_data(code)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    str_svg = img.to_string().decode("utf-8")
    return str_svg.replace(
        'width="29mm" height="29mm"',
        'y="133.92799" x="293.21634" height="150" width="150"',
    )


class Record:
    def __init__(
        self,
        nom: str,
        prenom: str,
        command: str,
        qr_code: str,
        tarif: str,
        repas: str,
        mail: str,
        entreprise: str,
    ):
        self.nom = nom
        self.prenom = prenom
        self.command = command
        self.qrcode = qr_code
        self.tarif = tarif
        self.repas = repas
        self.mail = mail
        self.entreprise = entreprise

    def key(self) -> str:
        # if self.tarif == 'Universités et Conférence (3j Mer-Ven)' or self.tarif.startswith('Upm') or self.tarif.startswith('Uam'):
        #    return self.command
        return f"{self.qrcode}"


class Badge:
    speakers3j = []

    def __init__(self):
        self.univ1 = None
        self.univ2 = None
        self.tarifs = []
        self.entreprise = None

    def merge(
        self,
        nom: str,
        prenom: str,
        qr_code: str,
        tarif: str,
        repas: str,
        mail: str,
        entreprise: str,
    ):
        self.nom = nom
        self.prenom = prenom
        self.qrcode = qr_code
        if tarif.startswith("Uam"):
            self.univ1 = tarif
        elif tarif.startswith("Upm"):
            self.univ2 = tarif
        self.tarifs.append(tarif)
        self.repas = repas
        self.mail = mail
        self.entreprise = self.entreprise or entreprise

    def toVars(self) -> dict[str, str]:
        t = self._type()
        top = (self.univ1 or "")[7:]
        bottom = ""
        if t == "sponsor":
            bottom = self.entreprise or ""
        return {
            "firstname": self.prenom,
            "lastname": self.nom,
            "qrcode": qrcode(self.qrcode),
            "color": COLORS[t],
            "type": t,
            "outlineTop": top,
            "outlineBottom": bottom or (self.univ2 or "")[7:],
            "year": "2025",
            "repas": self.repas,
        }

    def __str__(self) -> str:
        return f"{self.nom}/{self.prenom} {self.qrcode} {self.repas} {self.univ1}/{self.univ2}"

    def _type(self) -> str:
        if any(["Conférence" in tarif or "Conference" in tarif for tarif in self.tarifs]):
            return "attendee"
        elif any(["Stand" in tarif or "Sponsors" in tarif for tarif in self.tarifs]):
            return "sponsor"
        elif any(["Speakers" in tarif for tarif in self.tarifs]):
            return "speaker"
        elif any(["Staff" in tarif for tarif in self.tarifs]):
            return "staff"
        else:
            raise Exception(f'Unknown type {self.tarifs}')
            

    def weight(self) -> int:
        t = self._type()
        if t == "staff":
            return 0
        elif t == "speaker" and self.mail in Badge.speakers3j:
            return 2
        elif t == "attendee" and any(["3j" in tarif for tarif in self.tarifs]):
            return 3
        elif t == "speaker":
            return 4
        elif t == "attendee":
            return 5
        elif t == "sponsor":
            return 6
        else:
            return 7


def read_csv(file: str) -> Generator[Record]:
    with open(file) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=";", quotechar='"')

        for row in reader:
            yield Record(
                row["Nom"],
                row["Prénom"],
                row["Commande"],
                row["Codes-barres"],
                row["Tarif"],
                row["Repas - #95255"],
                row["E-mail"],
                row["Entreprise - #11"],
            )


def badges(file: str) -> Generator[Badge]:
    for cmd, records in groupby(
        sorted(read_csv(file), key=lambda r: r.key()), lambda r: r.key()
    ):
        badge = Badge()
        for record in records:
            badge.merge(
                record.nom,
                record.prenom,
                record.qrcode,
                record.tarif,
                record.repas,
                record.mail,
                record.entreprise,
            )
        yield badge


def speakers3j(file: str) -> list[str]:
    with open(file) as speakerfile:
        return [line.rstrip() for line in speakerfile]


if __name__ == "__main__":
    Badge.speakers3j = speakers3j(sys.argv[2])

    badges = sorted(badges(sys.argv[1]), key=lambda b: (b.weight(), b.nom, b.prenom))

    templateLoader = jinja2.FileSystemLoader(searchpath="./")
    env = jinja2.Environment(loader=templateLoader)

    template = env.get_template("badge-avec-trou.svg.j2")

    if not os.path.exists("out"):
        os.makedirs("out")

    for idx, b in enumerate(badges):
        cairosvg.svg2pdf(
            bytestring=template.render(b.toVars()),
            write_to=f"out/{idx:>04}_out.pdf",
            dpi=300,
        )
        print(f"generate out/{idx:>04}_out.pdf")

# https://medium.com/@mgkyawzayya/splitting-and-merging-pdf-files-with-python-using-pypdf2-cfce5c948c36
