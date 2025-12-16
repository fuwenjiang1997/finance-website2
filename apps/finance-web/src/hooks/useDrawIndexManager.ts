import {
  CCI,
  INDEX_NAME,
  MACD,
  SMA,
  TradingVolume,
  CHANLUN,
  type IDrawingIndexClass,
  type KLineIndexData,
} from '@fuwenjiang1997/draw-plugin'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import { computed, ref, watch, type ComputedRef } from 'vue'
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
    [INDEX_NAME.CHANLUN]: CHANLUN,
  }
  let chart: IChartApi
  let kLineSeries: ISeriesApi<SeriesType>
  let chartContainer: HTMLElement
  const renderIndexList = ref<UsePane[]>([])
  const renderIndexNameList = computed(() => {
    return renderIndexList.value.map((item) => item.plugin?.name).filter(Boolean)
  })

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
      // renderIndexNameList.value.splice(positionIndex, 0, name)
      pane.addPlugin(instanceIndex)
    } else {
      const pane = usePane(chart, chartContainer)
      pane.addPlugin(instanceIndex)
      renderIndexList.value.push(pane)
      positionIndex = renderIndexList.value.length - 1
    }

    renderIndexList.value[positionIndex]?.setColor(params.colors.value)
    updateIndex(positionIndex)
  }

  async function removeIndex(name?: INDEX_NAME, index: number = -1) {
    if (name) {
      index = renderIndexList.value.findIndex((item) => item.plugin?.name === name)
    }
    if (index === -1) return
    const removePane = renderIndexList.value[index]
    removePane?.remove()
    renderIndexList.value.splice(index, 1)
    updatePanesEl()
  }

  function updatePanesEl() {
    renderIndexList.value.forEach((item) => {
      item.updatePaneEl(item.pane)
    })
  }

  function setIndex(name: INDEX_NAME, index: number) {
    // renderIndexList.value[index]?.remove()
    addIndex(name, index)
  }

  function updateIndex(index?: number) {
    if (data.value.closes.length === 0 || renderIndexList.value.length === 0) return

    if (index === undefined) {
      renderIndexList.value.forEach((item) => {
        item.plugin?.setData(cloneDeep(data.value))
      })
    } else if (renderIndexList.value[index]) {
      renderIndexList.value[index]?.plugin?.setData(data.value)
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
