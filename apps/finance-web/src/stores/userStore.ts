import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import type { FormRules } from 'naive-ui'
import { apiGetUserInfo, apiSignIn } from '@/http/api'

export interface SignFormParams {
  username?: string
  password?: string
  rememberMe: boolean
}
export interface SignUpFormParams extends SignFormParams {
  otp: string
}

export enum UserRole {
  Uesr = 'user',
}

export enum VipLevel {
  None = 'none',
}

export interface UserInfo {
  id: string
  username: string
  email: string
  role: UserRole
  vipLevel: VipLevel
}

export const useUserStore = defineStore('user', () => {
  const token = useLocalStorage('token', '')
  const userInfo = ref<UserInfo | undefined>(undefined)
  const rememberMeInfo = useLocalStorage<SignFormParams>('rememberMeInfo', { rememberMe: false })

  const signRule: FormRules = {
    username: [
      { key: 'username', required: true, message: '请输入邮箱', trigger: 'blur' },
      { key: 'username', type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
    ],
    otp: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  }

  const signInRules: Pick<FormRules, 'username' | 'password'> = {
    username: signRule.username!,
    password: signRule.password!,
  }

  function setToken(v: string) {
    token.value = v
  }

  async function getUserInfo() {
    console.log('获取用户信息:')
    const res = (await apiGetUserInfo()) || {}
    const { user } = res
    if (user && typeof user === 'object') {
      setUserInfo(user)
    }
  }

  function setUserInfo(_userInfo: UserInfo) {
    userInfo.value = _userInfo
  }

  function onSignSuccessCb(_form: SignFormParams) {
    const isRemember = _form.rememberMe
    rememberMeInfo.value = <SignFormParams>{
      username: isRemember ? _form.username : '',
      password: isRemember ? _form.password : '',
      rememberMe: isRemember,
    }
  }

  async function signIn(_form: SignFormParams) {
    const res = await apiSignIn({
      email: _form.username,
      username: _form.username,
      password: _form.password,
    })
    const { token, user } = res
    setToken(token)
    setUserInfo(user as UserInfo)
    onSignSuccessCb(_form)
  }

  async function autoSignin() {
    const { rememberMe, username, password } = rememberMeInfo.value
    if (rememberMe && username && password) {
      return signIn({ username, password, rememberMe })
    }
  }

  onMounted(() => {
    getUserInfo()
  })

  return {
    token,
    userInfo,
    signRule,
    signInRules,
    rememberMeInfo,
    setToken,
    setUserInfo,
    signIn,
    onSignSuccessCb,
    autoSignin,
  }
})
