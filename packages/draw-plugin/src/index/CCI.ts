import { IChartApi, ISeriesApi, LineSeries, SeriesType, Time } from 'lightweight-charts'
import { DrawIndex } from './DrawIndex'
import { v4 as uuidv4 } from 'uuid'
import { INDEX_NAME, KLineIndexData } from '../type'

export class CCI extends DrawIndex {
  // public deaLineSeries: ISeriesApi<SeriesType> | undefined // 慢线
  // public difLineSeries: ISeriesApi<SeriesType> | undefined // 快线
  public cciSeries: ISeriesApi<SeriesType> | undefined
  public cciPeriod: number
  constructor(chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart)
    this.kLineSeries = kLineSeries
    this.name = INDEX_NAME.MACD
    this.store.id = `${INDEX_NAME.MACD}_${uuidv4()}`
    this.cciPeriod = 20
    this.addSeries()
  }

  addSeries() {
    if (!this.chart) return
    // 清理旧的 series
    this.removeSeries()

    if (!this.pane) {
      super.createPane()
    }
    // 创建 Series
    const paneIndex = this.pane?.paneIndex()

    this.cciSeries = this.chart.addSeries(
      LineSeries,
      {
        color: '#2962FF',
        lineWidth: 2,
        title: `CCI(${this.cciPeriod})`,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      },
      paneIndex,
    )

    // 4. (可选但推荐) 为CCI指标添加 +100 和 -100 的水平线
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

  updateSet() {
    super.updateSet()
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
    // 清空pane的时候会删除series
    super.remove()
    // 清空自己的series实例
    this.cciSeries = undefined
  }
}
