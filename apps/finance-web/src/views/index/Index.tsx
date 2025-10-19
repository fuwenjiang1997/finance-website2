import { computed, defineComponent, isRef, ref, toRef } from 'vue'
import AdminHeader from './components/AdminHeader'
import AdminSide from './components/AdminSide'
import Chart from './components/Chart'
import { useChartStore } from '@/stores/chartStore'
import { storeToRefs } from 'pinia'

export default defineComponent({
  props: {
    // 字符串类型，必需
    chart: {
      type: String,
      required: true,
    },
  },
  setup() {
    const chartStore = useChartStore()
    const { chartList, activeChartId } = storeToRefs(chartStore)

    // const colCount = ref(1)

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
      console.log(id)
      activeChartId.value = id
    }

    return () => (
      <div class={'h-screen overflow-hidden flex flex-col bg-gray'}>
        <AdminHeader class={'shrink-0'}></AdminHeader>
        <div class={'flex overflow-hidden'} style="height: calc(100vh - 40px)">
          <AdminSide class={'shrink-0 py-2'}></AdminSide>
          <div
            class={'flex-1 h-full grid gap-1 p-1 bg-gray overflow-hidden max-sm:!grid-cols-1'}
            style={layoutStyle.value}
          >
            {chartList.value.map((chart, index) => {
              return (
                <Chart
                  chart={chart}
                  onMouseenter={() => setActiveChart(chart.id)}
                  index={index}
                  active={activeChartId.value === chart.id}
                ></Chart>
              )
            })}
          </div>
        </div>
      </div>
    )
  },
})
