import { defineComponent, onMounted, useTemplateRef, type PropType, toValue } from 'vue'
import type { ChartInstance } from '@/hooks/useChart'
import ChartCycle from './ChartCycle'
import { cycleListMap } from '@/utils/const'
import LightMenu from './LightMenu'
import { NButton } from 'naive-ui'
import cn from 'classnames'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
    active: {
      type: Boolean,
    },
    index: {
      type: Number,
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
      <div
        class={cn(
          'h-full flex flex-col pb-2 bg-white rounded overflow-hidden border border-transparent',
          {
            '!border-black ': props.active,
          },
        )}
      >
        <div class={'bg-gray-50'}>
          <div class={'flex justify-between items-center h-8 px-2 bg-white'}>
            <div>
              <span>
                [{props.index}] {props.chart.code} ({props.chart.circle})
                {/* {cycleListMap[toValue(props.chart.circle)]?.label} ) */}
              </span>
            </div>
            <div>
              {props.chart.kLineSimulation.isActriveKLineSimulation && (
                <NButton
                  type="primary"
                  size="small"
                  onClick={props.chart.kLineSimulation.exitKLineSimulation}
                >
                  退出k线模拟
                </NButton>
              )}
            </div>
          </div>
        </div>

        <div class={'flex-1 relative'} ref="chartContainerRef">
          <div class={' absolute left-0 top-0 right-0 bottom-0 opacity-3'} ref="chartRef"></div>
        </div>
        <LightMenu chart={props.chart} chartContainerRef={chartContainerRef}></LightMenu>
        <ChartCycle chart={props.chart} class={''}></ChartCycle>
      </div>
    )
  },
})
