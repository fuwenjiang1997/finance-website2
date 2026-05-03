import { ref } from 'vue'
import type { Ref } from 'vue'

interface WithLoadingParams {
  immediate?: boolean
}

// type AnyFunction = (...args: any[]) => any
// type WidthDoneAnyFunction = (done: (v?: unknown) => void, ...args: any[]) => any

// type HandlerFunc = <T extends any[]>(done: (value?: unknown) => void, ...args: T) => void

// [(...args: any[]) => Promise<unknown>, Ref<boolean>]
export const useWithLoading = <T extends any[]>(
  fn: (done: (value?: unknown) => any, ...args: T | undefined[]) => void,
  params?: WithLoadingParams,
): [(...args: T | undefined[]) => Promise<unknown>, Ref<boolean>] => {
  const loading = ref(false)
  const immediate = params?.immediate || false

  const handler = async (...args: T | undefined[]) => {
    if (loading.value) return
    loading.value = true
    const res = await new Promise((resolve) => fn(resolve, ...args))
    loading.value = false
    return res
  }
  if (immediate) {
    handler()
  }

  return [handler, loading]
}
