import type { IChartApi, ISeriesApi } from 'lightweight-charts'

export interface VIChartApi extends IChartApi {
  series: ISeriesApi<'Candlestick'>[]
}

export function ccc() {
  console.log('333:')
}

export function ccc2() {
  console.log('333222:')
}
