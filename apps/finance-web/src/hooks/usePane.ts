import { sleep } from '@/utils/fun'
import type { ChartColorParams } from '@fuwenjiang1997/common-types'
import { INDEX_TYPE, type DrawIndex } from '@fuwenjiang1997/draw-plugin'
import { useResizeObserver } from '@vueuse/core'
import type { IChartApi, IPaneApi, Time } from 'lightweight-charts'
import { ref, shallowRef } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export type UsePane = ReturnType<typeof usePane>
export interface Position {
  left: number
  top: number
}
export const usePane = (chart: IChartApi, chartContainer: HTMLElement) => {
  const pane = shallowRef<IPaneApi<Time>>()
  const plugin = shallowRef<DrawIndex | undefined>()
  const paneEl = shallowRef<HTMLElement>()
  const id = uuidv4()

  const position = ref<Position>({
    left: 0,
    top: 0,
  })

  function remvePane() {
    if (!pane.value) return
    chart.removePane(pane.value.paneIndex())
    pane.value = undefined
  }

  const { stop } = useResizeObserver(paneEl, async (entries) => {
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
    updatePaneEl()
  }

  function setColor(colors: ChartColorParams) {
    plugin.value?.setColor(colors)
  }
  function addPlugin(p: DrawIndex) {
    // removePlugin()
    if (plugin.value) return

    if (p.indexType === INDEX_TYPE.VICE) {
      createPane()
    }
    if (pane.value) {
      plugin.value = p
      plugin.value?.setPane(pane.value)
    }
  }
  function removePlugin() {
    if (!plugin.value) return
    plugin.value.remove()
    plugin.value = undefined
  }
  function remove() {
    stop()
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
  async function updatePaneEl(_pane?: IPaneApi<Time>) {
    if (_pane) {
      pane.value = _pane
      plugin.value?.setPane(_pane)
    }

    const oldEl = paneEl.value
    const newEl = pane.value?.getHTMLElement() || undefined
    if (oldEl !== newEl) {
      paneEl.value = newEl
      console.log('paneEl.value:', paneEl.value === oldEl)
    }
  }

  return {
    id,
    pane,
    remvePane,
    addPlugin,
    removePlugin,
    remove,
    plugin,
    position,
    setColor,
    updatePaneEl,
  }
}
