<template>
    <section id="configuration">
      <form>
        <label for="csvFile">CSV</label>
        <input type="file" @change="loadCSV" id="csvFile" accept=".csv" required>

        <label for="firstname">Prénom</label>
        <select id="firstname" v-model="state.firstname" @change="onChange">
          <option v-for="col in columnsopts" :key="col.value" :value="col.value">
            {{ col.text }}
          </option>
        </select>

        <label for="lastname">Nom</label>
        <select id="lastname" v-model="state.lastname" @change="onChange">
          <option v-for="col in columnsopts" :key="col.value" :value="col.value">
            {{ col.text }}
          </option>
        </select>

        <label for="type">Type (<code>attendee</code>, <code>staff</code>, <code>speaker</code>, <code>sponsor</code>)</label>
        <select id="type" v-model="state.type" @change="onChange">
          <option v-for="col in columnsopts" :key="col.value" :value="col.value">
            {{ col.text }}
          </option>
        </select>

        <label for="barcode">Code bare</label>
        <select id="barcode" v-model="state.barcode" @change="onChange">
          <option v-for="col in columnsopts" :key="col.value" :value="col.value">
            {{ col.text }}
          </option>
        </select>

        <label for="univ1">Université 1</label>
        <select id="univ1" v-model="state.univ1" @change="onChange">
          <option v-for="col in columnsopts" :key="col.value" :value="col.value">
            {{ col.text }}
          </option>
        </select>

        <label for="univ2">Université 2</label>
        <select id="univ2" v-model="state.univ2" @change="onChange">
          <option v-for="col in columnsopts" :key="col.value" :value="col.value">
            {{ col.text }}
          </option>
        </select>
      </form>
    </section>
</template>

<script lang="ts">
  import { reactive, ref } from 'vue';
  import { BadgeParams, ColumnsConfig } from './models';
  import Papa from 'papaparse';

  type Column = {value: number, text: string}

  export default {
    setup() {
      const state: ColumnsConfig = reactive({
          firstname: 0,
          lastname: 0,
          type: 0,
          barcode: 0,
      });
      const columnsopts = ref([] as Column[]);
      const rawData: string[][] = [];

      return {
        state,
        columnsopts,
        rawData,
      };
    },
    methods: {
      loadCSV(e: any): void {
        const reader = new FileReader();
        reader.readAsText(e?.target?.files[0], 'UTF-8');
        reader.onload = (evt) => {
            this.columnsopts.splice(0, this.columnsopts.length);
            const result = Papa.parse((evt?.target?.result as string).trim());
            this.rawData = result.data as string[][];

            (result.data[0] as string[])
              .filter(s => s)
              .forEach((text, value) => this.columnsopts.push({text, value}));
        }
      },
      onChange() {
        const badges: BadgeParams[] = this.rawData
          .filter((_, idx) => idx > 0)
          .map((line) => ({
            firstname: line[this.state.firstname],
            lastname: line[this.state.lastname],
            barcode: line[this.state.barcode],
            type: line[this.state.type] as BadgeParams['type'],
            univ1: this.state.univ1 ? line[this.state.univ1] : undefined,
            univ2: this.state.univ2 ? line[this.state.univ2] : undefined,
          } satisfies BadgeParams));

        this.$emit('badges', badges);
      }
    }
  };
</script>

<style scoped>
form {
  display: grid;
  grid-template-columns: 20em auto;
  flex: 1;
  width: 50%;
}
</style>
