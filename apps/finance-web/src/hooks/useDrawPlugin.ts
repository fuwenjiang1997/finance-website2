import plugins, { PluginName } from '@fuwenjiang1997/draw-plugin'
import { ref } from 'vue'

enum DrawCategory {
  Select = 'select',
  Line = 'line',
}

export interface DrawInfoData {
  name: string
  value: string
  icon: string
}

export type DrawInfoParams = { category: DrawCategory; data: DrawInfoData[]; categoryName: string }
const SelectDot = 'noneSelectDot'

export function useDrawPlugin() {
  console.log('allPlugins:', plugins)
  const uiActivePlugin = ref<DrawInfoData>()

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
        { name: '线段', value: PluginName.lineSegment, icon: 'icon-xianduan' },
        { name: '线段', value: PluginName.lineSegment, icon: 'icon-xianduan' },
        { name: '线段', value: PluginName.lineSegment, icon: 'icon-xianduan' },
        // { name: '射线', value: 'Ray', icon: 'icon-shexian' },
      ],
    },
  ])
  const uiSelectedPluginsMap = ref<{ [k: string]: DrawInfoData }>({})
  const uiPluginMap = ref<{ [k: string]: DrawInfoData }>({})

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
    uiSelectedPluginsMap,
    uiPluginMap,
  }
}
