import { sleep } from '@/utils/fun'
import type { ChartColorParams } from '@fuwenjiang1997/common-types'
import { INDEX_TYPE, type DrawIndex } from '@fuwenjiang1997/draw-plugin'
import { useResizeObserver } from '@vueuse/core'
import type { IChartApi, IPaneApi, Time } from 'lightweight-charts'
import { ref, shallowRef } from 'vue'

export type UsePane = ReturnType<typeof usePane>
export interface Position {
  left: number
  top: number
}
export const usePane = (chart: IChartApi, chartContainer: HTMLElement) => {
  const pane = shallowRef<IPaneApi<Time>>()
  const plugin = shallowRef<DrawIndex | undefined>()
  const paneEl = shallowRef<HTMLElement>()
  const resizeHandler = <((params: Position) => void)[]>[]

  const position = ref<Position>({
    left: 0,
    top: 0,
  })

  function remvePane() {
    if (!pane.value) return
    chart.removePane(pane.value.paneIndex())
    pane.value = undefined
  }

  useResizeObserver(paneEl, async (entries) => {
    const entry = entries[0]
    if (!entry) return

    if (!pane.value || !paneEl.value) return
    const el = entry.target as HTMLElement

    const parentEl = getChartEl(el)
    if (!parentEl) return
    await sleep()
    const rect = el.getBoundingClientRect()
    const pRect = parentEl.getBoundingClientRect()
    position.value = {
      left: rect.left - pRect.left,
      top: rect.top - pRect.top,
    }
    resizeHandler.forEach((fn) => {
      fn(position.value)
    })
  })

  async function createPane() {
    if (pane.value) return

    pane.value = chart.addPane(true)
    const h = chartContainer.clientHeight
    const panes = chart.panes()
    setTimeout(() => {
      panes.forEach((item) => {
        item.setHeight(h * 0.12)
      })
    })

    await sleep()
    paneEl.value = pane.value?.getHTMLElement() || undefined
  }
  function setColor(colors: ChartColorParams) {
    plugin.value?.setColor(colors)
  }

  function addPlugin(p: DrawIndex) {
    removePlugin()
    if (p.indexType === INDEX_TYPE.VICE) {
      createPane()
    }
    plugin.value = p
    if (pane.value) {
      plugin.value?.setPane(pane.value)
    }
  }
  function removePlugin() {
    if (!plugin.value) return
    plugin.value.remove()
    plugin.value = undefined
  }
  function remove() {
    removePlugin()
    remvePane()
  }
  function getChartEl(el: HTMLElement): HTMLElement | undefined {
    if (!el) return undefined
    if (el.classList.contains('chart-wrapper')) {
      return el
    } else {
      const parent = el.parentElement
      return parent ? getChartEl(parent) : undefined
    }
  }
  function addResizeHandler(fn: (params: Position) => void) {
    resizeHandler.push(fn)
  }
  function clearResizeHandler() {
    resizeHandler.length = 0
  }

  // function getPanePosition() {
  //   if (!pane.value) return
  //   const el = pane.value.getHTMLElement()
  //   if (!el) return
  //   const parentEl = getChartEl(el)
  //   if (!parentEl) return

  //   const pRect = parentEl.getBoundingClientRect()
  //   const rect = el.getBoundingClientRect()
  //   position.value.left = `${rect.left - pRect.left}px`
  //   position.value.top = `${rect.top - pRect.top}px`

  //   return position.value
  // }

  return {
    pane,
    remvePane,
    addPlugin,
    removePlugin,
    remove,
    plugin,
    position,
    setColor,
    addResizeHandler,
    clearResizeHandler,
    // getPanePosition,
  }
}
