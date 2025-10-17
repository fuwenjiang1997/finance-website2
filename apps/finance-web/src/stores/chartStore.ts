import type { IChartApi } from 'lightweight-charts'
import { defineStore } from 'pinia'
import { reactive, shallowReactive, shallowRef } from 'vue'
import { useChart } from '@/hooks/useChart'
import type { ChartInstance, UiInitChartParams } from '@/hooks/useChart'

export const useChartStore = defineStore('chartStore', () => {
  const chart = shallowRef<IChartApi>()
  const chartList = reactive<Map<string, ChartInstance>>(new Map())

  const onAddChartByCode = (code: string) => {
    const chartItem = useChart()
    chartItem.setCode(code)
    chartList.set(chartItem.id, {
      ...chartItem,
      chart: chartItem.chart.value,
      code: chartItem.code.value,
    })
  }

  function onDeleteChart(id: string) {
    if (chartList.has(id)) {
      const chart = chartList.get(id)
      chart?.destory()
      chartList.delete(id)
    }
  }

  return {
    chart,
    onAddChartByCode,
    chartList,
    onDeleteChart,
  }
})
