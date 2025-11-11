import { CandlestickData, Time, WhitespaceData, type IChartApi } from 'lightweight-charts'
import kLineSeries, { ReturnkLineSeries } from './libs/kLineSeries/kLineSeries'
import { ComputedRef, reactive, Ref } from 'vue'
import { KLineOriginData, VChartPlugin, VChartSeriesParams } from './libs/type'
import tradingVolume from './libs/tradingVolume/tradingVolume'
import { DEFAULT_DOWN_COLOR, DEFAULT_UP_COLOR } from './utils/const'

export { type KLineData } from './libs/kLineSeries/kLineSeries'
export * from './libs/type'

interface VChartParams {
  kLineData: Ref<(CandlestickData<Time> | WhitespaceData<Time>)[]>
  kLineOriginData: ComputedRef<KLineOriginData[]>
}

export type VChart = ReturnType<typeof vChart>
export default function vChart(chart: IChartApi, params: VChartParams) {
  const plugins = reactive<{ [k: string]: VChartPlugin }>({})

  const seriesParams: VChartSeriesParams = {
    kLineData: params.kLineData,
    kLineOriginData: params.kLineOriginData,
    upColor: DEFAULT_UP_COLOR,
    downColor: DEFAULT_DOWN_COLOR,
  }

  const kLine: ReturnkLineSeries = kLineSeries(chart, seriesParams)
  const volume = tradingVolume(chart, seriesParams)

  function usePlugin(plugin: VChartPlugin) {
    if (!plugins[plugin.name]) {
      plugins[plugin.name] = (...args) => {
        return plugin({ kLine }, ...args)
      }
    }
  }

  return {
    kLine,
    volume,
    plugins,
    usePlugin,
  }
}
