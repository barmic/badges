<template>
  <h1>Badge generator</h1>
  <section>
    <p>
      On prend un fichier CSV dont la première ligne doit contenir le nom des colonnes et qui une collone pour chaque champ du badge.
      La collone pour le <b>type</b> doit contenir les valeurs : <code>attendee</code>, <code>staff</code>, <code>speaker</code>, <code>sponsor</code>.
    </p>
  </section>
  <Badgeform @badges="captureBadges"></Badgeform>
  <Example :badges="badges"></Example>
  <Export :badges="badges"></Export>
</template>

<script lang="ts">
  import Badgeform from './badgeform.vue';
  import Example from './Example.vue';
  import Export from './Export.vue';
  import { BadgeParams, ColumnsConfig } from './models';

  export default {
    components: { Badgeform, Example, Export },
    data() {
      let badges: BadgeParams[] = [];
      return {
        badges,
      };
    },
    methods: {
      captureBadges(badges: BadgeParams[]) {
        this.badges = badges;
      }
    }
  };
</script>
