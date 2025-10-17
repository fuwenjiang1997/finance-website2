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

export const useChartStore = defineStore('chartStore', () => {
  const chart = shallowRef<IChartApi>()
  const chartList = reactive<Map<string, ChartInstance>>(new Map())
  // const notification = useNotification()

  const onAddChartByCode = (data: CodeSymbol) => {
    const chartItem = useChart()
    chartItem.setCode(data)
    chartList.set(chartItem.id, {
      ...chartItem,
      chart: chartItem.chart.value,
      code: chartItem.code.value,
      name: chartItem.name.value,
    })
  }

  function onDeleteChart(id: string) {
    if (chartList.has(id)) {
      const chart = chartList.get(id)
      chart?.destory()
      chartList.delete(id)
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
