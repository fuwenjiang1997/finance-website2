import plugins, { PluginName } from '@fuwenjiang1997/draw-plugin'
import { ref } from 'vue'

enum DrawCategory {
  Select = 'select',
  Line = 'line',
}

interface DrawInfoData {
  name: string
  value: string
  icon: string
}

export type DrawInfoParams = { category: DrawCategory; data: DrawInfoData[]; categoryName: string }
const SelectDot = 'selectDot'

export function useDrawPlugin() {
  console.log('allPlugins:', plugins)
  const activePlugin = ref<DrawInfoData>()

  const pluginsInfo = ref<DrawInfoParams[]>([
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
  const selectedPluginsMap = ref<{ [k: string]: DrawInfoData }>({})

  pluginsInfo.value.forEach((item) => {
    selectedPluginsMap.value[item.category] = item.data[0] as DrawInfoData
  })

  return {
    pluginsInfo,
    activePlugin,
    selectedPluginsMap,
  }
}
