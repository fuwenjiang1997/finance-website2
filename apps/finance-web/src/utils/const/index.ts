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

export const indexListMap: { [key: string]: { label: string; value: INDEX_NAME } } = {
  [INDEX_NAME.MACD]: { label: 'MACD', value: INDEX_NAME.MACD },
  [INDEX_NAME.CCI]: { label: 'CCI', value: INDEX_NAME.CCI },
}

export const DEFAULT_UP_COLOR = '#26a69a' // 涨绿色
export const DEFAULT_DOWN_COLOR = '#ef5350' // 跌红色
