import { MyTagButton, MyTagButtonSize } from '@/components/button/MyTagButton'
import { defineComponent, ref, type Ref } from 'vue'
import { OnClickOutside } from '@vueuse/components'
import { throttle } from 'lodash-es'

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
    const drawInfo: DrawInfoParams[] = [
      {
        category: DrawCategory.Line,
        categoryName: '线段',
        data: [
          { name: '线段', value: 'LineSegment', icon: 'icon-xianduan' },
          { name: '射线', value: 'Ray', icon: 'icon-shexian' },
        ],
      },
    ]

    const selectedDrawMap = ref<Partial<SelectedDrawMap>>({})
    const activeDraw = ref<DrawInfoData | undefined>()
    const showPopupName = ref<DrawCategory | undefined>()

    drawInfo.forEach((item) => {
      selectedDrawMap.value[item.category] = item.data[0]
    })

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
      selectedDrawMap.value[group.category] = item
      activeDraw.value = item
      closePopup()
    }
    function onActiveDraw(item: DrawInfoData | undefined) {
      if (item) {
        activeDraw.value = item
      }
    }

    return () => (
      <div class={' w-12 h-full bg-white'}>
        {drawInfo.map((group) => {
          return (
            <div class={'relative flex-center'}>
              <MyTagButton
                active={activeDraw.value?.value === selectedDrawMap.value[group.category]?.value}
                size={MyTagButtonSize.Large}
                activeBgColor="#ebebeb"
                onClick={() => onActiveDraw(selectedDrawMap.value[group.category])}
              >
                <i
                  class={['iconfont !text-[24px]', selectedDrawMap.value[group.category]?.icon]}
                ></i>
              </MyTagButton>
              <MyTagButton
                class="!min-w-0 !px-0"
                active={showPopupName.value === group.category}
                onClick={() => toggleShowPopup(group)}
              >
                <i class={'iconfont icon-xiangyou1 !text-xs'}></i>
              </MyTagButton>

              {showPopupName.value === group.category && (
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
