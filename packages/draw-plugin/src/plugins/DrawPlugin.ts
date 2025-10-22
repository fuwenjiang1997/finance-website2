import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import { v4 as uuidv4 } from 'uuid'

export default class DrawPlugin {
  public readonly id: string
  public chart: IChartApi
  public mainSeries: ISeriesApi<SeriesType> | undefined

  constructor(chart: IChartApi) {
    this.id = uuidv4()
    this.chart = chart
  }
}
