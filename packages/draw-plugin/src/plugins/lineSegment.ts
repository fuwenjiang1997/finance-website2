import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import DrawPlugin from './DrawPlugin'

export class LineSegment extends DrawPlugin {
  constructor(chart: IChartApi, mainSeries: ISeriesApi<SeriesType>) {
    super(chart)
    this.mainSeries = mainSeries
  }
}
