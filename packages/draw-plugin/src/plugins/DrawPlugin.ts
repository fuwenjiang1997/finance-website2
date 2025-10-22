import { IChartApi, ISeriesApi, LineStyle, SeriesType } from 'lightweight-charts'
import { v4 as uuidv4 } from 'uuid'
import { IDrawingTool, PluginPoint, PluginWidth } from '../type'
import { getScreenPositonFromTP } from '../utils'

const DEFAULT_COLOR = 'red'
const DEFAULT_LINE_WIDTH = 2
const SELECTED_LINE_WIDTH = 3

export abstract class DrawPlugin implements IDrawingTool {
  public chart: IChartApi
  public kLineSeries: ISeriesApi<SeriesType> | undefined
  public isDragging: boolean = false
  public isDrawing: boolean = false
  public isSelected: boolean = false
  protected draggedPointIndex: number | 'body' | undefined
  public render?: (point: PluginPoint[]) => void
  protected dragStartPoint: PluginPoint | undefined
  protected series: ISeriesApi<SeriesType>[] = [] // 用于存放绘制的 series
  store: {
    id: string
    isLocked: boolean
    points: PluginPoint[]
    lineWidth: PluginWidth.w1
    lineStyle: LineStyle.Solid
  }

  constructor(chart: IChartApi) {
    this.chart = chart
    this.store = {
      id: uuidv4(),
      isLocked: false,
      points: [],
      lineWidth: PluginWidth.w1,
      lineStyle: LineStyle.Solid,
    }
  }
  onChartCrosshairMove(_: PluginPoint): void {
    throw new Error('Method not implemented.')
  }

  public abstract isPointNear(point: PluginPoint): boolean
  public abstract onMouseMove(point: PluginPoint): void
  public onMouseDown(point: PluginPoint) {
    if (!this.isSelected) return
    this.isDragging = true
    this.dragStartPoint = { ...point } // 记录拖拽起始点
  }

  public onDrag(_: PluginPoint): void {
    if (!this.isDragging || !this.dragStartPoint) return
  }

  public onMouseUp(_: PluginPoint): void {
    this.isDragging = false
    this.draggedPointIndex = undefined
    this.dragStartPoint = undefined
  }
  public abstract onClick(point: PluginPoint): void
  public abstract isComplete(): boolean
  public abstract onCrosshairClick(point: PluginPoint): void

  select(): void {
    this.isSelected = true
    this.series.forEach((s) => s.applyOptions({ color: '#1E88E5', lineWidth: SELECTED_LINE_WIDTH }))
  }

  deselect(): void {
    this.isSelected = false
    // 恢复原始颜色和线宽
    this.series.forEach((s) =>
      s.applyOptions({ color: DEFAULT_COLOR, lineWidth: DEFAULT_LINE_WIDTH }),
    )
  }

  public remove(): void {
    this.series.forEach((s) => this.chart.removeSeries(s))
    this.series = []
  }

  public toScreen(p: PluginPoint) {
    if (!this.kLineSeries || !p.x || !p.y) return
    return getScreenPositonFromTP(this.chart, this.kLineSeries, p.x, p.y)
  }
}
