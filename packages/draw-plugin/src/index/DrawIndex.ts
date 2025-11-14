import { IChartApi, IPaneApi, ISeriesApi, LineStyle, SeriesType, Time } from 'lightweight-charts'
import { IDrawingIndex, INDEX_NAME, INDEX_TYPE, KLineIndexData, PluginWidth } from '../type'
import { DEFAULT_DOWN_COLOR, DEFAULT_UP_COLOR } from '../utils/const'

export type IDrawingIndexClass = new (
  chartContainer: HTMLElement,
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
  public chartContainer: HTMLElement
  public paneElement?: HTMLElement
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

  constructor(chart: IChartApi, chartContainer: HTMLElement) {
    this.chart = chart
    this.isDeleted = false
    this.name = INDEX_NAME.MACD
    this.indexType = INDEX_TYPE.VICE // 默认副图
    this.chartContainer = chartContainer
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
  setPane(_pane: IPaneApi<Time>) {
    this.pane = _pane
    console.log('this.pane:', this.pane.paneIndex())
    // const h = this.chartContainer.clientHeight
    // // this.pane.setHeight(1)
    // setTimeout(() => {
    //   this.pane?.setHeight(h * 0.2)
    //   this.paneElement = this.pane?.getHTMLElement() || undefined
    //   this.addEventListenerPaneSize()
    // }, 1)
  }
  remove(): void {
    if (!this.chart || !this.pane) return
    this.pane = undefined
    this.paneElement = undefined
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
