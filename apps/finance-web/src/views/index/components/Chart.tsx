import { defineComponent, onMounted, useTemplateRef, type PropType, ref, toValue } from 'vue'
import type { ChartInstance } from '@/hooks/useChart'
import ChartCycle from './ChartCycle'
import LightMenu from './LightMenu'
import { NButton, useNotification } from 'naive-ui'
import cn from 'classnames'
import { useChartStore } from '@/stores/chartStore'
import ChartSet from './ChartSet'

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
    total: {
      type: Number,
      required: true,
    },
  },
  emits: {
    changeFullScreen: (v: boolean) => true,
  },
  setup(props, { emit }) {
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
      try {
        chartStore.onDeleteChart(id)
      } catch (error) {
        if (error instanceof Error && error?.message === 'Minimum1') {
          notification.warning({
            content: '至少需要有一个图表',
            duration: 3000,
          })
        }
      }
    }

    const isFull = ref(false)
    function onToggleFullScreen() {
      isFull.value = !isFull.value
      emit('changeFullScreen', isFull.value)
    }

    return () => (
      <div
        class={cn(
          'relative h-full flex flex-col pb-2 bg-white rounded overflow-hidden border border-transparent',
          {
            '!border-black ': props.active,
            '!absolute left-0 top-0 right-0 bottom-0 z-1': isFull.value,
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

              {props.total > 1 && (
                <NButton type="primary" size="tiny" onClick={onToggleFullScreen}>
                  <i
                    class={[
                      'iconfont',
                      !isFull.value ? 'icon-24gl-fullScreenEnter' : 'icon-24gl-fullScreenExit',
                    ]}
                  ></i>
                </NButton>
              )}

              {props.total > 1 && !isFull.value && (
                <NButton type="primary" size="tiny" onClick={() => onDeleteChart(props.chart.id)}>
                  <i class={'iconfont icon-close'}></i>
                </NButton>
              )}
            </div>
          </div>
        </div>

        <div class={'flex-1 relative'} ref="chartContainerRef">
          <div class={' absolute left-0 top-0 right-0 bottom-0 opacity-5'} ref="chartRef"></div>
        </div>

        <LightMenu chart={props.chart} chartContainerRef={chartContainerRef}></LightMenu>
        {props.chart.selectedDrawing && (
          <ChartSet chart={props.chart} chartContainerRef={chartContainerRef}></ChartSet>
        )}
        <ChartCycle chart={props.chart}></ChartCycle>
      </div>
    )
  },
})
