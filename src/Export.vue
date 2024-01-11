<template>
  <div>
    <button @click="loadSVGAndGenerate">Export</button>
    <p>{{ state.created }}/{{ badges?.length }}</p>
  </div>
</template>

<script lang="ts">
import JSZip from 'jszip';
import { reactive } from 'vue';
import { BadgeParams } from './models';
import { capitalize, id, QRCODE_OPTS, limit, TYPES, year } from './utils';
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
    weightBadge(a: BadgeParams): number {
      switch(a.type ?? 'attendee') {
        case 'staff': return 0;
        case 'speaker': return 1; // TODO distinct mercredi / jeudi
        case 'attendee': return a.univ1 ? 2 : 3;
        case 'sponsor': return 4;
      }
    },
    sortBadge(a: BadgeParams, b: BadgeParams): number {
      const aWeight = this.weightBadge(a);
      const bWeight = this.weightBadge(b);
      return aWeight !== bWeight
        ? aWeight - bWeight
        : a.lastname.localeCompare(b.lastname);
    },
    generateAll(badges: BadgeParams[], svg: string): Promise<void> {
      let pages: Promise<JSZip> = new Promise((resolve, _reject) => resolve(new JSZip()));
      badges.sort((a, b) => this.sortBadge(a, b));
      for(let i = 0; i < badges.length; i += 1) {
          const badgeParam = badges[i];
          const badge: SVGElement = this.updateSVG(svg, badgeParam) as any;
          if (badge) {
            this.state.created += 1;
            pages = pages.then(async (zip: JSZip) => {
                const [pdf, name] = await this.generatePdf(i, badge, badgeParam);
                return zip.file(name, pdf);
            });
          }
      }

      return pages.then((zip) => zip.generateAsync({ type: 'blob' }))
          .then((blob: Blob) => this.generateZip(blob));
    },
    updateSVG(svgTxt: string, user: BadgeParams): HTMLElement | undefined {
      const svg = new DOMParser().parseFromString(svgTxt, 'image/svg+xml');
      user.type = user.type ?? 'attendee';
      /*if (!user.type) {
        console.warn("Can't create badge", user);
        return undefined;
      }*/

      id(svg, 'snc-firstname', elem => elem.textContent = capitalize(user.firstname));
      id(svg, 'snc-lastname', elem => elem.textContent = capitalize(user.lastname));

      if (user?.barcode?.trim()) {
          QRCode.toDataURL(user.barcode, QRCODE_OPTS, (err: any, url: string) => {
              id(svg, 'snc-barcode', elem => elem.setAttribute('xlink:href', url));
          });
      }

      id(svg, 'snc-type-background', elem => elem.style.fill = (user.type && TYPES[user.type]?.color) ?? '#3FC633');

      id(svg, 'snc-type', elem => elem.textContent = user.type ? capitalize(user.type) : 'Plouf');

      id(svg, 'snc-univ1', elem => elem.textContent = user.univ1 ? limit(user.univ1, 45) : '');
      id(svg, 'snc-univ2', elem => elem.textContent = user.univ2 ? limit(user.univ2, 45) : '');

      id(svg, 'snc-year', elem => elem.setAttribute('xlink:href', year()));

      if (user.meal !== 'vege') {
        svg.getElementById('vege')?.remove();
      }

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
    generatePdf(idx: number, badge: SVGElement, params: BadgeParams): Promise<[Blob, string]> {
        const size = 'A6';
        const doc = new PDFDocument({size});

        const stream = doc.pipe(blobStream());
        SVGtoPDF(doc, badge, 0, 0, {});
        doc.end();

        const index = `${idx}`.padStart(4, '0');

        return new Promise((resolve, _reject) => {
            stream.on('finish', () => resolve([
                stream.toBlob('application/pdf'),
                `${index}_${params.type}_${capitalize(params.lastname)}_${capitalize(params.barcode)}.pdf`,
            ]));
        });
    }
  }
};
</script>

<style scoped>
div {
    height: 5em;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
</style>
