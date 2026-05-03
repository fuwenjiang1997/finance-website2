import { IChartApi } from 'lightweight-charts'
import { KLineOriginData } from '../libs/type'

export interface drawPlugin {
  chart: IChartApi
  data: KLineOriginData
}
