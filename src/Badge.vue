<template>
  <div class="hack">{{ badge || 'toto'}}</div>
  <section ref="section" class="svg">
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BadgeParams } from './models';
import { id, QRCODE_OPTS, TYPES, year, capitalize, limit } from './utils';
import QRCode from 'qrcode';

const props = defineProps<{
  badgeParams: BadgeParams
}>();

const section = ref<HTMLElement | null>(null);

const response = await fetch('./badge.svg')
let svgStr = await response.text();

const badge = computed(() => {
  if (!props.badgeParams || !props.badgeParams.type) return false;

  const svg = new DOMParser().parseFromString(svgStr, 'image/svg+xml');

  id(svg, 'snc-firstname', elem => elem.textContent = capitalize(props.badgeParams.firstname));
  id(svg, 'snc-lastname', elem => elem.textContent = capitalize(props.badgeParams.lastname));

  if (props.badgeParams?.barcode?.trim()) {
    QRCode.toDataURL(props.badgeParams.barcode, QRCODE_OPTS, (err: any, url: string) => {
      id(svg, 'snc-barcode', elem => elem.setAttribute('xlink:href', url));
    });
  }

  id(svg, 'snc-type-background', elem => elem.style.fill = TYPES[props.badgeParams.type ?? 'attendee']?.color ?? '#3FC633');

  id(svg, 'snc-type', elem => elem.textContent = capitalize(props.badgeParams.type ?? 'attendee'));

  id(svg, 'snc-univ1', elem => elem.textContent = props.badgeParams.univ1 ? limit(props.badgeParams.univ1, 47) : '');
  id(svg, 'snc-univ2', elem => elem.textContent = props.badgeParams.univ2 ? limit(props.badgeParams.univ2, 47) : '');

  id(svg, 'snc-year', elem => elem.setAttribute('xlink:href', year()));

  if (props.badgeParams.meal !== 'vege') {
    svg.getElementById('vege')?.remove();
  }

  if (section?.value?.childNodes?.[0]) {
    section.value?.replaceChild(svg.documentElement, section.value.childNodes?.[0]);
  } else {
    section.value?.appendChild(svg.documentElement);
  }
  return false;
});
</script>

<style>
section.svg > *{
  background-color: white;
}
div.hack {
  display: none;
}
</style>