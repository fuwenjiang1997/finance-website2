import { computed, defineComponent, ref, toValue } from 'vue'
import AdminHeader from './components/header/AdminHeader'
import AdminSide from './components/AdminSide'
import Chart from './components/Chart'
import { useChartStore } from '@/stores/chartStore'
import { storeToRefs } from 'pinia'
import cn from 'classnames'

export default defineComponent({
  props: {
    chart: {
      type: String,
      required: true,
    },
  },
  setup() {
    const chartStore = useChartStore()
    const { chartList, activeChartId } = storeToRefs(chartStore)
    const hasFullScreen = ref(false)
    function onChangeFullScreen(v: boolean) {
      hasFullScreen.value = v
    }

    const layoutStyle = computed(() => {
      // 最多两行
      let colCount = 1
      let rowCount = 1
      if (chartList.value.length <= 2) {
        colCount = chartList.value.length
        rowCount = 1
      } else {
        colCount = Math.ceil(chartList.value.length / 2)
        rowCount = 2
      }

      return `grid-template-columns: repeat(${colCount}, minmax(0, 1fr));grid-template-rows: repeat(${rowCount}, minmax(0, 1fr));`
    })

    function setActiveChart(id: string) {
      activeChartId.value = id
    }

    return () => (
      <div class={'h-screen overflow-hidden flex flex-col bg-gray'}>
        <AdminHeader class={'shrink-0'}></AdminHeader>
        <div class={'flex overflow-hidden'} style="height: calc(100vh - 40px)">
          <AdminSide class={'shrink-0 py-2'}></AdminSide>
          <div class={'relative flex-1 h-full overflow-hidden p-1 bg-gray '}>
            <div
              class={cn(
                ' w-full h-full grid gap-1 overflow-hidden max-sm:!grid-cols-1 max-sm:!grid-rows-none',
                {
                  'max-sm:!overflow-y-hidden': hasFullScreen.value,
                  'max-sm:!overflow-y-scroll': !hasFullScreen.value,
                },
              )}
              style={layoutStyle.value}
            >
              {chartList.value.map((chart, index) => {
                return (
                  <Chart
                    chart={chart}
                    key={chart.id}
                    class={'min-h-[300px]'}
                    total={chartList.value.length}
                    onMouseenter={() => setActiveChart(chart.id)}
                    onChangeFullScreen={onChangeFullScreen}
                    index={index}
                    active={activeChartId.value === chart.id}
                  ></Chart>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  },
})
