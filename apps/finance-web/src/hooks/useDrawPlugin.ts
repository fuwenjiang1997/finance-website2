import { computed, ref } from 'vue'
import { LineSegment } from '@fuwenjiang1997/draw-plugin'

enum DrawCategory {
  Select = 'select',
  Line = 'line',
}

export interface DrawInfoData {
  name: string
  value: string
  icon: string
  plugin?: any
}
export enum PluginName {
  lineSegment = 'lineSegment',
}

export type DrawInfoParams = { category: DrawCategory; data: DrawInfoData[]; categoryName: string }
const SelectDot = 'noneSelectDot'

// const PLUGINS = {
//   [PluginName.lineSegment]: LineSegment
// }

export type UseDrawPluginRes = ReturnType<typeof useDrawPlugin>

export function useDrawPlugin() {
  const uiActivePluginKey = ref<PluginName | string>(SelectDot)
  const uiActivePlugin = computed(() => {
    return uiPluginMap.value[uiActivePluginKey.value]
  })

  const uiPluginsInfo = ref<DrawInfoParams[]>([
    {
      category: DrawCategory.Select,
      categoryName: '选择',
      data: [{ name: '点', value: SelectDot, icon: 'icon-jujiao' }],
    },
    {
      category: DrawCategory.Line,
      categoryName: '线段',
      data: [
        { name: '线段', value: PluginName.lineSegment, icon: 'icon-xianduan', plugin: LineSegment },
      ],
    },
  ])
  const uiSelectedPluginsMap = ref<{ [k: string]: DrawInfoData }>({})
  const uiPluginMap = ref<{ [k: string]: DrawInfoData }>({})

  function resetUiActivePluginKeyWhenDrawCompleted() {
    uiActivePluginKey.value = SelectDot
  }

  uiPluginsInfo.value.forEach((item) => {
    uiSelectedPluginsMap.value[item.category] = item.data[0] as DrawInfoData
    if (item.data.length > 0) {
      item.data.map((v) => {
        uiPluginMap.value[v.value] = v
      })
    }
  })

  return {
    uiPluginsInfo,
    uiActivePlugin,
    uiActivePluginKey,
    uiSelectedPluginsMap,
    uiPluginMap,
    resetUiActivePluginKeyWhenDrawCompleted,
  }
}
