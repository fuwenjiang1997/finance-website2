import { CandlestickData, Time, WhitespaceData, type IChartApi } from 'lightweight-charts'
import kLineSeries, { ReturnkLineSeries } from './libs/kLineSeries/kLineSeries'
import { ComputedRef, reactive, Ref } from 'vue'
import { KLineOriginData, VChartPlugin, VChartSeriesParams } from './libs/type'
import tradingVolume from './libs/tradingVolume/tradingVolume'

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
    upColor: '#52a49a',
    downColor: '#de5e57',
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
