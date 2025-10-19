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
import { useWithLoading } from './useWithLoading'
import { KLineCircle } from '@/utils/const'
// import { useResizeObserver } from '@vueuse/core'

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
  const circle = ref<KLineCircle>(KLineCircle.D1)
  const noMoreKLineData = ref<{ [k: string]: boolean }>({})
  const draw: { series: VChart | undefined } = {
    series: undefined,
  }
  const kLineData = shallowReactive<Map<string, TradingChartData[]>>(new Map())
  const currentDataKey = computed(() => `${circle.value}`)
  const kLineDataByCircle = computed(() => {
    if (!kLineData.has(currentDataKey.value)) {
      return []
    }
    return kLineData.get(currentDataKey.value) || []
  })

  // 设置代码
  const setCode = (data: { code: string; name: string }) => {
    code.value = data.code
    name.value = data.name
  }
  // 设置周期
  const setCircle = (v: KLineCircle) => {
    circle.value = v
  }

  const initChart = (params: InitChartParams) => {
    const { chartRef, chartContainerRef } = params
    if (!chartRef.value || !chartContainerRef.value) {
      throw Error('chartRef 和 chartContainerRef 必须存在')
    }
    chart.value = createChart(chartRef.value, {
      autoSize: true,
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

    draw.series = vChart(chart.value, { kLineData: kLineDataByCircle })
    subscribeToRangeChanges()
  }

  const [getKlineData, getKlineDataLoading] = useWithLoading<
    [{ startTime?: number; endTime?: number }]
  >(async (done, ...[params]) => {
    try {
      const _code = code.value
      const _circle = circle.value
      const k = `${_circle}`
      const _noMoreData = noMoreKLineData.value[_circle] || false
      const oldData = kLineData.get(k) || []

      if (
        _noMoreData &&
        params?.startTime &&
        oldData.length > 0 &&
        params.startTime < (oldData[0]?.time as number)
      ) {
        return
      }
      const _startTime = params?.startTime || 0
      const res = await apiGetKLineData({
        symbol: _code,
        interval: _circle,
        startTime: getStartTime(_circle, _startTime),
        endTime: params?.endTime || dayjs().valueOf(),
        limit: 1000,
      })

      if (Array.isArray(res)) {
        const d = res.map((item): CandlestickData => {
          return {
            time: dayjs(item.OpenTime).unix() as UTCTimestamp, // time 是秒
            open: item.Open,
            high: item.High,
            low: item.Low,
            close: item.Close,
          }
        })
        if (oldData[0]?.time && d[0]?.time && d[0].time > oldData[0].time) {
          return
        }
        const firstData = d[0]
        if (firstData?.time === oldData?.[0]?.time) {
          noMoreKLineData.value[_circle] = true
        }
        if (circle.value !== _circle || code.value !== _code) return
        kLineData.set(k, d)
        // draw?.series?.kLine.setData(kLineDataByCircle.value)
        done(d)
      }
    } catch (error) {
      done()
      console.log('error:>>', error)
    }
  })

  function subscribeToRangeChanges() {
    if (!chart.value) return
    const timeScale = chart.value.timeScale()
    timeScale.subscribeVisibleLogicalRangeChange(async (logicalRange) => {
      if (logicalRange === null || getKlineDataLoading.value) return

      const BUFFER = 10

      if (logicalRange.from < BUFFER) {
        // startTime 是秒
        const startTime = (kLineDataByCircle.value[0]?.time as number) || dayjs().unix()
        // const endTime = kLineDataByCircle.value.at(-1)?.time || dayjs().valueOf()

        await getKlineData({
          startTime: getStartTime(circle.value, (startTime as number) * 1000),
          // endTime: endTime as number,
        })
      }
    })
  }

  function setDefaultVisibleRange(count?: number, params?: { from: number; to: number }) {
    if (params) {
      chart.value?.timeScale().setVisibleLogicalRange(params)
      return
    }
    if (count !== undefined) {
      const max = kLineDataByCircle.value.length
      chart.value?.timeScale().setVisibleLogicalRange({ from: Math.max(0, max - count), to: max })
      return
    }
    chart.value?.timeScale().fitContent()
  }

  function getStartTime(_circle: KLineCircle, lastStartTime?: number): number {
    console.log('lastStartTimelastStartTime:', lastStartTime)
    const t = lastStartTime ? dayjs(lastStartTime) : dayjs()

    const PerCount = 120

    const handler: { [k in KLineCircle]: () => number } = {
      [KLineCircle.m1]: () => {
        return t.subtract(PerCount, 'm').valueOf()
      },
      [KLineCircle.m5]: () => {
        return t.subtract(PerCount * 5, 'm').valueOf()
      },
      [KLineCircle.m15]: () => {
        return t.subtract(PerCount * 15, 'm').valueOf()
      },
      [KLineCircle.m30]: () => {
        return t.subtract(PerCount * 30, 'm').valueOf()
      },
      [KLineCircle.H1]: () => {
        return t.subtract(PerCount, 'h').valueOf()
      },
      [KLineCircle.H4]: () => {
        return t.subtract(PerCount * 4, 'h').valueOf()
      },
      [KLineCircle.D1]: () => {
        return t.subtract(PerCount, 'd').valueOf()
      },
      [KLineCircle.W1]: () => {
        return t.subtract(PerCount * 7, 'd').valueOf()
      },
      [KLineCircle.M1]: () => {
        return t.subtract(PerCount, 'M').valueOf()
      },
    }

    return handler[_circle]?.() || 0
  }

  watch([code, circle], async ([_code, _circle]) => {
    if (!_code || !_circle) return

    if (kLineDataByCircle.value.length === 0) {
      try {
        await getKlineData({ startTime: 0 })
      } catch (error) {
        console.error('error:', error)
      }
    } else {
      // draw?.series?.kLine.setData(kLineDataByCircle.value)
    }
    setDefaultVisibleRange(120)
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
