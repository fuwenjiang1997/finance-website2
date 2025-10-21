import { computed, onBeforeUnmount, ref, watch, type Ref, type ShallowRef } from 'vue'
import type { DrawInfoData } from './useDrawPlugin'
import type { BarPrice, IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts'
import plugins, { PluginName, type Plugin, type PluginRes } from '@fuwenjiang1997/draw-plugin'

interface Point {
  x: number
  y: number
}

export interface UsePlguinControllerParams {
  chart: Ref<IChartApi | undefined>
  uiActivePlugin: Ref<DrawInfoData | undefined>
  theChartRef: ShallowRef<HTMLElement | null | undefined>
}

export interface InitParams {
  kLineSeries?: ISeriesApi<SeriesType>
}
export const usePlguinController = ({
  chart,
  uiActivePlugin,
  theChartRef,
}: UsePlguinControllerParams) => {
  const drawPlugins = ref<PluginRes[]>([])
  const currentDrawPlugin = ref<PluginRes>()
  const kLineSeries = ref<ISeriesApi<SeriesType>>()

  const plugin = computed(() => {
    if (uiActivePlugin.value && plugins[uiActivePlugin.value.value as PluginName]) {
      return plugins[uiActivePlugin.value.value as PluginName]
    }
    return undefined
  })

  function getPointFromMouseEvent(event: MouseEvent) {
    const container = theChartRef.value
    if (!chart.value || !container || !kLineSeries.value) return null

    const rect = container.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    return [getTimePriceFromPosition(x, y), { x, y }]
  }

  function getTimePriceFromPosition(chartX: number, chartY: number) {
    if (!chart.value) return
    const time = chart.value.timeScale().coordinateToTime(chartX)
    if (kLineSeries.value) {
      return { time: time as number, price: kLineSeries.value.coordinateToPrice(chartY) }
    }
    return
  }

  function getScreenPositionFromPoint(p: Point): Point | null | undefined {
    if (!chart.value) return
    const timeScale = chart.value.timeScale()
    const mainSeries = kLineSeries.value
    if (!mainSeries) return null
    const x = timeScale.timeToCoordinate(p.x as Time)
    const y = mainSeries.priceToCoordinate(p.y)
    if (x === null || y === null) return null
    return { x, y }
  }

  const handler = {
    mousemove: (event: MouseEvent) => {
      event.stopPropagation()
      const [point] = getPointFromMouseEvent(event)
      if (!point?.time || !point.price) return
      currentDrawPlugin.value?.mousemove(event, { x: point.time, y: point.price })
    },
    click: (event: MouseEvent) => {
      const [point] = getPointFromMouseEvent(event)
      console.log('point:', point)
      if (!point?.time || !point.price) return

      currentDrawPlugin.value?.click(event, { x: point.time, y: point.price })
    },
    mousedown: (event: MouseEvent) => {
      // if (!point?.price) return
      const [point, screenPoint] = getPointFromMouseEvent(event)
      if (!point?.time || !point.price) return

      if (!currentDrawPlugin.value) {
        const selectPlugin = drawPlugins.value.find((item) => {
          return item.isFoucus(screenPoint) && item
        })

        if (selectPlugin) {
          console.log('命中了:')
          if (currentDrawPlugin.value !== selectPlugin) {
            currentDrawPlugin.value = selectPlugin
          }
        } else if (!selectPlugin && plugin.value && chart.value) {
          const newDrawPlugin = plugin.value(chart.value, {
            finished: () => {
              console.log('已完成')
              currentDrawPlugin.value = undefined
              uiActivePlugin.value = undefined
            },
            kLineSeries,
            getScreenPositionFromPoint,
          })

          drawPlugins.value.push(newDrawPlugin)
          currentDrawPlugin.value = newDrawPlugin
        } else {
          console.log('啥也不是:')
          return
        }
      } else {
        console.log('元阿里的:')
      }

      currentDrawPlugin.value?.mousedown(event, { x: point.time, y: point.price })
    },
    mouseup: (event: MouseEvent) => {
      event.stopPropagation()
      const [point] = getPointFromMouseEvent(event)
      if (!point?.time || !point.price) return
      currentDrawPlugin.value?.mouseup(event, { x: point.time, y: point.price })
    },
  }

  function init(params: InitParams) {
    kLineSeries.value = params.kLineSeries
    addEventListenerHandler()
  }

  // 监听chart中鼠标的点击、移动事件
  function addEventListenerHandler() {
    theChartRef.value?.addEventListener('click', handler.click)
    theChartRef.value?.addEventListener('mousemove', handler.mousemove)
    theChartRef.value?.addEventListener('mousedown', handler.mousedown)
    theChartRef.value?.addEventListener('mouseup', handler.mouseup)
  }
  function removeEventListenerHandler() {
    theChartRef.value?.removeEventListener('click', handler.click)
    theChartRef.value?.removeEventListener('mousemove', handler.mousemove)
    theChartRef.value?.removeEventListener('mousedown', handler.mousedown)
    theChartRef.value?.removeEventListener('mouseup', handler.mouseup)
  }

  const destory = () => {
    // todo 销毁这个chart
    removeEventListenerHandler()
  }

  onBeforeUnmount(() => {
    destory()
  })

  return {
    init,
    drawPlugins,
  }
}
