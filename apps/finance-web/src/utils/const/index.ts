import { INDEX_NAME } from '@fuwenjiang1997/draw-plugin'

export enum KLineCircle {
  m1 = '1m',
  m5 = '5m',
  m15 = '15m',
  m30 = '30m',
  H1 = '1h',
  H4 = '4h',
  D1 = '1d',
  W1 = '1w',
  M1 = '1M',
}

export enum AKLineCircle {
  m1 = '1m',
  m5 = '5m',
  m15 = '15m',
  m30 = '30m',
  H1 = '1h',
  D1 = '1d',
  W1 = '1w',
  M1 = '1M',
}

export const cycleListMap: { [k in KLineCircle]: { label: string; value: KLineCircle } } = {
  [KLineCircle.m1]: { label: '1分钟', value: KLineCircle.m1 },
  [KLineCircle.m5]: { label: '5分钟', value: KLineCircle.m5 },
  [KLineCircle.m15]: { label: '15分钟', value: KLineCircle.m15 },
  [KLineCircle.m30]: { label: '30分钟', value: KLineCircle.m30 },
  [KLineCircle.H1]: { label: '1小时', value: KLineCircle.H1 },
  [KLineCircle.H4]: { label: '4小时', value: KLineCircle.H4 },
  [KLineCircle.D1]: { label: '1天', value: KLineCircle.D1 },
  [KLineCircle.W1]: { label: '1周', value: KLineCircle.W1 },
  [KLineCircle.M1]: { label: '1月', value: KLineCircle.M1 },
}

export const aCycleListMap: { [k in AKLineCircle]: { label: string; value: AKLineCircle } } = {
  [AKLineCircle.m1]: { label: '1分钟', value: AKLineCircle.m1 },
  [AKLineCircle.m5]: { label: '5分钟', value: AKLineCircle.m5 },
  [AKLineCircle.m15]: { label: '15分钟', value: AKLineCircle.m15 },
  [AKLineCircle.m30]: { label: '30分钟', value: AKLineCircle.m30 },
  [AKLineCircle.H1]: { label: '1小时', value: AKLineCircle.H1 },
  [AKLineCircle.D1]: { label: '1天', value: AKLineCircle.D1 },
  [AKLineCircle.W1]: { label: '1周', value: AKLineCircle.W1 },
  [AKLineCircle.M1]: { label: '1月', value: AKLineCircle.M1 },
}

export const indexListMap: { [key: string]: { label: string; value: INDEX_NAME } } = {
  [INDEX_NAME.MACD]: { label: 'MACD', value: INDEX_NAME.MACD },
  [INDEX_NAME.CCI]: { label: 'CCI', value: INDEX_NAME.CCI },
  [INDEX_NAME.TRADINGVOLUME]: { label: '成交量', value: INDEX_NAME.TRADINGVOLUME },
}

export const headerIndexListMap: { [key: string]: { label: string; value: INDEX_NAME } } = {
  [INDEX_NAME.SMA]: { label: 'SMA', value: INDEX_NAME.SMA },
}

export const DEFAULT_UP_COLOR = '#26a69a' // 涨绿色
export const DEFAULT_DOWN_COLOR = '#ef5350' // 跌红色
