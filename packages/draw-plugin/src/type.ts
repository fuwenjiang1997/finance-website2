import { BarPrice, IChartApi, ISeriesApi, LineStyle, SeriesType } from 'lightweight-charts'
import { Ref } from 'vue'

export enum PluginCategory {
  Line = 'line',
}

export enum PluginName {
  lineSegment = 'lineSegment',
  // lineRay = 'lineRay',
}

export interface PluginPoint {
  x: number
  y: number
}

export enum PluginWidth {
  w1 = 1,
  w2 = 2,
  w3 = 3,
  w4 = 4,
}

export interface PluginStore {
  points: PluginPoint[]
  series: (ISeriesApi<SeriesType> | undefined)[]
  width: PluginWidth
  lineStyle: LineStyle
}

export interface PluginRes {
  name: PluginName
  category: PluginCategory
  store: Readonly<PluginStore>
  isFinished: Ref<Boolean>
  setPoint: (points: PluginPoint[]) => void
  setWidth: (w: number) => void
  isFoucus: (p: PluginPoint) => boolean
  destory: () => void
  setLineStyle?: (v: LineStyle) => void
  click: (e: MouseEvent, point: PluginPoint) => any
  mousedown: (e: MouseEvent, point: PluginPoint) => any
  mousemove: (e: MouseEvent, point: PluginPoint) => any
  mouseup: (e: MouseEvent, point: PluginPoint) => any
}

export interface PluginParams {
  kLineSeries: ISeriesApi<SeriesType> | undefined
  finished?: () => void
  getScreenPositionFromPoint: (p: PluginPoint) => PluginPoint | null | undefined
  getPointFromMouseEvent: (
    e: MouseEvent,
  ) => [{ time: number; price: BarPrice | null } | undefined, p: PluginPoint | undefined]
}

export type Plugin = (chart: IChartApi, params: PluginParams) => PluginRes

// 定义画线工具的公共接口
export interface IDrawingTool {
  isDrawing: boolean // 是否正在绘制中
  isSelected: boolean // 是否被选中
  isDragging: boolean // 是否正在拖拽中
  // 具体渲染相关的数据
  store: {
    id: string
    isLocked: boolean // 是否被锁定
    points: PluginPoint[]
  }
  render?: (point: PluginPoint[]) => void
  // 命中检测：检查坐标是否在图形上
  isPointNear(point: PluginPoint): boolean
  // 处理鼠标交互事件
  onClick(point: PluginPoint): void
  onCrosshairClick(point: PluginPoint): void
  onMouseMove(point: PluginPoint): void
  onChartCrosshairMove(point: PluginPoint): void
  onMouseDown(point: PluginPoint): void
  onDrag(point: PluginPoint): void
  onMouseUp(point: PluginPoint): void
  // 判断绘制是否完成
  isComplete(): boolean
  deselect(): void
  select(): void
  // 移除图形
  remove(): void
}
