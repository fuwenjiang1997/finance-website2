import { defineComponent, onMounted, useTemplateRef, type PropType } from 'vue'
import type { ChartInstance } from '@/hooks/useChart'
import ChartCycle from './ChartCycle'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
  },
  setup(props) {
    const chartContainerRef = useTemplateRef<HTMLDivElement>('chartContainerRef')
    const chartRef = useTemplateRef<HTMLDivElement>('chartRef')

    onMounted(() => {
      console.log('prosp:', props.chart)
      props.chart.initChart({
        chartRef: chartRef,
        chartContainerRef: chartContainerRef,
      })
    })

    return () => (
      <div class={'h-full flex flex-col bg-white rounded'}>
        <div class={'flex-1'} ref="chartContainerRef">
          <div ref="chartRef"></div>
        </div>
        <ChartCycle chart={props.chart} class={'mt-4'}></ChartCycle>
      </div>
    )
  },
})
