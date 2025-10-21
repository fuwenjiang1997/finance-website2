import type { IChartApi } from 'lightweight-charts'
import { defineStore } from 'pinia'
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'
import { useChart } from '@/hooks/useChart'
import type { ChartInstance } from '@/hooks/useChart'
import { type RequestError, apiGetStockList } from '@/http/api'
import { useMagicKeys, onKeyStroke } from '@vueuse/core'
import { useDrawPlugin } from '@/hooks/useDrawPlugin'
// import { useNotification } from 'naive-ui'

export interface CodeSymbol {
  name: string
  code: string
}

export const MAX_CHART_COUNT = 8

export const useChartStore = defineStore('chartStore', () => {
  const chart = shallowRef<IChartApi>()
  const chartList = ref<ChartInstance[]>([])
  const activeChartId = ref()
  const activeChart = computed(() => {
    const index = chartList.value.findIndex((item) => item.id === activeChartId.value)
    return chartList.value[index]
  })
  const { activePlugin, selectedPluginsMap, pluginsInfo } = useDrawPlugin()
  useMagicKeys() // 跟踪所有按键状态

  /** k线模拟，下一个 */
  onKeyStroke('ArrowRight', () => {
    activeChart.value?.kLineSimulation.simulationHandler.next()
  })
  /** k线模拟，上一个 */
  onKeyStroke('ArrowLeft', () => {
    activeChart.value?.kLineSimulation.simulationHandler.pre()
  })

  const onAddChartByCode = (data: CodeSymbol) => {
    const chartItem = useChart()
    chartItem.setCode(data)
    chartList.value.push(chartItem)
  }

  function onDeleteChart(id: string) {
    const index = chartList.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      const chart = chartList[index]
      chart?.destory()
      chartList.value.splice(index, 1)
    }
  }

  const codeSymbolList = ref<CodeSymbol[]>([])
  async function getCodeSymbolList() {
    try {
      const res = await apiGetStockList<{ [k: string]: string }>()
      if (typeof res === 'object' && res !== null) {
        const keys = Object.keys(res)
        const data = keys.map((k): CodeSymbol => {
          return {
            code: k,
            name: res[k] as string,
          }
        })
        codeSymbolList.value = data

        let defaultCodeIndex = data.findIndex((item) => item.code === 'BTCUSDT')
        if (defaultCodeIndex === -1) {
          defaultCodeIndex = 0
        }

        if (chartList.value.length === 0 && data.length > 0) {
          onAddChartByCode(data[defaultCodeIndex] as CodeSymbol)
        }
      }
    } catch (error) {
      // notification.error({
      //   content: (error as RequestError)?.message || '获取列表失败',
      // })
    }
  }

  onMounted(() => {
    getCodeSymbolList()
  })

  return {
    chart,
    chartList,
    codeSymbolList,
    activeChartId,
    onAddChartByCode,
    onDeleteChart,
    activePlugin,
    selectedPluginsMap,
    pluginsInfo,
  }
})
