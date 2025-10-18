import { MyTagButton } from '@/components/button/MyTagButton'
import { defineComponent, ref } from 'vue'
import Search from './Search'
import { useFullscreen } from '@vueuse/core'
import SetDialog from './SetDialog'

export default defineComponent({
  setup() {
    const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()
    return () => (
      <div class={'h-10 w-full flex items-center bg-white'}>
        <div class={'flex'}>
          <div class={' w-12 flex-center '}>
            <div class={'w-8 h-8 flex-center text-white bg-red-800 rounded-full'}>F</div>
          </div>
          <Search></Search>
        </div>
        <div class={'ml-auto flex pr-1 text-black'}>
          <MyTagButton>
            <i class={'iconfont icon-shezhi'}></i>
          </MyTagButton>
          {/* <SetDialog></SetDialog> */}

          <MyTagButton onClick={toggleFullScreen}>
            <i
              class={[
                'iconfont',
                isFullscreen ? 'icon-24gl-fullScreenEnter' : 'icon-24gl-fullScreenExit',
              ]}
            ></i>
          </MyTagButton>
        </div>
      </div>
    )
  },
})
