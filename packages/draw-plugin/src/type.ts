import { IChartApi, ISeriesApi, LineStyle, SeriesType } from 'lightweight-charts'

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
  setPoint: (fn: (oldPoints: PluginPoint[]) => PluginPoint[]) => void
  setWidth: (w: number) => void
  isFoucus: (p: PluginPoint) => boolean
  destory: () => void
  setLineStyle?: (v: LineStyle) => void
}

export type Plugin = (chart: IChartApi) => PluginRes
