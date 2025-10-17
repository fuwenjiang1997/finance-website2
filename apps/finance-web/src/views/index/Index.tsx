import { computed, defineComponent, ref } from 'vue'
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
    const { chartList } = storeToRefs(chartStore)

    const colCount = ref(2)

    const layoutStyle = computed(() => {
      const rows = 1 // Math.ceil(Math.max(1, chartList.value.length) / colCount.value)
      return `grid-template-columns: repeat(${colCount.value}, minmax(0, 1fr));grid-template-rows: repeat(${rows}, minmax(0, 1fr));`
    })

    return () => (
      <div class={'h-screen overflow-hidden flex flex-col bg-gray'}>
        <AdminHeader class={'shrink-0'}></AdminHeader>
        <div class={'flex-1 flex'}>
          <AdminSide class={'shrink-0 py-2'}></AdminSide>
          <div
            class={'flex-1 grid gap-1 p-1 bg-gray overflow-hidden max-sm:!grid-cols-1'}
            style={layoutStyle.value}
          >
            {chartList.value.map((chart) => {
              console.log(chart)
              return <Chart chart={chart}></Chart>
            })}
          </div>
        </div>
      </div>
    )
  },
})
