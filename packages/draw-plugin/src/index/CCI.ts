import { IChartApi, ISeriesApi, LineSeries, SeriesType, Time } from 'lightweight-charts'
import { DrawIndex } from './DrawIndex'
import { v4 as uuidv4 } from 'uuid'
import { INDEX_NAME, KLineIndexData } from '../type'

export class CCI extends DrawIndex {
  public cciSeries: ISeriesApi<SeriesType> | undefined
  public cciPeriod: number
  constructor(chartContainer: HTMLElement, chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart, chartContainer)
    this.kLineSeries = kLineSeries
    this.name = INDEX_NAME.MACD
    this.store.id = `${INDEX_NAME.MACD}_${uuidv4()}`
    this.cciPeriod = 20
  }

  addSeries() {
    if (!this.chart) return
    // 清理旧的 series
    if (this.cciSeries) return

    // 创建 Series
    const paneIndex = this.pane?.paneIndex()

    this.cciSeries = this.chart.addSeries(
      LineSeries,
      {
        color: '#2962FF',
        lineWidth: 1,
        title: `CCI(${this.cciPeriod})`,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      },
      paneIndex,
    )

    this.cciSeries.createPriceLine({
      price: 100,
      color: '#787B86',
      lineWidth: 1,
      lineStyle: 2, // LineStyle.Dashed
      axisLabelVisible: true,
      title: '+100',
    })
    this.cciSeries.createPriceLine({
      price: -100,
      color: '#787B86',
      lineWidth: 1,
      lineStyle: 2, // LineStyle.Dashed
      axisLabelVisible: true,
      title: '-100',
    })
  }
  removeSeries() {
    this.cciSeries && this.chart?.removeSeries(this.cciSeries)
    this.cciSeries = undefined
  }

  setData(data: KLineIndexData): void {
    this.render(data)
  }

  render(v?: KLineIndexData) {
    if (!v) return
    if (v.times.length < this.cciPeriod) {
      return []
    }
    const res = window?.CCI?.(v.highs, v.lows, v.closes, this.cciPeriod)
    if (!res) return

    super.render(v)
    this.addSeries()

    this.cciSeries?.setData(
      v.times?.map((item, i) => {
        return {
          time: item as Time,
          value: res[i],
        }
      }),
    )
  }

  remove() {
    this.removeSeries()
    super.remove()
  }
}
