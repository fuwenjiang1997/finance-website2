import service from '../request'

/**
 * 获取股票列表
 * @returns
 */
export function apiGetStockList() {
  return service.get('/kline/symbols')
}

/**
 * 获取 K 线数据
 * @param {*} model K 线类型, 1m, 5m
 * @returns
 */
export function apiGetKLineData(params) {
  return service.get(`/kline/series`, {
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
