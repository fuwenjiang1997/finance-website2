import { defineComponent, handleError, onBeforeMount, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, NNotificationProvider } from 'naive-ui'
import theme from './theme'

// 3. 使用 defineComponent 来定义组件
export default defineComponent({
  name: 'App',

  // 4. setup 函数负责逻辑处理
  setup() {
    function globalErrorHandler(event: ErrorEvent) {
      console.error(event.error)
    }
    function globalPromiseErrorHandler(event: PromiseRejectionEvent) {
      console.error(event.reason)
    }

    onMounted(() => {
      window.addEventListener('error', globalErrorHandler)
      // 3. 全局未处理的 Promise 异步错误
      window.addEventListener('unhandledrejection', globalPromiseErrorHandler)
    })

    onBeforeMount(() => {
      window.removeEventListener('error', globalErrorHandler)
      window.removeEventListener('unhandledrejection', globalPromiseErrorHandler)
    })

    return () => (
      <NConfigProvider themeOverrides={theme}>
        <NNotificationProvider>
          <NMessageProvider>
            <RouterView></RouterView>
          </NMessageProvider>
        </NNotificationProvider>
      </NConfigProvider>
    )
  },
})
