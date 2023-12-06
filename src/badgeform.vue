<template>
    <section id="configuration">
      <form>
        <label for="csvFile">CSV</label>
        <input type="file" @change="loadCSV" id="csvFile" accept=".csv" required>
      </form>
    </section>
</template>

<script lang="ts">
  import { BadgeParams } from './models';
  import { typeMapping } from './utils';
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

          const firstname = 1 + (columnsopts.find((col) => col.text === 'Prénom')?.value ?? -1);
          const lastname = 1 + (columnsopts.find((col) => col.text === 'Nom')?.value ?? -1);
          const typeCol = 1 + (columnsopts.find((col) => col.text === 'Tarif')?.value ?? -1);
          const barcode = 1 + (columnsopts.find((col) => col.text === 'Codes-barres')?.value ?? -1);
          const cmdCol = 1 + (columnsopts.find((col) => col.text === 'Commande')?.value ?? -1);

          const commands: Map<string, BadgeParams> = rawData.slice(1).reduce(
            (a: Map<string, BadgeParams>, b: string[]) => {
              const cmd = b[cmdCol]
              const tarif = b[typeCol];
              const univ1 = tarif.startsWith('Uam') ? tarif.substring(7) : undefined;
              const univ2 = tarif.startsWith('Upm') ? tarif.substring(7) : undefined;
              const type = typeMapping(tarif);
              const current = a.get(cmd);
              if (current) {
                if (univ1) {
                  current.univ1 = univ1;
                } else if (univ2) {
                  current.univ2 = univ2;
                } else {
                  current.type = type;
                }
              } else {
                a.set(cmd, {
                  firstname: b[firstname],
                  lastname: b[lastname],
                  type: type,
                  barcode: b[barcode],
                  univ1: univ1,
                  univ2: univ2,
                })
              }
              return a;
            },
            new Map<string, BadgeParams>()
          );

          this.$emit('badges', Array.from(commands.values()));
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
