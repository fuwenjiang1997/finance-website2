import { IChartApi, IPaneApi, ISeriesApi, LineStyle, SeriesType, Time } from 'lightweight-charts'
import { IDrawingIndex, INDEX_NAME, INDEX_TYPE, KLineIndexData, PluginWidth } from '../type'
import { DEFAULT_DOWN_COLOR, DEFAULT_UP_COLOR } from '../utils/const'

export type IDrawingIndexClass = new (
  chart: IChartApi,
  kLineSeries: ISeriesApi<SeriesType>,
) => DrawIndex

export abstract class DrawIndex implements IDrawingIndex {
  public chart: IChartApi | undefined
  public pane?: IPaneApi<Time>
  public kLineSeries: ISeriesApi<SeriesType> | undefined
  public el: HTMLElement | undefined
  public isDeleted: boolean
  public name: INDEX_NAME
  public indexType: INDEX_TYPE
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
    this.isDeleted = false
    this.name = INDEX_NAME.MACD
    this.indexType = INDEX_TYPE.VICE // 默认副图
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
  createPane() {
    if (!this.chart) return
    this.pane = this.chart.addPane()
  }
  remove(): void {
    if (!this.chart || !this.pane) return
    this.chart.removePane(this.pane.paneIndex())
    this.pane = undefined
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
