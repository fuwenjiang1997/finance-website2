import { type FunctionalComponent } from 'vue'
import { useRouter } from 'vue-router'
import BannerImg from '@/assets/img/sign-banner.webp'

export const SignLayout: FunctionalComponent = (props, { slots }) => {
  const router = useRouter()

  return (
    <div class="relative flex h-screen bg-white">
      <div
        class=" absolute right-4 top-4 w-8 h-8 flex-center bg-gray-50 cursor-pointer"
        onClick={() => router.push('/')}
      >
        <i class={' iconfont icon-close rotate-180'}></i>
      </div>
      <div class="w-1/2 flex-center">
        <img class="w-4/5 h-auto max-w-[600px] rounded-2xl" src={BannerImg} alt="" />
      </div>
      {slots.default?.()}
    </div>
  )
}
