import { MyTagButton } from '@/components/button/MyTagButton'
import { defineComponent } from 'vue'
import Search from './Search'
import { useFullscreen } from '@vueuse/core'

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
        <div class={'ml-auto flex gap-2 pr-1'}>
          <MyTagButton active={true}>
            <i class={'iconfont icon-shezhi'}></i>
          </MyTagButton>

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
