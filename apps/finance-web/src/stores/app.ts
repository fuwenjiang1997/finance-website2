import { DEFAULT_DOWN_COLOR, DEFAULT_UP_COLOR } from '@/utils/const'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import Color from 'color'
import { type ChartColorParams } from '@fuwenjiang1997/common-types'

export interface AppSets {
  upColor: string
  downColor: string
}

export const useAppStore = defineStore('appStore', () => {
  const appSets = useLocalStorage<AppSets>('appSet', {
    upColor: DEFAULT_UP_COLOR,
    downColor: DEFAULT_DOWN_COLOR,
  })

  function reSetKLineColor() {
    appSets.value.downColor = DEFAULT_DOWN_COLOR
    appSets.value.upColor = DEFAULT_UP_COLOR
  }

  const uiColor = computed<ChartColorParams>(() => {
    const upColor = appSets.value.upColor
    const downColor = appSets.value.downColor

    return {
      upColor,
      downColor,
      volUpColor: Color(upColor).alpha(0.7).toString(),
      volDownColor: Color(downColor).alpha(0.7).toString(),
      upBgColor: Color(upColor).alpha(0.4).lighten(0.5).toString(),
      downBgColor: Color(downColor).alpha(0.8).lighten(0.5).toString(),
    }
  })

  return {
    appSets,
    reSetKLineColor,
    uiColor,
  }
})
