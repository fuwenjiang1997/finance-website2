import { INDEX_TYPE, type DrawIndex } from '@fuwenjiang1997/draw-plugin'
import type { IChartApi, IPaneApi, Time } from 'lightweight-charts'
import { shallowRef } from 'vue'

export type UsePane = ReturnType<typeof usePane>

export const usePane = (chart: IChartApi, chartContainer: HTMLElement) => {
  const pane = shallowRef<IPaneApi<Time>>()
  const plugin = shallowRef<DrawIndex | undefined>()

  function remvePane() {
    if (!pane.value) return

    console.log('pane.value.paneIndex():', pane.value.paneIndex())
    chart.removePane(pane.value.paneIndex())
    pane.value = undefined
  }

  function createPane() {
    if (pane.value) return

    pane.value = chart.addPane(true)
    const h = chartContainer.clientHeight
    const panes = chart.panes()
    setTimeout(() => {
      panes.forEach((item) => {
        item.setHeight(h * 0.12)
      })
    })
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

  return {
    pane,
    remvePane,
    addPlugin,
    removePlugin,
    remove,
    plugin,
  }
}
