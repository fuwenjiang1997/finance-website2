import type { IChartApi } from 'lightweight-charts'
import { defineStore } from 'pinia'
import { shallowRef, type TemplateRef } from 'vue'
import { createChart } from 'lightweight-charts'
import { ColorType } from 'lightweight-charts'

interface InitChartParams {
  chartRef: TemplateRef<HTMLElement>
  chartContainerRef: TemplateRef<HTMLElement>
}

export const useChartStore = defineStore('chartStore', () => {
  const chart = shallowRef<IChartApi>()

  const initChart = (params: InitChartParams) => {
    console.log('chartRef:', params.chartRef.value)
    const { chartRef, chartContainerRef } = params
    if (!chartRef.value || !chartContainerRef.value) {
      throw Error('chartRef 和 chartContainerRef 必须存在')
    }
    chart.value = createChart(chartRef.value, {
      width: chartContainerRef.value.clientWidth,
      height: chartContainerRef.value.clientHeight,
      layout: {
        attributionLogo: false,
        background: { type: ColorType.Solid, color: 'white' },
        textColor: 'black',
      },
      timeScale: {
        timeVisible: true, // 显示时间轴
        secondsVisible: false, // 默认不显示秒
      },
      localization: {
        locale: 'zh-CN', // 设置语言为中文
        dateFormat: 'yyyy-MM-dd', // 设置日期格式
        priceFormatter: (price: number) => price.toFixed(2), // 设置价格格式化函数
      },
    })
  }

  return {
    chart,
    initChart,
  }
})
