import { defineComponent, onBeforeMount, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, NNotificationProvider } from 'naive-ui'
import theme from './theme'

export default defineComponent({
  name: 'App',
  setup() {
    function globalErrorHandler(event: ErrorEvent) {
      console.error(event.error)
    }
    function globalPromiseErrorHandler(event: PromiseRejectionEvent) {
      console.error(event.reason)
    }

    onMounted(() => {
      window.addEventListener('error', globalErrorHandler)
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
