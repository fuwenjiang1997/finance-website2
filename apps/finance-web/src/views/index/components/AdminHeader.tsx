import { MyTagButton } from '@/components/button/MyTagButton'
import { defineComponent } from 'vue'
import Search from './Search'
import { useFullscreen } from '@vueuse/core'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

export default defineComponent({
  setup() {
    const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()

    const userStore = useUserStore()
    const { userInfo } = storeToRefs(userStore)

    return () => (
      <div class={'h-10 w-full flex items-center gap-2 bg-white'}>
        <div class={'flex flex-1 overflow-hidden'}>
          <div class={' w-12 flex-center '}>
            {userInfo.value ? (
              <div class={'w-8 h-8 flex-center text-white bg-red-800 rounded-full'}>F</div>
            ) : (
              <RouterLink to={'/signin'}>登录</RouterLink>
            )}
          </div>
          <Search />
        </div>
        <div class={'shrink-0 flex pr-1 text-black'}>
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
