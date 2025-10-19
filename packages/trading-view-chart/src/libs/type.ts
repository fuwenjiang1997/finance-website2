import { CandlestickData, IChartApi, Time, WhitespaceData } from 'lightweight-charts'
import { Reactive, Ref } from 'vue'

export interface VChartPlugin {
  name: string
  beforeSetData: (
    data: CandlestickData<Time> | WhitespaceData<Time>,
  ) => CandlestickData<Time> | WhitespaceData<Time>
}

export interface VChartSeriesParams {
  plugins?: Reactive<{ [k: string]: VChartPlugin }>
  kLineData: Ref<(CandlestickData<Time> | WhitespaceData<Time>)[]>
}

export type VChartSeries = (chart: IChartApi, params: VChartSeriesParams) => any
