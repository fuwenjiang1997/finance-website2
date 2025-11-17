import type {
  CandlestickData,
  IChartApi,
  ISeriesApi,
  Time,
  UTCTimestamp,
  WhitespaceData,
} from 'lightweight-charts'
import { createChart, ColorType } from 'lightweight-charts'
import { computed, ref, shallowReactive, shallowRef, watch, type Ref, type TemplateRef } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { apiGetKLineData, type apiGetKLineDataReturn } from '@/http/api'
import dayjs from 'dayjs'
import vChart, { type VChart } from '@fuwenjiang1997/trading-view-chart'
import { useWithLoading } from './useWithLoading'
import { KLineCircle } from '@/utils/const'
import { useKLineSimulation } from './useKLineSimulation'
import { useResizeObserver } from '@vueuse/core'
import type { DrawInfoData } from './useDrawPlugin'
import { useDrawingManager } from './useDrawingManager'
import { getTpFromMouseEvent, type KLineIndexData } from '@fuwenjiang1997/draw-plugin'
import { type UseDrawPluginRes } from './useDrawPlugin'
import { useDrawingIndexManager } from './useDrawIndeManager'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

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
export interface UserChartParams {
  uiActivePlugin: Ref<DrawInfoData | undefined>
  uiPluginMap: Ref<{ [k: string]: DrawInfoData }>
}

export interface ChartSetConfig {
  upColor: string
  downColor: string
}

export type ChartSetConfigFnParams = Partial<ChartSetConfig>

