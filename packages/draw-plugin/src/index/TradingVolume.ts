import { HistogramSeries, IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts'
import { DrawIndex } from './DrawIndex'
import { v4 as uuidv4 } from 'uuid'
import { INDEX_NAME, KLineIndexData } from '../type'
import Color from 'color'

export class TradingVolume extends DrawIndex {
  public volumeSeries: ISeriesApi<SeriesType> | undefined
  public cciPeriod: number
  constructor(chartContainer: HTMLElement, chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart, chartContainer)
    this.kLineSeries = kLineSeries
    this.name = INDEX_NAME.MACD
    this.store.id = `${INDEX_NAME.MACD}_${uuidv4()}`
    this.cciPeriod = 20
    this.name = this.name = INDEX_NAME.TRADINGVOLUME
  }

  addSeries() {
    if (!this.chart) return
    // 清理旧的 series
    if (this.volumeSeries) return

    // 创建 Series
    const paneIndex = this.pane?.paneIndex()

    this.volumeSeries = this.chart.addSeries(
      HistogramSeries,
      {
        priceFormat: {
          type: 'volume', // 格式化成交量，例如 1.5K, 2M
        },
        priceScaleId: '', // 隐藏Y轴价格标签，它不代表价格
      },
      paneIndex,
    )
  }

  removeSeries() {
    this.volumeSeries && this.chart?.removeSeries(this.volumeSeries)
    this.volumeSeries = undefined
  }

  setData(data: KLineIndexData): void {
    this.render(data)
  }

  render(v: KLineIndexData) {
    if (!v) return

    super.render(v)
    this.addSeries()

    this.volumeSeries?.setData(
      v.times?.map((item, i) => {
        return {
          time: item as Time,
          value: v.volume[i],
          color:
            v.closes[i] > v.opens[i]
              ? Color(this.store.upColor).alpha(0.7).toString()
              : Color(this.store.downColor).alpha(0.7).toString(),
        }
      }),
    )
  }

  remove() {
    this.removeSeries()
    super.remove()
  }
}
