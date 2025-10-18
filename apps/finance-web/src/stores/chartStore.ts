import type { IChartApi } from 'lightweight-charts'
import { defineStore } from 'pinia'
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { useChart } from '@/hooks/useChart'
import type { ChartInstance } from '@/hooks/useChart'
import { type RequestError, apiGetStockList } from '@/http/api'
// import { useNotification } from 'naive-ui'

export interface CodeSymbol {
  name: string
  code: string
}

export const MAX_CHART_COUNT = 8

export const useChartStore = defineStore('chartStore', () => {
  const chart = shallowRef<IChartApi>()
  const chartList = reactive<ChartInstance[]>([])
  // const notification = useNotification()

  const onAddChartByCode = (data: CodeSymbol) => {
    const chartItem = useChart()
    chartItem.setCode(data)
    chartList.push({
      ...chartItem,
      chart: chartItem.chart.value,
      code: chartItem.code.value,
      name: chartItem.name.value,
      circle: chartItem.circle.value,
      kLineDataByCircle: chartItem.kLineDataByCircle.value,
    })
  }

  function onDeleteChart(id: string) {
    const index = chartList.findIndex((item) => item.id === id)
    if (index !== -1) {
      const chart = chartList[index]
      chart?.destory()
      chartList.splice(index, 1)
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

        if (chartList.length === 0 && data.length > 0) {
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
    onAddChartByCode,
    onDeleteChart,
  }
})