// 可能有多个chart表，将chart提取出来
export function useChart({ drawPluginHook }: { drawPluginHook: UseDrawPluginRes }) {
  const id = uuidv4()
  const chart = shallowRef<IChartApi>()
  const code = ref('')
  const name = ref('')
  const circle = ref<KLineCircle>(KLineCircle.D1)
  const noMoreKLineData = ref<{ [k: string]: boolean }>({})
  const draw: { series: VChart | undefined } = {
    series: undefined,
  }
  const appStore = useAppStore()
  const { uiColor } = storeToRefs(appStore)

  const theChartContainerRef = shallowRef<HTMLElement | null>()
  const theChartRef = shallowRef<HTMLElement | null>()
  const kLineOriginData = shallowReactive<Map<string, apiGetKLineDataReturn[]>>(new Map())
  const kLineData = shallowReactive<Map<string, TradingChartData[]>>(new Map())
  const currentDataKey = computed(() => `${circle.value}`)
  const kLineSimulation = useKLineSimulation()
  const kLineDataByCircle = computed(() => {
    if (!kLineData.has(currentDataKey.value)) {
      return []
    }
    // 获取模拟k线数据
    return kLineSimulation.getSimulationKLineData(kLineData.get(currentDataKey.value) || [])
  })
  const kLineOriginDataByCircle = computed(() => {
    return kLineOriginData.get(currentDataKey.value) || []
  })

  // 指标数据
  const kLineIndexDataByCircle = computed((): KLineIndexData => {
    const m: KLineIndexData = {
      closes: <number[]>[],
      opens: <number[]>[],
      highs: <number[]>[],
      lows: <number[]>[],
      times: <number[]>[],
      openTimes: <number[]>[],
      volume: <number[]>[],
    }

    kLineOriginDataByCircle.value.forEach((item) => {
      m.closes.push(item.Close)
      m.highs.push(item.High)
      m.lows.push(item.Low)
      m.times.push(dayjs(item.CloseTime).unix())
      m.openTimes.push(dayjs(item.OpenTime).unix())
      m.volume.push(item.Volume)
      m.opens.push(item.Open)
    })
    return m
  })

  const {
    init: initPlugin,
    destory: destoryDrawingManager,
    clearAllDrawings,
    selectedDrawing,
    deleteDraw,
  } = useDrawingManager({ drawPluginHook })

  const {
    init: initIndex,
    renderIndexList,
    renderIndexNameList,
    addIndex,
    setIndex,
    removeIndex,
  } = useDrawingIndexManager(kLineIndexDataByCircle, { colors: uiColor })

  watch(
    uiColor,
    (newColor) => {
      draw.series?.setColor(newColor)
      renderIndexList.value.forEach((item) => {
        item.setColor(newColor)
      })
    },
    { deep: true, flush: 'post' },
  )

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

    draw.series = vChart(chart.value, {
      kLineData: kLineDataByCircle,
      kLineOriginData: kLineOriginDataByCircle,
      color: uiColor.value,
    })
    theChartContainerRef.value = params.chartContainerRef.value
    theChartRef.value = params.chartRef.value

    const kLineSeries = draw.series.kLine.getSeries()
    if (kLineSeries) {
      initPlugin({
        chart: chart.value,
        kLineSeries: kLineSeries as ISeriesApi<'Candlestick'>,
        chartContainer: chartContainerRef.value,
      })

      initIndex({
        chart: chart.value,
        kLineSeries: kLineSeries as ISeriesApi<'Candlestick'>,
        chartContainer: chartContainerRef.value,
      })
    }
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
      const oldFisrtDataTime = oldData[0]?.time ? (oldData[0].time as number) : undefined
      if (
        _noMoreData ||
        (params?.startTime && oldFisrtDataTime && params.startTime >= oldFisrtDataTime * 1000)
      ) {
        done()
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

      if (Array.isArray(res) && res.length > 0) {
        if (oldFisrtDataTime) {
          const repeatStartIndex = res.findIndex((item) => {
            return dayjs(item.OpenTime).valueOf() >= oldFisrtDataTime * 1000
          })
          res.splice(repeatStartIndex)
        }
        if (res.length === 0) {
          noMoreKLineData.value[_circle] = true
          done()
          return
        }

        const newData = res.map((item): CandlestickData => {
          return {
            time: dayjs(item.OpenTime).unix() as UTCTimestamp, // time 是秒
            open: item.Open,
            high: item.High,
            low: item.Low,
            close: item.Close,
          }
        })

        const oldOriginData = kLineOriginData.get(k) || []
        kLineOriginData.set(k, [...res, ...oldOriginData])
        kLineData.set(k, [...newData, ...oldData])
      } else {
        noMoreKLineData.value[_circle] = true
      }
      done(kLineData.get(k))
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
        const lastStartTime = (kLineDataByCircle.value[0]?.time as number) || dayjs().unix()

        await getKlineData({
          startTime: getStartTime(circle.value, (lastStartTime as number) * 1000),
          endTime: lastStartTime * 1000,
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

  function getTimePriceFromPosition(event: MouseEvent) {
    const mainSeries = draw.series?.kLine.getSeries()
    // chartX: number, chartY: number
    if (!chart.value || !mainSeries || !theChartContainerRef.value) return
    const { tp } = getTpFromMouseEvent(chart.value, mainSeries, theChartContainerRef.value, event)
    if (tp) {
      return tp
    }
    return
  }

  function getOneRenderCount(w: number) {
    const volCount = 10
    const count = Math.floor(w / volCount)
    return count
  }

  watch([code, circle], async ([_code, _circle]) => {
    if (!_code || !_circle) return

    if (kLineDataByCircle.value.length === 0) {
      try {
        await getKlineData({ startTime: 0 })
      } catch (error) {
        console.error('error:', error)
      }
    }
    const w = theChartContainerRef.value?.clientWidth || 0
    setDefaultVisibleRange(getOneRenderCount(w))
  })

  const { stop } = useResizeObserver(theChartContainerRef, (entries) => {
    const entry = entries[0]
    if (!entry) return
    const { width } = entry.contentRect
    setDefaultVisibleRange(getOneRenderCount(width))
  })

  const destory = async () => {
    clearAllDrawings() // todo 暂时是删除所有线，后面需要拿到所有线信息后保存打数据库
    stop()
    destoryDrawingManager()
    chart.value?.remove()
  }

  watch(renderIndexList, () => {
    console.log('改变了2:')
  })

  return {
    id,
    chart,
    code,
    name,
    circle,
    draw,
    kLineDataByCircle,
    kLineOriginDataByCircle,
    selectedDrawing,
    initChart,
    destory,
    setCode,
    setCircle,
    kLineSimulation,
    getTimePriceFromPosition,
    deleteDraw,
    kLineIndexDataByCircle,
    // 指标相关
    renderIndexList,
    renderIndexNameList,
    addIndex,
    setIndex,
    removeIndex,
  }
}
