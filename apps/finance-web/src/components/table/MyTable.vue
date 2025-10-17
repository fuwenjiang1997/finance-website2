<template>
  <div class="flex flex-col overflow-hidden">
    <div class="shrink-0">
      <table class="w-full">
        <thead class="sticky top-0 bg-neutral-100">
          <tr>
            <th v-for="(col, colIndex) in columns" :key="col.title || col.headSlotName"
              class="py-2 text-start border-b">
              <slot v-if="col.headSlotName" :name="col.headSlotName" :column="col" :colIndex="colIndex" />
              <template v-else>
                {{ col.title }}
              </template>
            </th>
          </tr>
        </thead>
      </table>
    </div>
    <div class="flex-1 overflow-y-scroll" :style="{ maxHeight: maxBodyHeight }">
      <table class="w-full h-full table-fixed">
        <tbody class="">
          <tr v-if="!loading && data.length === 0">
            <td colspan="100%" class="text-center">
              <n-empty class="mt-4" />
            </td>
          </tr>
          <template v-else>
            <tr v-for="(row, rowIndex) in data" :key="rowIndex" class="hover:bg-neutral-50"
              @click="$emit('rowClick', row, rowIndex)">
              <td v-for="(col, colIndex) in columns" :key="colIndex" class="py-2 border-b border-b-neutral-300">
                <slot v-if="col.slotName" :name="col.slotName" :record="row" :rowIndex="rowIndex" :column="col"
                  :columnIndex="colIndex" />
                <template v-else>
                  {{ row[col.dataIndex] }}
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  columns = [],
  data = [],
  loading,
  maxBodyHeight = '70vh',
} = defineProps(['columns', 'data', 'loading', 'maxBodyHeight'])

defineEmits(['rowClick'])
</script>
