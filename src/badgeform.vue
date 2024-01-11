<template>
    <section id="configuration">
      <form>
        <label for="csvFile">CSV</label>
        <input type="file" @change="loadCSV" id="csvFile" accept=".csv" required>
      </form>
    </section>
</template>

<script lang="ts">
  import { parseBadges } from './badge-parsing';
  import Papa from 'papaparse';

  export default {
    methods: {
      loadCSV(e: any): void {
        const reader = new FileReader();
        reader.readAsText(e?.target?.files[0], 'UTF-8');
        reader.onload = (evt) => {
          const result = Papa.parse((evt?.target?.result as string).trim());
          const rawData = result.data as string[][];

          const columnsopts = (result.data[0] as string[])
            .filter(s => s)
            .map((text, value) => ({text, value}));

          const badges = parseBadges(rawData.slice(1), {
            firstname: 1 + (columnsopts.find((col) => col.text === 'Prénom')?.value ?? -1),
            lastname: 1 + (columnsopts.find((col) => col.text === 'Nom')?.value ?? -1),
            type: 1 + (columnsopts.find((col) => col.text === 'Tarif')?.value ?? -1),
            barcode: 1 + (columnsopts.find((col) => col.text === 'Codes-barres')?.value ?? -1),
            cmd: 1 + (columnsopts.find((col) => col.text === 'Commande')?.value ?? -1),
            meal: 1 + (columnsopts.find((col) => col.text.startsWith('Repas'))?.value ?? -1),
          });

          this.$emit('badges', badges);
        }
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
