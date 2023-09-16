<template>
    <div id="example-section">
      <h2>Exemples (on <span class="badgesTotal">{{ badges?.length }}</span> badges)</h2>
      <button @click="refreshExamples">Refresh</button>
    </div>
    <section v-if="badges">
      <Suspense>
        <main>
          <Badge :badgeParams="pickBadge()"></Badge>
          <Badge :badgeParams="pickBadge()"></Badge>
          <Badge :badgeParams="pickBadge()"></Badge>
        </main>
      </Suspense>
    </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  badges: Array<BadgeParams>
}>();

const choosedExamples = reactive({
  picked: [] as number[],
});

const examples = computed(() => {
  console.log('coucou', choosedExamples.picked)
  const a = (choosedExamples.picked || [0 , 0, 0].map(() => Math.floor(Math.random() * (props.badges?.length ?? 0))));
  return a.flatMap((idx) => props.badges?.[idx] ? [props.badges?.[idx]] : []);
});
</script>

<script lang="ts">
import { computed, reactive } from 'vue'
import { BadgeParams } from './models';
import Badge from './Badge.vue';

  export default {
    components: { Badge },
    methods: {
      refreshExamples(): void {
        choosedExamples.picked = [0 , 0, 0]
          .map(() => Math.floor(Math.random() * (this.badges?.length ?? 0)));
      },
      pickBadge(): BadgeParams {
        return this.badges[Math.floor(Math.random() * (this.badges?.length ?? 0))];
      }
    }
  };

</script>

<style>
main {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
main > div {
  display: none;
}
#example {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
}

#configuration {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 10px;
}

#example-section {
    display: flex;
    flex-direction: row;
    gap: 5em;
    align-items: center;
}
</style>
