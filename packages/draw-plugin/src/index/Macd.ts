import { HistogramSeries, IChartApi, ISeriesApi, LineSeries, SeriesType } from 'lightweight-charts'
import { DrawIndex } from './DrawIndex'
import { v4 as uuidv4 } from 'uuid'
import { KLineIndexData } from '../type'

export class MACD extends DrawIndex {
  public macdLineSeries: ISeriesApi<SeriesType> | undefined
  public signalLineSeries: ISeriesApi<SeriesType> | undefined
  public histogramSeries: ISeriesApi<SeriesType> | undefined
  constructor(chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart)
    this.kLineSeries = kLineSeries
    this.store.id = `macd_${uuidv4()}`
    this.addMacdSeries()
  }

  addMacdSeries() {
    if (!this.chart) return

    // 清理旧的 series
    this.removeMacdSeries()

    // 创建 Series
    this.macdLineSeries = this.chart.addSeries(LineSeries, {})
    this.signalLineSeries = this.chart.addSeries(LineSeries, {})
    this.histogramSeries = this.chart.addSeries(HistogramSeries, {})
  }
  removeMacdSeries() {
    this.macdLineSeries && this.chart?.removeSeries(this.macdLineSeries)
    this.signalLineSeries && this.chart?.removeSeries(this.signalLineSeries)
    this.histogramSeries && this.chart?.removeSeries(this.histogramSeries)
    this.macdLineSeries = undefined
    this.signalLineSeries = undefined
    this.histogramSeries = undefined
  }

  updateSet() {
    super.updateSet()
  }
  setData(data: KLineIndexData): void {
    console.log('v:', data)
    const res = window?.MACD?.(data.closes, 12, 26, 9)
    console.log(res)
  }

  render(v?: KLineIndexData) {
    if (!v) return

    const res = window?.MACD?.(v.closes, 12, 26, 9)
    if (res) {
      console.log('res:', res)
    }
  }
}
