import { IChartApi, ISeriesApi, LineSeries, SeriesType } from 'lightweight-charts'
import { DrawIndex } from './DrawIndex'
import { v4 as uuidv4 } from 'uuid'
import { KLineIndexData } from '../type'

export class MACD extends DrawIndex {
  constructor(chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart)
    this.store.id = `macd_${uuidv4()}`
    this.kLineSeries = kLineSeries

    const _series = chart.addSeries(LineSeries, {
      color: this.store.color,
      lineWidth: this.store.lineWidth,
      lineStyle: this.store.lineStyle, // 预览时使用虚线
    })
    this.series.push(_series)
  }

  updateSet() {
    super.updateSet()
  }

  render(v?: KLineIndexData) {
    if (!v) {
      this.series[0].setData([])
    } else {
      const res = window?.MACD?.(v.closes, 12, 26, 9)
      if (res) {
        console.log('res:', res)
      }
    }
  }
}
