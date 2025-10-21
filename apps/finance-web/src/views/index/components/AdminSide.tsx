import { MyTagButton, MyTagButtonSize } from '@/components/button/MyTagButton'
import { defineComponent, isRef, ref } from 'vue'
import { OnClickOutside } from '@vueuse/components'
import { useChartStore } from '@/stores/chartStore'
import { storeToRefs } from 'pinia'

enum DrawCategory {
  Line = 'line',
}

interface DrawInfoData {
  name: string
  value: string
  icon: string
}

type DrawInfoParams = { category: DrawCategory; data: DrawInfoData[]; categoryName: string }

type SelectedDrawMap = Record<DrawCategory, DrawInfoData>

export default defineComponent({
  setup() {
    const chartStore = useChartStore()
    const { activePlugin, selectedPluginsMap, pluginsInfo } = storeToRefs(chartStore)
    const showPopupName = ref<DrawCategory | undefined>()

    function toggleShowPopup(group: DrawInfoParams) {
      console.log(showPopupName.value, group.category)
      if (showPopupName.value === group.category) {
        showPopupName.value = undefined
        return
      }
      showPopupName.value = group.category
    }

    function closePopup() {
      setTimeout(() => {
        console.log('showPopupName.value:>>', showPopupName.value)
        if (showPopupName.value) {
          showPopupName.value = undefined
        }
      }, 0)
    }

    function onSelectDrawItem(item: DrawInfoData, group: DrawInfoParams) {
      selectedPluginsMap.value[group.category] = item
      activePlugin.value = item
      closePopup()
    }
    function onActiveDraw(item: DrawInfoData | undefined) {
      if (item) {
        activePlugin.value = item
      }
    }

    return () => (
      <div class={' w-12 h-full bg-white'}>
        {pluginsInfo.value.map((group) => {
          return (
            <div class={'relative flex-center'}>
              <MyTagButton
                active={
                  activePlugin.value?.value === selectedPluginsMap.value[group.category]?.value
                }
                size={MyTagButtonSize.Large}
                activeBgColor="#ebebeb"
                onClick={() => onActiveDraw(selectedPluginsMap.value[group.category])}
              >
                <i
                  class={['iconfont !text-[24px]', selectedPluginsMap.value[group.category]?.icon]}
                ></i>
              </MyTagButton>
              <div class={'w-2'}>
                {group.data.length > 1 && (
                  <MyTagButton
                    class="!min-w-0 w-2 !px-0"
                    active={showPopupName.value === group.category}
                    onClick={() => toggleShowPopup(group)}
                  >
                    <i class={'iconfont icon-xiangyou1 !text-xs'}></i>
                  </MyTagButton>
                )}
              </div>

              {showPopupName.value === group.category && group.data.length > 0 && (
                <OnClickOutside onTrigger={() => closePopup()}>
                  <div
                    class={
                      'absolute left-full top-0 w-[200px] flex flex-col rounded overflow-hidden bg-white z-10 box-shadow text-sm'
                    }
                  >
                    <div class={'pt-3 pb-1 pl-2 '}>{group.categoryName}</div>
                    {group.data.map((item) => {
                      return (
                        <div
                          class={
                            'flex gap-2 items-center py-1 px-2 cursor-pointer hover:bg-gray-900 hover:text-white'
                          }
                          onClick={() => onSelectDrawItem(item, group)}
                        >
                          <i class={['iconfont !text-2xl', item.icon]}></i>
                          <span class={' select-none'}>{item.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </OnClickOutside>
              )}
            </div>
          )
        })}
      </div>
    )
  },
})
