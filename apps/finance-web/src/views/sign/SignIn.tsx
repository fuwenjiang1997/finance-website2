import { defineComponent, reactive, useTemplateRef } from 'vue'
import { SignLayout } from './components/SignLayout'
import {
  NForm,
  NFormItem,
  NInput,
  NCheckbox,
  NButton,
  useNotification,
  NDivider,
  type FormInst,
} from 'naive-ui'
import { useUserStore, type SignFormParams, type UserInfo } from '@/stores/userStore'
import { apiSignIn } from '@/http/api'
import { storeToRefs } from 'pinia'
import { useWithLoading } from '@/hooks/useWithLoading'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const userStore = useUserStore()
    const { rememberMeInfo } = storeToRefs(userStore)
    const form = reactive<SignFormParams>({
      username: '',
      password: '',
      rememberMe: true,
    })
    Object.assign(form, rememberMeInfo.value)
    const formRef = useTemplateRef<FormInst | undefined>('formRef')
    const notification = useNotification()
    const router = useRouter()
    const route = useRoute()

    function checkAllFormItem() {
      return new Promise((resolve, reject) => {
        formRef.value?.validate((errors, { warnings }) => {
          if (errors || warnings) {
            reject(errors || warnings)
          } else {
            resolve(true)
          }
        })
      })
    }

    const [onSignIn, onSignInLoading] = useWithLoading(async (done) => {
      try {
        await checkAllFormItem()
        await userStore.signIn(form)
        userStore.onSignSuccessCb(form)
        notification.success({
          content: '登录成功～',
        })
        router.push({ path: (route.query?.redirect as string) || '/' })
      } catch (error) {
        if (error instanceof Error) {
          notification.error({
            content: error.message,
          })
        }
      }
      done()
    })

    return () => (
      <SignLayout>
        <div class=" flex flex-col items-center min-w-[600px] py-10 px-10">
          <div class="flex-1 flex-center flex-col w-[400px]">
            <h1 class="text-2xl font-bold text-center mb-6">邮箱登录</h1>

            <NForm class="w-full" ref="formRef" model={form} rules={userStore.signInRules}>
              <NFormItem label="邮箱" path="username">
                <NInput
                  value={form.username}
                  onUpdate:value={(v) => (form.username = v)}
                  placeholder="请输入邮箱"
                ></NInput>
              </NFormItem>

              <NFormItem label="密码" path="password">
                <NInput
                  type="password"
                  value={form.password}
                  onUpdate:value={(v) => (form.password = v)}
                  showPasswordOn="click"
                  placeholder="请输入密码"
                ></NInput>
              </NFormItem>

              <div class="mb-4">
                <NCheckbox
                  checked={form.rememberMe}
                  label="记住我"
                  onUpdate:checked={() => (form.rememberMe = !form.rememberMe)}
                />
              </div>

              <NButton
                class={'!w-full'}
                type="primary"
                loading={onSignInLoading.value}
                onClick={onSignIn}
              >
                登录
              </NButton>
            </NForm>
          </div>

          <NDivider class="!mt-auto" />
          <div class="">
            没有账号？去
            <router-link class="text-link" to="/signup">
              注册
            </router-link>
          </div>
        </div>
      </SignLayout>
    )
  },
})
