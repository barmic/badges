<template>
  <div class="export">
    <button @click="loadSVGAndGenerate">Export</button>
    <p>{{ state.created }}/{{ badges?.length }}</p>
  </div>
</template>

<script lang="ts">
import JSZip from 'jszip';
import { reactive } from 'vue';
import { BadgeParams } from './models';
import { capitalize, id, QRCODE_OPTS, TYPES, year } from './utils';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import blobStream from 'blob-stream';

export default {
  props: {
    badges: Array<BadgeParams>,
  },
  setup() {
    const state: any = reactive({
      created: 0,
    });

    return {
      state
    };
  },
  methods: {
    loadSVGAndGenerate(): void {
      const badges: BadgeParams[] = this.$props.badges ?? [];

      fetch('./badge.svg')
        .then(response => response.text())
        .then(txt => this.generateAll(badges, txt));
    },
    generateAll(badges: BadgeParams[], svg: string): Promise<void> {
      let pages: Promise<JSZip> = new Promise((resolve, _reject) => resolve(new JSZip()));
      for(let i = 1; i < badges.length; i += 1) {
          const badgeParam = badges[i];
          const badge: SVGElement = this.updateSVG(svg, badgeParam) as any;
          this.state.created += 1;
          pages = pages.then(async (zip: JSZip) => {
              const [pdf, name] = await this.generatePdf(badge, badgeParam);
              return zip.file(name, pdf);
          });
      }

      return pages.then((zip) => zip.generateAsync({ type: 'blob' }))
          .then((blob: Blob) => this.generateZip(blob));
    },
    updateSVG(svgTxt: string, user: BadgeParams): HTMLElement {
        const svg = new DOMParser().parseFromString(svgTxt, 'image/svg+xml');

        id(svg, 'snc-firstname', elem => elem.textContent = capitalize(user.firstname));
        id(svg, 'snc-lastname', elem => elem.textContent = capitalize(user.lastname));

        if (user?.barcode?.trim()) {
            QRCode.toDataURL(user.barcode, QRCODE_OPTS, (err: any, url: string) => {
                id(svg, 'snc-barcode', elem => elem.setAttribute('xlink:href', url));
            });
        }

        id(svg, 'snc-type-background', elem => elem.style.fill = TYPES[user.type]?.color ?? '#3FC633');

        id(svg, 'snc-type', elem => elem.textContent = capitalize(user.type));

        id(svg, 'snc-univ1', elem => elem.textContent = user.univ1 ? capitalize(user.univ1) : '');
        id(svg, 'snc-univ2', elem => elem.textContent = user.univ2 ? capitalize(user.univ2) : '');

        id(svg, 'snc-year', elem => elem.setAttribute('xlink:href', year()));

        return svg.documentElement;
    },
    generateZip(blob: Blob) {
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        const now = new Date();
        a.download = `badges_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
        a.style.position = 'fixed';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
    generatePdf(badge: SVGElement, params: BadgeParams): Promise<[Blob, string]> {
        const size = 'A6';
        const doc = new PDFDocument({size});

        const stream = doc.pipe(blobStream());
        SVGtoPDF(doc, badge, 0, 0, {});
        doc.end();

        return new Promise((resolve, _reject) => {
            stream.on('finish', () => resolve([
                stream.toBlob('application/pdf'),
                `${params.type}_${params.lastname}_${params.barcode}.pdf`,
            ]));
        });
    }
  }
};
</script>

<style>
div.export {
    height: 5em;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
</style>