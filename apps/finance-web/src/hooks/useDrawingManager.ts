import { reactive, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import type { DrawInfoData } from './useDrawPlugin'
import type {
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  SeriesType,
  UTCTimestamp,
} from 'lightweight-charts'
import { getTpFromMouseEvent, type IDrawingTool } from '@fuwenjiang1997/draw-plugin'
import { type UseDrawPluginRes } from '@/hooks/useDrawPlugin'

export interface UsePlguinControllerParams {
  chart: Ref<IChartApi | undefined>
  activePlugin: Ref<DrawInfoData | undefined>
  chartContainer: ShallowRef<HTMLElement | null | undefined>
}

export interface InitParams {
  chart: IChartApi
  kLineSeries: ISeriesApi<SeriesType>
  chartContainer: HTMLElement
}

export const useDrawingManager = ({ drawPluginHook }: { drawPluginHook: UseDrawPluginRes }) => {
  let chart: IChartApi
  let kLineSeries: ISeriesApi<SeriesType>
  let chartContainer: HTMLElement
  const drawings = reactive<IDrawingTool[]>([]) // 所有画的图
  // const activePlugin = ref<DrawInfoData>()
  let activeDrawingInstance: IDrawingTool | undefined
  const selectedDrawing = shallowRef<IDrawingTool>()

  const { uiActivePlugin, uiActivePluginKey } = drawPluginHook

  function getPoint(event: MouseEvent) {
    const { tp } = getTpFromMouseEvent(chart, kLineSeries, chartContainer, event)
    return tp
  }

  function deleteDraw(id: string) {
    if (selectedDrawing.value?.store.id === id) {
      selectedDrawing.value = undefined
    }
    const index = drawings.findIndex((item) => item.store.id === id)
    if (index !== -1) {
      drawings[index]?.remove()
      drawings.splice(index, 1)
    }
  }

  const deactivateTool = () => {
    if (activeDrawingInstance && !activeDrawingInstance.isComplete()) {
      // 如果工具未完成绘制就被取消，则从图上移除
      activeDrawingInstance.remove()
    }
    activeDrawingInstance = undefined
  }
  // 改变key的时候，检查当前有没有正在画的图
  watch(uiActivePluginKey, () => {
    deactivateTool()
  })

  const init = (params: InitParams) => {
    chart = params.chart
    kLineSeries = params.kLineSeries
    chartContainer = params.chartContainer

    addEventListenerHandler()
  }

  const handler = {
    mousedown: (event: MouseEvent) => {
      if (!chart || !kLineSeries || activeDrawingInstance) return
      if (!activeDrawingInstance && uiActivePlugin.value?.plugin) {
        activeDrawingInstance = new uiActivePlugin.value.plugin(chart, kLineSeries)
        return
      }

      /** 交互模式 */
      const point = getPoint(event)
      if (!point) return

      let clickedDrawing: IDrawingTool | undefined
      for (const drawing of drawings) {
        if (drawing.isPointNear(point)) {
          clickedDrawing = drawing
          break // 找到第一个即可
        }
      }
      if (clickedDrawing) {
        if (selectedDrawing.value && selectedDrawing.value !== clickedDrawing) {
          selectedDrawing.value.deselect()
        }
        selectedDrawing.value = clickedDrawing
        selectedDrawing.value.select()
        selectedDrawing.value.onMouseDown(point)
      } else {
        // 点击了空白区域，取消选中
        if (selectedDrawing.value) {
          selectedDrawing.value.deselect()
          selectedDrawing.value = undefined
        }
      }
    },
    mousemove: (event: MouseEvent) => {
      if (!chart || selectedDrawing.value?.store.isLocked) return
      const point = getPoint(event)
      if (!point) return

      if (selectedDrawing.value && selectedDrawing.value.isDragging) {
        selectedDrawing.value.onDrag(point)
        event.preventDefault()
        event.stopPropagation()
      } else {
        // 检查鼠标悬浮状态，改变指针样式
        let isOverDrawing = false
        if (!activeDrawingInstance) {
          // 只有在非绘制模式下才检查悬浮
          for (const drawing of drawings) {
            if (drawing.isPointNear(point)) {
              isOverDrawing = true
              break
            }
          }
        }

        if (chartContainer) {
          chartContainer.style.cursor = isOverDrawing ? 'pointer' : 'default'
        }
      }
    },
    mouseup: (event: MouseEvent) => {
      if (!chart) return

      if (selectedDrawing.value && selectedDrawing.value.isDragging) {
        const point = getPoint(event)
        if (!point) return
        selectedDrawing.value.onMouseUp(point)
      }
    },
    // click: (event: MouseEvent) => {},
    onChartClick: (param: MouseEventParams) => {
      if (!activeDrawingInstance || !chart || !param.point) return
      const time = param.time
      const price = kLineSeries.coordinateToPrice(param.point.y)
      if (!time || price === null) return

      activeDrawingInstance.onCrosshairClick({ time, value: price })

      if (activeDrawingInstance.isComplete()) {
        // activeDrawingInstance.draw() // 绘制最终形态
        drawings.push(activeDrawingInstance) // 添加到已完成列表

        activeDrawingInstance.select()
        selectedDrawing.value = drawings[drawings.length - 1]

        // 完成后自动取消工具
        drawPluginHook.resetUiActivePluginKeyWhenDrawCompleted()
      }
    },
    onChartCrosshairMove: (param: MouseEventParams) => {
      if (!activeDrawingInstance || !activeDrawingInstance.isDrawing || !chart || !param.point)
        return

      const time = param.time as UTCTimestamp
      // const mainSeries = chartInstance.getSeries()[0];
      const price = kLineSeries.coordinateToPrice(param.point.y)
      if (!time || price === null) return
      activeDrawingInstance.onChartCrosshairMove({ time, value: price })
    },
  }

  // 监听chart中鼠标的点击、移动事件
  function addEventListenerHandler() {
    chart?.subscribeClick(handler.onChartClick)
    chart?.subscribeCrosshairMove(handler.onChartCrosshairMove)
    // chartContainer?.addEventListener('click', handler.click)
    chartContainer?.addEventListener('mousemove', handler.mousemove)
    chartContainer?.addEventListener('mousedown', handler.mousedown)
    chartContainer?.addEventListener('mouseup', handler.mouseup)
  }

  function removeEventListenerHandler() {
    chart?.unsubscribeClick(handler.onChartClick)
    chart?.unsubscribeCrosshairMove(handler.onChartCrosshairMove)
    // chartContainer?.removeEventListener('click', handler.click)
    chartContainer?.removeEventListener('mousemove', handler.mousemove)
    chartContainer?.removeEventListener('mousedown', handler.mousedown)
    chartContainer?.removeEventListener('mouseup', handler.mouseup)
  }

  const clearAllDrawings = () => {
    drawings.forEach((d) => d.remove())
    drawings.length = 0 // 清空数组
  }

  const destory = () => {
    removeEventListenerHandler()
  }

  return {
    init,
    destory,
    clearAllDrawings,
    deleteDraw,
    selectedDrawing,
  }
}
