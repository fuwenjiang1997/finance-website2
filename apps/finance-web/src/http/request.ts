import axios, { type AxiosRequestConfig } from 'axios'
import router from '@/router'

export interface RequestError {
  message: string
}

export interface CustomAxiosInstance {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>

  // Override the 'delete' method signature
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>

  // Override the 'head' method signature
  head<T>(url: string, config?: AxiosRequestConfig): Promise<T>

  // Override the 'options' method signature
  options<T>(url: string, config?: AxiosRequestConfig): Promise<T>

  // Override the methods that take data
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>

  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>

  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
}

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || '/api', // 设置基础路径
  timeout: 5000, // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 比如加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 自己生成 base64 编码
    // const username = '8vrfd89fmy'
    // const password = 'wbyqfwpm95'
    // const token = btoa(`${username}:${password}`) // window.btoa 进行base64编码

    // config.headers['Authorization'] = `Basic ${token}` // 设置 Authorization 头部
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 根据实际后端返回结构调整
    if (response.status === 200) {
      return response.data.data
    } else {
      // 可以全局弹窗提示
      return Promise.reject(<RequestError>{
        message: response.data,
      })
    }
  },
  (error) => {
    if (error && error.config) {
      const requestUrl = error.config.url
      if (requestUrl === '/user/profile') {
        return Promise.resolve(null)
      }
    }

    if (error.response?.status === 401) {
      router.push('/signin')
      return Promise.reject(<RequestError>{
        message: error.response.data?.error || error?.message || error,
      })
    }

    return Promise.reject(<RequestError>{
      message: error.response.data?.error || error?.message || error,
    })
  },
)

export default service as CustomAxiosInstance
