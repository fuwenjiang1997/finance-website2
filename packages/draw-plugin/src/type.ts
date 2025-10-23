import { LineData, LineStyle, Time } from 'lightweight-charts'

export interface PluginPoint {
  x: number
  y: number
}
export type PluginTpPoint = LineData<Time>

export enum PluginWidth {
  w1 = 1,
  w2 = 2,
  w3 = 3,
  w4 = 4,
}

// 定义画线工具的公共接口
export interface IDrawingTool {
  isDrawing: boolean // 是否正在绘制中
  isSelected: boolean // 是否被选中
  isDragging: boolean // 是否正在拖拽中
  // 具体渲染相关的数据
  store: {
    id: string
    isLocked: boolean // 是否被锁定
    points: PluginTpPoint[]
    lineWidth: PluginWidth
    lineStyle: LineStyle
  }
  render?: (point: PluginTpPoint[]) => void
  // 命中检测：检查坐标是否在图形上
  isPointNear(point: PluginTpPoint): boolean
  // 处理鼠标交互事件
  onClick(point: PluginTpPoint): void
  onCrosshairClick(point: PluginTpPoint): void
  onMouseMove(point: PluginTpPoint): void
  onChartCrosshairMove(point: PluginTpPoint): void
  onMouseDown(point: PluginTpPoint): void
  onDrag(point: PluginTpPoint): void
  onMouseUp(point: PluginTpPoint): void
  // 判断绘制是否完成
  isComplete(): boolean
  deselect(): void
  select(): void
  // 移除图形
  remove(): void
}
