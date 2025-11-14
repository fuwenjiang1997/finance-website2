import {
  CCI,
  INDEX_NAME,
  MACD,
  SMA,
  type IDrawingIndexClass,
  type KLineIndexData,
} from '@fuwenjiang1997/draw-plugin'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import { ref, shallowRef, watch, type ComputedRef } from 'vue'
import { usePane, type UsePane } from './usePane'

export interface InitParams {
  chart: IChartApi
  kLineSeries: ISeriesApi<SeriesType>
  chartContainer: HTMLElement
}

export const useDrawingIndexManager = (data: ComputedRef<KLineIndexData>) => {
  const indexMap: { [k: string]: IDrawingIndexClass } = {
    [INDEX_NAME.MACD]: MACD,
    [INDEX_NAME.CCI]: CCI,
    [INDEX_NAME.SMA]: SMA,
  }
  let chart: IChartApi
  let kLineSeries: ISeriesApi<SeriesType>
  let chartContainer: HTMLElement
  const renderIndexList = shallowRef<UsePane[]>([])
  const renderIndexNameList = ref<INDEX_NAME[]>([])

  function init(params: InitParams) {
    chart = params.chart
    kLineSeries = params.kLineSeries
    chartContainer = params.chartContainer
  }

  function addIndex(name: INDEX_NAME, positionIndex?: number) {
    const plugin = indexMap?.[name]
    if (!plugin || !chart || !kLineSeries || !chartContainer) return

    const instanceIndex = new plugin(chartContainer, chart, kLineSeries)

    if (positionIndex !== undefined) {
      const pane = renderIndexList.value[positionIndex]
      if (!pane) return

      pane.removePlugin()
      renderIndexNameList.value.splice(positionIndex, 0, name)
      pane.addPlugin(instanceIndex)
    } else {
      const pane = usePane(chart, chartContainer)
      pane.addPlugin(instanceIndex)
      renderIndexNameList.value.push(name)
      renderIndexList.value.push(pane)
      positionIndex = renderIndexList.value.length - 1
    }

    updateIndex(positionIndex)
  }

  function removeIndex(name?: INDEX_NAME, index: number = -1) {
    if (name) {
      index = renderIndexNameList.value.findIndex((item) => item === name)
    }
    if (index === -1) return

    renderIndexList.value[index]?.remove()
    renderIndexList.value.splice(index, 1)
    renderIndexNameList.value.splice(index, 1)
  }

  function setIndex(name: INDEX_NAME, index: number) {
    // renderIndexList.value[index]?.remove()
    addIndex(name, index)
  }

  function updateIndex(index?: number) {
    if (data.value.closes.length === 0 || renderIndexList.value.length === 0) return

    if (index === undefined) {
      renderIndexList.value.forEach((item) => {
        item.plugin.value?.setData(data.value)
      })
    } else if (renderIndexList.value[index]) {
      renderIndexList.value[index]?.plugin.value?.setData(data.value)
    }
  }

  watch(
    () => data.value,
    () => {
      updateIndex()
    },
    { immediate: true },
  )

  return {
    renderIndexList,
    init,
    addIndex,
    removeIndex,
    setIndex,
    renderIndexNameList,
  }
}
