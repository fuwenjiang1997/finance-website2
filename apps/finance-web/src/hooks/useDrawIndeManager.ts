import {
  DrawIndex,
  MACD,
  type IDrawingIndexClass,
  type KLineIndexData,
} from '@fuwenjiang1997/draw-plugin'
// import type { KLineOriginData } from '@fuwenjiang1997/trading-view-chart'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import { shallowRef, watch, type ComputedRef } from 'vue'

export interface InitParams {
  chart: IChartApi
  kLineSeries: ISeriesApi<SeriesType>
  chartContainer?: HTMLElement
}

export const useDrawingIndexManager = (data: ComputedRef<KLineIndexData>) => {
  const indexMap: { [k: string]: IDrawingIndexClass } = {
    MACD: MACD,
  }
  let chart: IChartApi
  let kLineSeries: ISeriesApi<SeriesType>
  const renderIndexList = shallowRef<DrawIndex[]>([])

  function init(params: InitParams) {
    chart = params.chart
    kLineSeries = params.kLineSeries

    addIndex('MACD')
  }

  function addIndex(name: string) {
    const plugin = indexMap?.[name]
    if (!plugin || !chart || !kLineSeries) return

    const instanceIndex = new plugin(chart, kLineSeries)
    renderIndexList.value.push(instanceIndex)
  }

  watch(
    () => data.value,
    (_data) => {
      if (_data.closes.length > 0) {
        renderIndexList.value.forEach((item) => {
          item.setData(_data)
        })
      }
    },
    { immediate: true },
  )

  return {
    renderIndexList,
    init,
  }
}
