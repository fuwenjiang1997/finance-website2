import type { IChartApi } from 'lightweight-charts'
import { createChart, ColorType } from 'lightweight-charts'
import { ref, shallowReactive, shallowRef, type TemplateRef } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { apiGetKLineData } from '@/http/api'

export interface UiInitChartParams {
  chartRef: TemplateRef<HTMLElement>
  chartContainerRef: TemplateRef<HTMLElement>
}

export interface InitChartParams {
  code?: string
  chartRef: TemplateRef<HTMLElement>
  chartContainerRef: TemplateRef<HTMLElement>
}
export type ChartInstance = ReturnType<typeof useChart>

// 可能有多个chart表，将chart提取出来
export function useChart() {
  const id = uuidv4()
  const chart = shallowRef<IChartApi>()
  const code = ref('')
  const name = ref('')
  const circle = ref('')
  const kLineData = shallowReactive(new Map())

  // 设置代码
  const setCode = (data: { code: string; name: string }) => {
    code.value = data.code
    name.value = data.name
  }
  // 设置周期
  const setCircle = (v: string) => {
    circle.value = v
  }

  const initChart = (params: InitChartParams) => {
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

  async function getKlineData() {
    try {
      const _circle = circle.value
      const res = await apiGetKLineData({})
      console.log(_circle, res)
    } catch (error) {
      console.log('error:>>', error)
    }
  }

  const destory = () => {
    // todo 销毁这个chart
  }

  return {
    id,
    chart,
    code,
    name,
    initChart,
    destory,
    setCode,
    setCircle,
  }
}
