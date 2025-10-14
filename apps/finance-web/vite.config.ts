import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@fuwenjiang1997/trading-view-replay': fileURLToPath(new URL('../../packages/trading-view-replay/src/index.ts', import.meta.url)),
    },
  },
   server: {
    watch: {
      ignored: ['!**/node_modules/@fuwenjiang1997/trading-view-replay/**'],
    },
  },
})
