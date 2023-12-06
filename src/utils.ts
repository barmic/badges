import { BadgeType, TypesConfig } from './models';
import { QRCodeToDataURLOptions } from 'qrcode';

export function year(): string {
    const now = new Date();
    const year = now.getMonth() < 3
        ? now.getFullYear()
        : now.getFullYear() + 1;

    const size = 52;
    const canvas = document.createElement('canvas');
    canvas.id     = 'CursorLayer';
    canvas.width  = 200;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.font = `${size}px snowtop_capsregular`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(`${year}`, 0, size); 
    }

    return canvas.toDataURL('image/png');
}

export function capitalize(input: string): string {
    let result = '';
    let mustUpper = true;
    for (const char of input.split('')) {
        result += mustUpper
            ? char.toUpperCase()
            : char.toLowerCase();
        mustUpper = !RegExp(/^\p{L}/,'u').test(char);
    }
    return result;
}

export function limit(input: string, size: number): string {
    return input.length < size
        ? input
        : input.substring(0, size - 1) + '…';
}

const MAPPING = new Map<string, BadgeType>([
    ['Staff', 'staff'],
    ['Sponsor, Accès Expo', 'sponsor'],
    ['Speakers', 'speaker'],
    ['Conférence', 'attendee'],
    ['Université et Conférence', 'attendee'],
    ['Sponsor, Accès Conférence', 'attendee'],
]);

export function typeMapping(input: string): BadgeType | undefined {
    return MAPPING.get(input);
}

export function id(doc: Document, id: string, consumer: (params: HTMLElement) => void) {
    const elem = doc.getElementById(id);
    if (elem) {
        consumer(elem);
    }
}

export const TYPES: TypesConfig = {
  attendee:{name: 'attendee', color: '#3FC633'},
  speaker:{name: 'speaker', color: '#FEAF00'},
  sponsor:{name: 'sponsor', color: '#E51AE2'},
  staff:{name: 'staff', color: '#EE0000'},
};

export const QRCODE_OPTS: QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    margin: 1,
    color: {
      dark: '#00000000',
      light: '#FFFFFFFF'
    }
  };