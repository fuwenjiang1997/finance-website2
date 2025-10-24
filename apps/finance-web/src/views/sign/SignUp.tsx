import { defineComponent, onBeforeUnmount, reactive, ref, useTemplateRef } from 'vue'
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
  useMessage,
} from 'naive-ui'
import { useUserStore, type SignUpFormParams, type UserInfo } from '@/stores/userStore'
import { apiSendOpt, apiSignIn, apiSignUp } from '@/http/api'
import { storeToRefs } from 'pinia'
import { useWithLoading } from '@/hooks/useWithLoading'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const userStore = useUserStore()
    const { rememberMeInfo } = storeToRefs(userStore)
    const form = reactive<SignUpFormParams>({
      username: '',
      password: '',
      otp: '',
      rememberMe: true,
    })
    const SENDOPTINTERVAL = 120
    const sendOtpDownTime = ref<number | undefined>(undefined)
    Object.assign(form, rememberMeInfo.value)
    const formRef = useTemplateRef<FormInst | undefined>('formRef')
    const message = useMessage()
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

    const [onSignUp, onSignUpLoading] = useWithLoading(async (done) => {
      try {
        await checkAllFormItem()
        const { username, password, otp } = form
        await apiSignUp({
          username,
          email: username,
          password,
          verifyCode: otp,
        })
        message.success('注册成功')
        userStore.onSignSuccessCb(form)
        await userStore.autoSignin()
        done()
        router.push({ path: (route.query?.redirect as string) || '/' })
      } catch (error) {
        if (error instanceof Error) {
          message.error(error.message || '注册失败')
        }
      }
      done()
    })

    let otpTimer: number | undefined

    function senOtpSuccess() {
      sendOtpDownTime.value = SENDOPTINTERVAL
      if (otpTimer) {
        clearInterval(otpTimer)
        otpTimer = undefined
      }
      otpTimer = setInterval(() => {
        if (sendOtpDownTime.value !== undefined && sendOtpDownTime.value > 0) {
          sendOtpDownTime.value -= 1
        } else {
          sendOtpDownTime.value = undefined
        }
      }, 1000)
    }

    const [onSendOtp, onSendOtpLoading] = useWithLoading(async (done) => {
      formRef.value?.validate(
        async (errors, { warnings }) => {
          if (errors || warnings) {
            return
          }
          try {
            await apiSendOpt({
              email: form.username,
            })
            senOtpSuccess()
            done(true)
          } catch (error) {
            done(false)
            if (error instanceof Error && error.message) {
              message.error(error.message)
            }
          }
        },
        (rule) => {
          return rule?.key === 'username'
        },
      )
    })

    onBeforeUnmount(() => {
      if (otpTimer) {
        clearInterval(otpTimer)
        otpTimer = undefined
      }
    })

    return () => (
      <SignLayout>
        <div class=" flex flex-col items-center min-w-[600px] py-10 px-10">
          <div class="flex-1 flex-center flex-col w-[400px]">
            <h1 class="text-2xl font-bold text-center mb-6">邮箱注册</h1>

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

              <NFormItem label="验证码" path="otp">
                <NInput
                  value={form.otp}
                  onUpdate:value={(v) => (form.otp = v)}
                  placeholder="请输入验证码"
                  class={'mr-4'}
                ></NInput>
                {sendOtpDownTime.value ? (
                  <NButton class={'!w-14'} disabled>
                    {sendOtpDownTime.value}s
                  </NButton>
                ) : (
                  <NButton loading={onSendOtpLoading.value} onClick={onSendOtp}>
                    发送验证码
                  </NButton>
                )}
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
                loading={onSignUpLoading.value}
                onClick={onSignUp}
              >
                注册
              </NButton>
            </NForm>
          </div>

          <NDivider class="!mt-auto" />
          <div class="">
            已有账号？去
            <router-link class="text-link" to="/signin">
              登录
            </router-link>
          </div>
        </div>
      </SignLayout>
    )
  },
})
