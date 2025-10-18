import type {
  CandlestickData,
  IChartApi,
  Time,
  UTCTimestamp,
  WhitespaceData,
} from 'lightweight-charts'
import { createChart, ColorType } from 'lightweight-charts'
import { computed, ref, shallowReactive, shallowRef, watch, type TemplateRef } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { apiGetKLineData } from '@/http/api'
import dayjs from 'dayjs'
import vChart, { type VChart, type KLineData } from '@fuwenjiang1997/trading-view-chart'

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

export type TradingChartData = CandlestickData<Time> | WhitespaceData<Time>

// 可能有多个chart表，将chart提取出来
export function useChart() {
  const id = uuidv4()
  const chart = shallowRef<IChartApi>()
  const code = ref('')
  const name = ref('')
  const circle = ref('1d')
  const draw: { series: VChart | undefined } = {
    series: undefined,
  }

  const kLineData = shallowReactive<Map<string, TradingChartData[]>>(new Map())
  const currentDataKey = computed(() => `${code.value}_${circle.value}`)
  const kLineDataByCircle = computed(() => {
    if (kLineData.has(currentDataKey.value)) {
      return []
    }
    return kLineData.get(currentDataKey.value)
  })

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

    draw.series = vChart(chart.value)
  }

  async function getKlineData() {
    try {
      const _code = code.value
      const _circle = circle.value
      const res = await apiGetKLineData({
        symbol: _code,
        interval: _circle,
        startTime: 0,
        endTime: dayjs().valueOf(),
        limit: 1000,
      })

      if (Array.isArray(res)) {
        const d = res.map((item): CandlestickData => {
          return {
            time: dayjs(item.OpenTime).unix() as UTCTimestamp,
            open: item.Open,
            high: item.High,
            low: item.Low,
            close: item.Close,
          }
        })
        kLineData.set(`${_code}_${_circle}`, d)
        draw?.series?.kLine.setData(d)
      }
    } catch (error) {
      console.log('error:>>', error)
    }
  }

  watch([code, circle], ([_code, _circle]) => {
    if (_code && _circle) {
      getKlineData()
    }
  })

  const destory = () => {
    // todo 销毁这个chart
  }

  return {
    id,
    chart,
    code,
    name,
    circle,
    draw,
    kLineDataByCircle,
    initChart,
    destory,
    setCode,
    setCircle,
  }
}
