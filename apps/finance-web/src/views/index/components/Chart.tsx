import { defineComponent, onMounted, useTemplateRef, type PropType, toValue } from 'vue'
import type { ChartInstance } from '@/hooks/useChart'
import ChartCycle from './ChartCycle'
import { cycleListMap } from '@/utils/const'
import LightMenu from './LightMenu'
import { NButton, useNotification } from 'naive-ui'
import cn from 'classnames'
import { useChartStore } from '@/stores/chartStore'

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
    const chartStore = useChartStore()
    const notification = useNotification()

    onMounted(() => {
      props.chart.initChart({
        chartRef: chartRef,
        chartContainerRef: chartContainerRef,
      })
    })

    function onDeleteChart(id: string) {
      if (chartStore.chartList.length <= 1) {
        notification.warning({
          content: '至少需要有一个图表',
          duration: 3000,
        })
        return
      }
      chartStore.onDeleteChart(id)
    }

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
                [{props.index + 1}] {props.chart.code} ({props.chart.circle})
                {/* {cycleListMap[toValue(props.chart.circle)]?.label} ) */}
              </span>
            </div>
            <div class={'flex gap-2'}>
              {props.chart.kLineSimulation.isActriveKLineSimulation && (
                <NButton
                  type="primary"
                  size="tiny"
                  onClick={props.chart.kLineSimulation.exitKLineSimulation}
                >
                  退出k线模拟
                </NButton>
              )}

              <NButton type="primary" size="tiny" onClick={() => onDeleteChart(props.chart.id)}>
                <i class={'iconfont icon-close'}></i>
              </NButton>
            </div>
          </div>
        </div>

        <div class={'flex-1 relative'} ref="chartContainerRef">
          <div class={' absolute left-0 top-0 right-0 bottom-0 opacity-5'} ref="chartRef"></div>
        </div>
        <LightMenu chart={props.chart} chartContainerRef={chartContainerRef}></LightMenu>
        <ChartCycle chart={props.chart} class={''}></ChartCycle>
      </div>
    )
  },
})
