import { CandlestickData, Time, WhitespaceData, type IChartApi } from 'lightweight-charts'
import kLineSeries from './libs/kLineSeries/kLineSeries'
import { reactive, Ref } from 'vue'
import { VChartPlugin } from './libs/type'

export { type KLineData } from './libs/kLineSeries/kLineSeries'

interface VChartParams {
  kLineData: Ref<(CandlestickData<Time> | WhitespaceData<Time>)[]>
}

export type VChart = ReturnType<typeof vChart>
export default function vChart(chart: IChartApi, params: VChartParams) {
  const plugins = reactive<{ [k: string]: VChartPlugin }>({})

  function usePlugin(plugin: VChartPlugin) {
    if (!plugins[plugin.name]) {
      plugins[plugin.name] = plugin
    }
  }

  const seriesParams = {
    kLineData: params.kLineData,
    plugins,
  }

  const kLine = kLineSeries(chart, seriesParams)

  return {
    kLine,
    usePlugin,
  }
}
