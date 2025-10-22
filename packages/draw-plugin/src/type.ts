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
