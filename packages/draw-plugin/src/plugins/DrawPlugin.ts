import { IChartApi, ISeriesApi, LineStyle, SeriesType } from 'lightweight-charts'
import { v4 as uuidv4 } from 'uuid'
import { IDrawingTool, PluginTpPoint, PluginWidth } from '../type'
import { getScreenPositonFromTP } from '../utils'

export abstract class DrawPlugin implements IDrawingTool {
  public chart: IChartApi
  public kLineSeries: ISeriesApi<SeriesType> | undefined
  public isDragging: boolean = false
  public isDrawing: boolean = false
  public isSelected: boolean = false
  public isDeleted: boolean = false
  protected draggedPointIndex: number | 'body' | undefined
  public render?: (point: PluginTpPoint[]) => void
  protected dragStartPoint: PluginTpPoint | undefined
  protected series: ISeriesApi<SeriesType>[] = [] // 用于存放绘制的 series
  store: {
    id: string
    isLocked: boolean
    color: string
    points: PluginTpPoint[]
    lineWidth: PluginWidth
    lineStyle: LineStyle
    lineVisible: boolean
  }

  constructor(chart: IChartApi) {
    this.chart = chart
    this.store = {
      id: uuidv4(),
      isLocked: false,
      points: [],
      color: 'rgb(255, 0, 0)',
      lineWidth: PluginWidth.w2,
      lineStyle: LineStyle.Solid,
      lineVisible: true,
    }
  }

  public abstract updateSet(): void
  onChartCrosshairMove(_: PluginTpPoint): void {
    throw new Error('Method not implemented.')
  }

  public abstract isPointNear(point: PluginTpPoint): boolean
  public abstract onMouseMove(point: PluginTpPoint): void
  public onMouseDown(point: PluginTpPoint) {
    if (!this.isSelected) return
    this.isDragging = true
    this.dragStartPoint = { ...point } // 记录拖拽起始点
  }

  public onDrag(_: PluginTpPoint): void {
    if (!this.isDragging || !this.dragStartPoint) return
  }

  public onMouseUp(_: PluginTpPoint): void {
    this.isDragging = false
    this.draggedPointIndex = undefined
    this.dragStartPoint = undefined
  }
  public abstract onClick(point: PluginTpPoint): void
  public abstract isComplete(): boolean
  public abstract onCrosshairClick(point: PluginTpPoint): void

  select(): void {
    this.isSelected = true
    this.updateSet()
    // this.series.forEach((s) =>
    //   s.applyOptions({ color: PluginLineColor.Selected, lineWidth: this.store.lineWidth }),
    // )
  }

  deselect(): void {
    this.isSelected = false
    this.updateSet()
    // 恢复原始颜色和线宽
    // this.series.forEach((s) =>
    //   s.applyOptions({ color: this.store.color, lineWidth: this.store.lineWidth }),
    // )
  }

  setLineWidth(v: PluginWidth) {
    this.store.lineWidth = v
    this.updateSet()
  }
  setLineColor(v: string) {
    this.store.color = v
    this.updateSet()
  }
  setLineStyle(v: LineStyle) {
    this.store.lineStyle = v
    this.updateSet()
    console.log('ddd:')
  }
  setLock(v: boolean) {
    this.store.isLocked = v
    this.updateSet()
  }
  setLineVisible(v: boolean) {
    this.store.lineVisible = v
    this.updateSet()
  }
  // 不会真正的删除，只是ui不显示，并标记删除，调用删除ui会卡顿
  public remove(): void {
    this.isDeleted = true
    this.series.forEach((item) => {
      item.setData([])
    })
  }

  public toScreen(p: PluginTpPoint) {
    if (!this.kLineSeries || !p.time || !p.value) return
    return getScreenPositonFromTP(this.chart, this.kLineSeries, p.time as number, p.value)
  }
}
