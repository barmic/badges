<template>
  <div>{{ badge || 'toto'}}</div>
  <section ref="section">
  </section>
</template>

<script setup lang="ts">
import { ref, computed, capitalize } from 'vue';
import { BadgeParams } from './models';
import { id, QRCODE_OPTS, TYPES } from './utils';
import QRCode from 'qrcode';

const props = defineProps<{
  badgeParams: BadgeParams
}>();

const section = ref<HTMLElement | null>(null);

const response = await fetch('./badge.svg')
let svgStr = await response.text();

const badge = computed(() => {
  if (!props.badgeParams) return false;

  const svg = new DOMParser().parseFromString(svgStr, 'image/svg+xml');

  id(svg, 'snc-firstname', elem => elem.textContent = capitalize(props.badgeParams.firstname));
  id(svg, 'snc-lastname', elem => elem.textContent = capitalize(props.badgeParams.lastname));

  if (props.badgeParams?.barcode?.trim()) {
    QRCode.toDataURL(props.badgeParams.barcode, QRCODE_OPTS, (err: any, url: string) => {
      id(svg, 'snc-barcode', elem => elem.setAttribute('xlink:href', url));
    });
  }

  id(svg, 'snc-type-background', elem => elem.style.fill = TYPES[props.badgeParams.type]?.color ?? '#3FC633');

  id(svg, 'snc-type', elem => elem.textContent = capitalize(props.badgeParams.type));

  id(svg, 'snc-univ1', elem => elem.textContent = props.badgeParams.univ1 ? capitalize(props.badgeParams.univ1) : '');
  id(svg, 'snc-univ2', elem => elem.textContent = props.badgeParams.univ2 ? capitalize(props.badgeParams.univ2) : '');

  id(svg, 'snc-year', elem => elem.setAttribute('xlink:href', year()));

  if (section?.value?.childNodes?.[0]) {
    section.value?.replaceChild(svg.documentElement, section.value.childNodes?.[0]);
  } else {
    section.value?.appendChild(svg.documentElement);
  }
  return false;
});
</script>
