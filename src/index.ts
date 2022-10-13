import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import blobStream from 'blob-stream';
import Papa from 'papaparse';
import QRCode, { QRCodeToDataURLOptions } from 'qrcode';
import { year, capitalize, id } from './utils';
import JSZip from 'jszip';

interface BadgeParams {
    firstname: string,
    lastname: string,
    type: 'staff' | 'speaker' | 'sponsor' | 'attendee',
    barcode: string,
    univ1?: string,
    univ2?: string,
}

type TypesConfig = {[k: string]: {name: string, color: string}};

const TYPES: TypesConfig = {
    attendee:{name: 'attendee', color: '#3FC633'},
    speaker:{name: 'speaker', color: '#FEAF00'},
    sponsor:{name: 'sponsor', color: '#E51AE2'},
    staff:{name: 'staff', color: '#EE0000'},
};

const INITIAL_COLUMNS: ColumnsConfig = {
    firstname: 0,
    lastname: 0,
    type: 0,
    barcode: 0,
};

type ColumnsConfig = {[k in keyof BadgeParams]: number}

const context = {
    svg: '',
    year: '',
    columns: INITIAL_COLUMNS,
    data: [['']],
    typeConfig: TYPES,
    examples: [] as number[],
};
const opts: QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    margin: 1,
    color: {
        dark: '#00000000',
        light: '#FFFFFFFF'
    }
};

window.onload = () => {
    fetch('./badge.svg')
        .then(response => response.text())
        .then(txt => context.svg = txt);

    context.year = year();

    for (const selector of Array.from(document.getElementsByClassName('column'))) {
        selector.addEventListener('change', (e: any) => {
            context.columns[selector.id as keyof BadgeParams] = parseInt(e.target?.value);
            examples();
        });
    }

    document.getElementById('csvFile')?.addEventListener('change', (e: any) => {
        const reader = new FileReader();
        reader.readAsText(e?.target?.files[0], 'UTF-8');
        reader.onload = function (evt) {
            const result = Papa.parse((evt?.target?.result as string).trim());
            context.data = result.data as string[][];
            context.columns = INITIAL_COLUMNS;
            context.examples = [1, 2, 3];

            const columns = (result.data[0] as string[]).filter(s => s);
            for (const selector of Array.from(document.getElementsByClassName('column'))) {
                selector.textContent = '';
                columns.forEach((column, idx) => {
                    const opt = document.createElement('option');
                    opt.textContent = column;
                    opt.value = `${idx}`;
                    selector.appendChild(opt);
                });
            }
        }
    });

    document.getElementById('export')?.addEventListener('click', (_) => generateAll());
    document.getElementById('refresh')?.addEventListener('click', (_) => refresh());
};

function examples(): void {
    const examples = document.getElementById('example');
    if (examples) {
        examples.textContent = '';
    }

    context.examples.forEach((i) => {
        examples?.appendChild(updateSVG(context.svg, badgeParams(i)));
    });
}

function refresh(): void {
    const selecteds: number[] = [];
    for(let i = 0; i < 3; i++) {
        selecteds.push(1 + Math.floor(Math.random() * (context.data.length - 1)));
    }
    context.examples = selecteds;
    examples();

}

function badgeParams(sel: number = -1): BadgeParams {
    const selected = 0 < sel && sel < context.data.length
        ? sel
        : 1 + Math.floor(Math.random() * (context.data.length - 1));

    const user: BadgeParams = {
        firstname: context.data[selected][context.columns.firstname],
        lastname: context.data[selected][context.columns.lastname],
        type: context.data[selected][context.columns.type]?.toLowerCase()as BadgeParams['type'] ?? 'attendee',
        barcode: context.data[selected][context.columns.barcode],
    };
    if (context.columns.univ1) {
        user.univ1 = context.data[selected][context.columns.univ1];
    }
    if (context.columns.univ2) {
        user.univ2 = context.data[selected][context.columns.univ2];
    }
    return user;
}

function updateSVG(svgTxt: string, user: BadgeParams): HTMLElement {
    const svg = new DOMParser().parseFromString(svgTxt, 'image/svg+xml');

    id(svg, 'snc-firstname', elem => elem.textContent = capitalize(user.firstname));
    id(svg, 'snc-lastname', elem => elem.textContent = capitalize(user.lastname));

    if (user?.barcode?.trim()) {
        QRCode.toDataURL(user.barcode, opts, (err: any, url: string) => {
            id(svg, 'snc-barcode', elem => elem.setAttribute('xlink:href', url));
        });
    }

    id(svg, 'snc-type-background', elem => elem.style.fill = TYPES[user.type]?.color ?? '#3FC633');

    id(svg, 'snc-type', elem => elem.textContent = capitalize(user.type));

    id(svg, 'snc-univ1', elem => elem.textContent = user.univ1 ? capitalize(user.univ1) : '');
    id(svg, 'snc-univ2', elem => elem.textContent = user.univ2 ? capitalize(user.univ2) : '');

    id(svg, 'snc-year', elem => elem.setAttribute('xlink:href', context.year));

    return svg.documentElement;
}

function generateAll(): void {
    const examples = document.getElementById('example');
    if (examples) {
        examples.textContent = '';
    }

    const badges: any[] = [];
    for(let i = 1; i < context.data.length; i += 1) {
        badges.push(updateSVG(context.svg, badgeParams(i)));
    }

    generateZip(badges);
}

function generateZip(badges: SVGElement[]) {
    const zip = new JSZip();

    let i = 1;
    let pages: Promise<any> = new Promise((resolve, _reject) => resolve(null));
    for (const badge of badges) {
        const number = `${i++}`.padStart(3, '0');
        pages = pages.then((_) => generatePdf(badge).then((pdf) => zip.file(`badge_${number}.pdf`, pdf)));
    }

    pages.then((_) => zip.generateAsync({ type: 'blob' }))
        .then((blob: Blob) => {
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            const now = new Date();
            a.download = `badges_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
            a.style.position = 'fixed';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
}

function generatePdf(badge: SVGElement): Promise<Blob> {
    const size = 'A6';
    const doc = new PDFDocument({size});

    const stream = doc.pipe(blobStream());
    SVGtoPDF(doc, badge, 0, 0, {});
    doc.end();

    return new Promise((resolve, _reject) => {
        stream.on('finish', () => resolve(stream.toBlob('application/pdf')));
    });
}
