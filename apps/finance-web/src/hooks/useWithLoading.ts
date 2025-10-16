import { ref } from 'vue'
import type { Ref } from 'vue'

interface WithLoadingParams {
  immediate?: boolean
}

type HandlerFunc = (done: (value?: unknown) => void, ...args: any[]) => void

export const useWithLoading = <T extends any[]>(
  fn: HandlerFunc,
  params?: WithLoadingParams,
): [(...args: T) => Promise<unknown>, Ref<boolean>] => {
  const loading = ref(false)
  const immediate = params?.immediate || false

  const handler = async (...args: T | []) => {
    if (loading.value) return
    loading.value = true
    const res = await new Promise((resolve) => {
      fn(resolve, ...(args as T))
    })
    loading.value = false
    return res
  }
  if (immediate) {
    handler()
  }

  return [handler, loading]
}
