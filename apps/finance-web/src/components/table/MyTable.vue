<template>
  <div class="flex flex-col h-hull">
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
    <div class="flex-1 relative" :style="{ maxHeight: maxBodyHeight }">
      <div class="absolute left-0 top-0 w-full h-full overflow-y-scroll" ref="tableContainerRef">
        <table class="w-full table-fixed">
          <tbody class="">
            <tr v-if="!loading && data.length === 0">
              <td colspan="100%" class="text-center">
                <NEmpty class="mt-4" />
              </td>
            </tr>
            <template v-else>
              <tr v-for="(row, rowIndex) in renderData" :key="rowIndex" class="hover:bg-neutral-50"
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
  </div>
</template>

<script setup lang="ts">
import { NEmpty } from 'naive-ui';
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useScroll } from '@vueuse/core'

const {
  columns = [],
  data = [],
  loading,
  maxBodyHeight = '70vh',
} = defineProps(['columns', 'data', 'loading', 'maxBodyHeight'])

const STEP_COUNT = 100
const renderDataIndex = ref(STEP_COUNT)
const renderData = computed(() => {
  return data.slice(0, renderDataIndex.value)
})

const tableContainerRef = useTemplateRef<HTMLElement>('tableContainerRef')
const { arrivedState } = useScroll(tableContainerRef)

watch(() => arrivedState.bottom, () => {
  if (renderDataIndex.value < data.length) {
    renderDataIndex.value += STEP_COUNT
  }
})

defineEmits(['rowClick'])
</script>
