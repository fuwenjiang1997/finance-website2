import { HistogramSeries, IChartApi, ISeriesApi, LineSeries, SeriesType } from 'lightweight-charts'
import { DrawIndex } from './DrawIndex'
import { v4 as uuidv4 } from 'uuid'
import { INDEX_NAME, KLineIndexData } from '../type'

interface WasmMACDResult {
  dea: number[]
  dif: number[]
  histogram: number[]
}

export class MACD extends DrawIndex {
  public macdLineSeries: ISeriesApi<SeriesType> | undefined
  public signalLineSeries: ISeriesApi<SeriesType> | undefined
  public histogramSeries: ISeriesApi<SeriesType> | undefined
  constructor(chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart)
    this.kLineSeries = kLineSeries
    this.name = INDEX_NAME.MACD
    this.store.id = `${INDEX_NAME.MACD}_${uuidv4()}`
    this.addMacdSeries()
  }

  addMacdSeries() {
    if (!this.chart) return

    // 清理旧的 series
    this.removeMacdSeries()

    // 创建 Series
    this.macdLineSeries = this.chart.addSeries(
      LineSeries,
      {
        color: '#2962FF',
        lineWidth: 2,

        priceScaleId: 'macd_price_scale', // 使用独立的 Y 轴
      },
      1,
    )
    this.signalLineSeries = this.chart.addSeries(
      LineSeries,
      {
        color: '#FFB300',
        lineWidth: 2,
        priceScaleId: 'macd_price_scale',
      },
      1,
    )
    this.histogramSeries = this.chart.addSeries(
      HistogramSeries,
      {
        color: '#FF3D00',
        priceScaleId: 'macd_price_scale',
      },
      1,
    )
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
    this.render(data)
    // console.log('v:', data)
    // const res = window?.MACD?.(data.closes, 12, 26, 9)
    // console.log(res)
  }

  render(v?: KLineIndexData) {
    if (!v) return
    const res = window?.MACD?.(v.closes, 12, 26, 9) as WasmMACDResult | undefined
    if (res) {
      // this.histogramSeries?.setData(res.histogram.map((value, index) => ({ time: index as number, value })))
      // this.macdLineSeries?.setData(res.dif.map((value, index) => ({ time: index as number, value })))
      // this.signalLineSeries?.setData(res.dea.map((value, index) => ({ time: index as number, value })))
    }
  }

  remove() {
    this.removeMacdSeries()
  }
}
