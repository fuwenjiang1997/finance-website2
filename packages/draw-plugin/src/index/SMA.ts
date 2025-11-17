import { IChartApi, ISeriesApi, LineSeries, SeriesType, Time } from 'lightweight-charts'
import { DrawIndex } from './DrawIndex'
import { v4 as uuidv4 } from 'uuid'
import { INDEX_NAME, INDEX_TYPE, KLineIndexData } from '../type'
import Color from 'color'

interface SMAItem {
  color: string
  value: number
}

export class SMA extends DrawIndex {
  public smaSeries: ISeriesApi<SeriesType>[]
  public seriesOptions: SMAItem[]
  constructor(chartContainer: HTMLElement, chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart, chartContainer)
    this.indexType = INDEX_TYPE.MAIN
    this.kLineSeries = kLineSeries
    this.name = INDEX_NAME.MACD
    this.store.id = `${INDEX_NAME.MACD}_${uuidv4()}`
    this.name = INDEX_NAME.SMA

    this.smaSeries = []
    this.seriesOptions = [
      { value: 5, color: Color('#000').alpha(0.5).toString() },
      { value: 10, color: Color('#f5ca0f').alpha(0.5).toString() },
      { value: 20, color: Color('#b715d7').alpha(0.5).toString() },
      { value: 60, color: Color('#3ea44b').alpha(0.5).toString() },
      // { value: 120, color: '#d91a45' },
    ]
    this.addSeries()
  }

  addSeries() {
    if (!this.chart) return
    // 清理旧的 series
    this.removeSeries()
    this.seriesOptions.forEach((item, index) => {
      if (this.smaSeries[index] === undefined && this.chart) {
        this.smaSeries[index] = this.chart.addSeries(LineSeries, {
          lineWidth: 1,
          title: `SMA(${item.value})`,
          color: item.color,
          priceScaleId: 'right', // 确保和主K线在同一个价格轴
        })
      }
    })
  }
  removeSeries() {
    this.smaSeries.forEach((item) => {
      this.chart?.removeSeries(item)
    })
    this.smaSeries.length = 0
  }

  setData(data: KLineIndexData): void {
    this.render(data)
  }

  render(v?: KLineIndexData) {
    if (!v || !this.chart) return

    super.render(v)
    this.seriesOptions.forEach((item, index) => {
      if (v.highs.length < item.value) {
        return
      }
      const res = window?.SMA?.(v.highs, item.value)
      if (!res) return

      this.smaSeries[index].setData(
        v.times?.map((t, i) => {
          return {
            time: t as Time,
            value: res[i],
          }
        }),
      )
    })
  }

  remove() {
    this.removeSeries()
  }
}
