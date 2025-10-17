import { defineComponent, onMounted, ref, useTemplateRef } from 'vue'
import { useChartStore } from '@/stores/chartStore'
import { storeToRefs } from 'pinia'
import ChartCycle from './ChartCycle'

export default defineComponent({
  setup() {
    const chartStore = useChartStore()
    const { chart } = storeToRefs(chartStore)
    const chartContainerRef = useTemplateRef<HTMLDivElement>('chartContainerRef')
    const chartRef = useTemplateRef<HTMLDivElement>('chartRef')

    onMounted(() => {
      // chartStore.initChart({
      //   chartRef: chartRef,
      //   chartContainerRef: chartContainerRef,
      // })
    })

    return () => (
      <div class={' h-full flex flex-col bg-white rounded'}>
        <div class={'flex-1'} ref="chartContainerRef">
          <div ref="chartRef"></div>
        </div>
        <ChartCycle class={'mt-4'}></ChartCycle>
      </div>
    )
  },
})
