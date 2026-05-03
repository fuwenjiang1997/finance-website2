import { IChartApi, IPaneApi, LineData, LineStyle, Time } from 'lightweight-charts'
import { ChartColorParams } from '@fuwenjiang1997/common-types'

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

export enum PluginLineColor {
  Selected = '#1E88E5',
}

// 定义画线工具的公共接口
export interface IDrawingTool {
  isDrawing: boolean // 是否正在绘制中
  isSelected: boolean // 是否被选中
  isDragging: boolean // 是否正在拖拽中
  isDeleted: boolean // 是否被删除
  // 具体渲染相关的数据
  store: {
    id: string
    color: string
    isLocked: boolean // 是否被锁定
    points: PluginTpPoint[]
    lineWidth: PluginWidth
    lineStyle: LineStyle
    lineVisible: boolean
  }
  render: (point: PluginTpPoint[]) => void
  updateSet: () => void
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
  setLineWidth: (v: PluginWidth) => void
  setLineStyle: (v: LineStyle) => void
  setLock: (v: boolean) => void
  setLineColor: (v: string) => void
  setLineVisible: (v: boolean) => void
}

export interface IDrawingIndex {
  isDeleted: boolean // 是否被删除
  // data: KLineIndexData | undefined
  store: {
    id: string
    color: string
    lineWidth: PluginWidth
    lineStyle: LineStyle
    visible: boolean
  }

  remove(): void
  render(v: KLineIndexData): void
  setLineWidth: (v: PluginWidth) => void
  setLineColor: (v: string) => void
  setVisible: (v: boolean) => void
  setData: (v: any) => void
  setPane: (v: IPaneApi<Time>) => void
  setColor: (v: ChartColorParams) => void
  reRender: () => void
}

export interface KLineIndexData {
  closes: number[]
  opens: number[]
  highs: number[]
  lows: number[]
  times: number[]
  openTimes: number[]
  volume: number[]
}

export interface InitIndexParams {
  chart: IChartApi
}

export enum INDEX_NAME {
  MACD = 'MACD',
  CCI = 'CCI',
  SMA = 'SMA',
  TRADINGVOLUME = 'TradingVolume',
}

export enum INDEX_TYPE {
  MAIN = 'main', // 主图
  VICE = 'vice', // 幅图
}
