import { IChartApi, ISeriesApi, LineStyle, SeriesType } from 'lightweight-charts'
import { IDrawingIndex, INDEX_NAME, KLineIndexData, PluginWidth } from '../type'
import { DEFAULT_DOWN_COLOR, DEFAULT_UP_COLOR } from '../utils/const'

export type IDrawingIndexClass = new (
  chart: IChartApi,
  kLineSeries: ISeriesApi<SeriesType>,
) => DrawIndex

export abstract class DrawIndex implements IDrawingIndex {
  public chart: IChartApi | undefined
  public kLineSeries: ISeriesApi<SeriesType> | undefined
  public el: HTMLElement | undefined
  isDeleted: boolean = false
  name: INDEX_NAME = INDEX_NAME.MACD
  protected series: ISeriesApi<SeriesType>[] = [] // 用于存放绘制的 series

  store: {
    id: string
    color: string
    upColor: string
    downColor: string
    lineWidth: PluginWidth
    lineStyle: LineStyle
    visible: boolean
  }

  constructor(chart: IChartApi) {
    this.chart = chart
    this.store = {
      id: '',
      color: 'rgb(255, 0, 0)',
      upColor: DEFAULT_UP_COLOR,
      downColor: DEFAULT_DOWN_COLOR,
      lineWidth: PluginWidth.w2,
      lineStyle: LineStyle.Solid,
      visible: true,
    }
  }

  public abstract render(v?: KLineIndexData): void
  public abstract setData(v: KLineIndexData): void
  remove(): void {
    throw new Error('Method not implemented.')
  }
  updateSet() {
    const { color, lineWidth, lineStyle, visible } = this.store
    this.series.forEach((item) => {
      item?.applyOptions({
        lineStyle: lineStyle,
        color: color,
        lineWidth: lineWidth,
        lineVisible: visible,
      })
    })
  }
  setLineWidth(v: PluginWidth) {
    this.store.lineWidth = v
    this.updateSet()
  }
  setLineColor(v: string) {
    this.store.color = v
    this.updateSet()
  }
  setVisible(v: boolean) {
    this.store.visible = v
    this.updateSet()
  }
}
