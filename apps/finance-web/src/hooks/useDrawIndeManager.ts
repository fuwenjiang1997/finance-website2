import {
  DrawIndex,
  INDEX_NAME,
  MACD,
  type IDrawingIndexClass,
  type KLineIndexData,
} from '@fuwenjiang1997/draw-plugin'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import { ref, shallowRef, watch, type ComputedRef } from 'vue'

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
  const renderIndexNameList = ref<INDEX_NAME[]>([])

  function init(params: InitParams) {
    chart = params.chart
    kLineSeries = params.kLineSeries
  }

  function addIndex(name: INDEX_NAME, positionIndex?: number) {
    const plugin = indexMap?.[name]
    if (!plugin || !chart || !kLineSeries) return

    const pineIndex =
      positionIndex !== undefined ? positionIndex + 1 : renderIndexList.value.length + 1

    console.log('pineIndex:', pineIndex)
    const instanceIndex = new plugin(chart, kLineSeries, pineIndex)

    if (positionIndex !== undefined) {
      renderIndexList.value[positionIndex]?.remove()

      renderIndexNameList.value.splice(positionIndex, 0, name)
      renderIndexList.value.splice(positionIndex, 0, instanceIndex)
    } else {
      renderIndexNameList.value.push(name)
      renderIndexList.value.push(instanceIndex)
      positionIndex = renderIndexList.value.length - 1
    }

    updateIndex(positionIndex)
  }

  function removeIndex(name?: INDEX_NAME, index: number = -1) {
    if (name) {
      index = renderIndexNameList.value.findIndex((item) => item === name)
      // renderIndexList.value[index]?.remove()
      // renderIndexList.value.splice(index, 1)
      // renderIndexNameList.value.splice(index, 1)
      // return
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
        item.setData(data.value)
      })
    } else if (renderIndexList.value[index]) {
      renderIndexList.value[index]?.setData(data.value)
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
