import { MyTagButton } from '@/components/button/MyTagButton'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    return () => (
      <div class={'h-10 w-full flex items-center bg-white'}>
        <div>1</div>
        <div class={'ml-auto flex gap-2'}>
          <MyTagButton active={true}>
            <i class={'iconfont icon-shezhi'}></i>
          </MyTagButton>

          <MyTagButton>
            <i class={'iconfont icon-24gl-fullScreenEnter'}></i>
          </MyTagButton>

          <MyTagButton>
            <i class={'iconfont icon-24gl-fullScreenExit'}></i>
          </MyTagButton>
        </div>
      </div>
    )
  },
})
