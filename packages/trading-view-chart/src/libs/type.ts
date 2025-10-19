import { CandlestickData, Time, WhitespaceData } from 'lightweight-charts'
import { Reactive, Ref } from 'vue'

export interface VChartPlugin {
  name: string
  beforeSetData: (
    data: CandlestickData<Time> | WhitespaceData<Time>,
  ) => CandlestickData<Time> | WhitespaceData<Time>
}
export interface KLineOriginData {
  OpenTime: string
  Open: number
  High: number
  Low: number
  Close: number
  Volume: number
  CloseTime: string
  QuoteVolume: number
  TradeNum: number
  TakerBuyBase: number
  TakerBuyQuote: number
}

export interface VChartSeriesParams {
  plugins?: Reactive<{ [k: string]: VChartPlugin }>
  kLineData: Ref<(CandlestickData<Time> | WhitespaceData<Time>)[]>
  kLineOriginData: Ref<KLineOriginData[]>
  upColor: string
  downColor: string
}

// export type VChartSeries = (chart: IChartApi, params: VChartSeriesParams) => any
