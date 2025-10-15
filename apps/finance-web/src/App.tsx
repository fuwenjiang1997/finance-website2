import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

// 3. 使用 defineComponent 来定义组件
export default defineComponent({
  name: 'App',

  // 4. setup 函数负责逻辑处理
  setup() {
    return () => <RouterView></RouterView>
  },
})
