import '@/assets/style/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App'
import router from './router'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.group('--- Vue 全局错误 ---')
  console.error('错误信息 (Error):', err)
  console.error('出错组件 (Component):', instance)
  console.error('错误来源 (Info):', info)
  console.groupEnd()
}

app.use(createPinia())
app.use(router)

app.mount('#app')
