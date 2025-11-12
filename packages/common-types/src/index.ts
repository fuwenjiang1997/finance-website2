import type { IChartApi, ISeriesApi } from 'lightweight-charts'

export interface VIChartApi extends IChartApi {
  series: ISeriesApi<'Candlestick'>[]
}

export enum DEFAULT_COLOR {
  DEFAULT_UP_COLOR = '#52a49a',
  DEFAULT_DOWN_COLOR = '#e74c3c',
}

export interface ChartColorParams {
  upColor: string
  downColor: string
  volUpColor: string
  volDownColor: string
  upBgColor: string
  downBgColor: string
}
