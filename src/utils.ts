import { TypesConfig } from './models';
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
    return input ? input.charAt(0).toUpperCase() + input.slice(1) : '';
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