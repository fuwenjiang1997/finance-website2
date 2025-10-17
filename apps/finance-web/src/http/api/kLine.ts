import service from '../request'

// 获取股票列表
export function apiGetStockList<T>() {
  return service.get<T>('/kline/symbols')
}

export function apiGetKLineData<T>(params: {
  symbol: string
  interval: string
  startTime: number
  endTime: number
  limit: number
}) {
  return service.get<T>(`/kline/series`, {
    params,
  })
}

// -------------- 获取所有模拟历史
export const apiTradingBuy = (params) => {
  return service.post('/trade/order', params)
}
export const apiTradingSell = (params) => {
  return service.put('/trade/order', params)
}
export const apiTradingList = (params) => {
  return service.get('/trade/orders', { params })
}

export const apiTradingHistoryList = (params) => {
  return service.get('/trade/sessions', { params })
}

export const apiTradingCreateSessiton = (params) => {
  return service.post('/trade/session', params)
}
