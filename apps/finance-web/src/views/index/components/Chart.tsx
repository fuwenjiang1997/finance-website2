import { defineComponent, onMounted, useTemplateRef, type PropType, ref, toValue } from 'vue'
import type { ChartInstance } from '@/hooks/useChart'
import ChartCycle from './ChartCycle'
import { cycleListMap } from '@/utils/const'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
    active: {
      type: Boolean,
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
      <div class={'h-full flex flex-col pb-2 bg-white rounded overflow-hidden'}>
        <div class={'bg-gray-50'}>
          <div class={'flex items-center h-8 px-4 bg-white'}>
            <span>
              {props.chart.code}( {cycleListMap[toValue(props.chart.circle)]?.label} )
            </span>
          </div>
        </div>

        <div class={'flex-1 relative'} ref="chartContainerRef">
          <div class={' absolute left-0 top-0 right-0 bottom-0'} ref="chartRef"></div>
        </div>
        <ChartCycle chart={props.chart} class={''}></ChartCycle>
      </div>
    )
  },
})
