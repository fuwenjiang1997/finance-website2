import { CandlestickData, Time, WhitespaceData } from 'lightweight-charts'
import { Reactive, Ref } from 'vue'
import { ReturnkLineSeries } from './kLineSeries/kLineSeries'
import { ChartColorParams } from '@fuwenjiang1997/common-types'

export type VChartPlugin = (params: { kLine: ReturnkLineSeries }, ...args: any[]) => VChartPluginRes
export interface VChartPluginRes {
  name: string
  beforeSetData?: (
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
  color: ChartColorParams
}

// export type VChartSeries = (chart: IChartApi, params: VChartSeriesParams) => any
