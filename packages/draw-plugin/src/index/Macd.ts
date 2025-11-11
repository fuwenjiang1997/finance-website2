import {
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineSeries,
  SeriesType,
  Time,
} from 'lightweight-charts'
import { DrawIndex } from './DrawIndex'
import { v4 as uuidv4 } from 'uuid'
import { INDEX_NAME, KLineIndexData } from '../type'

interface WasmMACDResult {
  dea: number[]
  dif: number[]
  histogram: number[]
}

export class MACD extends DrawIndex {
  public deaLineSeries: ISeriesApi<SeriesType> | undefined // 慢线
  public difLineSeries: ISeriesApi<SeriesType> | undefined // 快线
  public histogramSeries: ISeriesApi<SeriesType> | undefined
  constructor(chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>, pineIndex: number = 1) {
    super(chart)
    this.kLineSeries = kLineSeries
    this.name = INDEX_NAME.MACD
    this.store.id = `${INDEX_NAME.MACD}_${uuidv4()}`

    this.addMacdSeries(pineIndex)
  }

  addMacdSeries(pineIndex: number) {
    if (!this.chart) return

    // 清理旧的 series
    this.removeMacdSeries()

    const yName = 'macd_price_scale'

    console.log('pineIndex in MACD:', pineIndex)

    // 创建 Series
    this.deaLineSeries = this.chart.addSeries(
      LineSeries,
      {
        color: '#2962FF',
        lineWidth: 2,
        priceScaleId: yName, // 使用独立的 Y 轴
      },
      pineIndex,
    )
    this.difLineSeries = this.chart.addSeries(
      LineSeries,
      {
        color: '#FFB300',
        lineWidth: 2,
        priceScaleId: yName,
      },
      pineIndex,
    )
    this.histogramSeries = this.chart.addSeries(
      HistogramSeries,
      {
        color: '#FF3D00',
        priceScaleId: yName,
      },
      pineIndex,
    )
  }
  removeMacdSeries() {
    this.deaLineSeries && this.chart?.removeSeries(this.deaLineSeries)
    this.difLineSeries && this.chart?.removeSeries(this.difLineSeries)
    this.histogramSeries && this.chart?.removeSeries(this.histogramSeries)
    this.deaLineSeries = undefined
    this.difLineSeries = undefined
    this.histogramSeries = undefined
  }

  updateSet() {
    super.updateSet()
  }
  setData(data: KLineIndexData): void {
    this.render(data)
  }

  render(v?: KLineIndexData) {
    if (!v) return
    const res = window?.MACD?.(v.closes, 12, 26, 9) as WasmMACDResult | undefined

    if (res) {
      this.histogramSeries?.setData(
        v.times.map((time, index) => ({
          time: time as Time,
          value: res.histogram[index],
          color: res.histogram[index] >= 0 ? this.store.upColor : this.store.downColor,
        })),
      )
      // 慢线
      this.deaLineSeries?.setData(
        v.times.map((time, index) => ({
          time: time as Time,
          value: res.dea[index],
          color: '#ffb86a',
        })),
      )
      // 快线
      this.difLineSeries?.setData(
        v.times.map((time, index) => ({
          time: time as Time,
          value: res.dif[index],
          color: '#c10007',
        })),
      )
    }
  }

  remove() {
    this.removeMacdSeries()
  }
}
