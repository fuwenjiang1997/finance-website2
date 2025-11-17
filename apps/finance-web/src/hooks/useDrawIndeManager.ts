import {
  CCI,
  INDEX_NAME,
  MACD,
  SMA,
  TradingVolume,
  type IDrawingIndexClass,
  type KLineIndexData,
} from '@fuwenjiang1997/draw-plugin'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import { ref, shallowRef, watch, type ComputedRef } from 'vue'
import { usePane, type UsePane } from './usePane'
import type { ChartColorParams } from '@fuwenjiang1997/common-types'
import { cloneDeep } from 'lodash-es'

export interface InitParams {
  chart: IChartApi
  kLineSeries: ISeriesApi<SeriesType>
  chartContainer: HTMLElement
}

export const useDrawingIndexManager = (
  data: ComputedRef<KLineIndexData>,
  params: {
    colors: ComputedRef<ChartColorParams>
  },
) => {
  const indexMap: { [k: string]: IDrawingIndexClass } = {
    [INDEX_NAME.MACD]: MACD,
    [INDEX_NAME.CCI]: CCI,
    [INDEX_NAME.SMA]: SMA,
    [INDEX_NAME.TRADINGVOLUME]: TradingVolume,
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
    const _renderIndexList = cloneDeep(renderIndexList.value)

    if (positionIndex !== undefined) {
      const pane = _renderIndexList[positionIndex]
      if (!pane) return

      pane.removePlugin()
      renderIndexNameList.value.splice(positionIndex, 0, name)
      pane.addPlugin(instanceIndex)
    } else {
      const pane = usePane(chart, chartContainer)
      pane.addPlugin(instanceIndex)
      renderIndexNameList.value.push(name)
      _renderIndexList.push(pane)
      positionIndex = _renderIndexList.length - 1
    }

    _renderIndexList[positionIndex]?.setColor(params.colors.value)
    renderIndexList.value = _renderIndexList

    updateIndex(positionIndex)
  }

  watch(
    () => renderIndexList.value,
    () => {
      console.log('改变了:')
    },
  )

  function removeIndex(name?: INDEX_NAME, index: number = -1) {
    if (name) {
      index = renderIndexNameList.value.findIndex((item) => item === name)
    }
    if (index === -1) return
    const _renderIndexList = cloneDeep(renderIndexList.value)
    _renderIndexList[index]?.remove()
    _renderIndexList.splice(index, 1)
    renderIndexList.value = _renderIndexList
    renderIndexNameList.value.splice(index, 1)
  }

  function setIndex(name: INDEX_NAME, index: number) {
    // renderIndexList.value[index]?.remove()
    addIndex(name, index)
  }

  function updateIndex(index?: number) {
    if (data.value.closes.length === 0 || renderIndexList.value.length === 0) return

    if (index === undefined) {
      // for (let i = 0; i < renderIndexList.value.length; i++) {
      //   const item = renderIndexList.value[i]
      //   item?.plugin.value?.setData(cloneDeep(data.value))
      // }
      renderIndexList.value.forEach((item) => {
        console.log('更新:', item)
        item.plugin.value?.setData(cloneDeep(data.value))
      })
    } else if (renderIndexList.value[index]) {
      renderIndexList.value[index]?.plugin.value?.setData(data.value)
    }
  }

  watch(
    params.colors,
    (newColors) => {
      renderIndexList.value.forEach((item) => {
        item.setColor(newColors)
      })
    },
    { deep: true },
  )

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
