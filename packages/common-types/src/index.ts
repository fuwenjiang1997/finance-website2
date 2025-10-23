import type { IChartApi, ISeriesApi } from 'lightweight-charts'

export interface VIChartApi extends IChartApi {
  series: ISeriesApi<'Candlestick'>[]
}
