import { CandlestickData, Time, WhitespaceData, type IChartApi } from 'lightweight-charts'
import kLineSeries, { ReturnkLineSeries } from './libs/kLineSeries/kLineSeries'
import { ComputedRef, reactive, Ref } from 'vue'
import { KLineOriginData, VChartPlugin, VChartSeriesParams } from './libs/type'
import tradingVolume from './libs/tradingVolume/tradingVolume'
import { DEFAULT_DOWN_COLOR, DEFAULT_UP_COLOR } from './utils/const'
import Color from 'color'
import { ChartColorParams } from '@fuwenjiang1997/common-types'

export { type KLineData } from './libs/kLineSeries/kLineSeries'
export * from './libs/type'

interface VChartParams {
  kLineData: Ref<(CandlestickData<Time> | WhitespaceData<Time>)[]>
  kLineOriginData: ComputedRef<KLineOriginData[]>
  color: ChartColorParams
}

export type VChart = ReturnType<typeof vChart>
export default function vChart(chart: IChartApi, params: VChartParams) {
  const plugins = reactive<{ [k: string]: VChartPlugin }>({})

  const color = reactive<ChartColorParams>(
    Object.assign(
      {
        upColor: DEFAULT_UP_COLOR,
        downColor: DEFAULT_DOWN_COLOR,
        volUpColor: Color(DEFAULT_UP_COLOR).alpha(0.7).toString(),
        volDownColor: Color(DEFAULT_DOWN_COLOR).alpha(0.7).toString(),
        upBgColor: Color(DEFAULT_UP_COLOR).alpha(0.4).lighten(0.5).toString(),
        downBgColor: Color(DEFAULT_DOWN_COLOR).alpha(0.8).lighten(0.5).toString(),
      },
      params.color || {},
    ),
  )

  const seriesParams: VChartSeriesParams = {
    kLineData: params.kLineData,
    kLineOriginData: params.kLineOriginData,
    color: color,
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

  function setColor(uiColor: ChartColorParams) {
    Object.assign(color, uiColor)
    kLine.renderByUpdateColor()
    volume.renderByUpdateColor()
  }

  return {
    kLine,
    volume,
    plugins,
    usePlugin,
    setColor,
  }
}
