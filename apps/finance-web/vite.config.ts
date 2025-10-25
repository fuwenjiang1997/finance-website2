import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    // vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@fuwenjiang1997/draw-plugin': fileURLToPath(
        new URL('../../packages/draw-plugin/src/index.ts', import.meta.url),
      ),
      '@fuwenjiang1997/trading-view-chart': fileURLToPath(
        new URL('../../packages/trading-view-chart/src/index.ts', import.meta.url),
      ),
      '@fuwenjiang1997/common-types': fileURLToPath(
        new URL('../../packages/common-types/src/index.ts', import.meta.url),
      ),
    },
  },
  server: {
    watch: {
      ignored: [
        '!**/node_modules/@fuwenjiang1997/trading-view-chart/**',
        '!**/node_modules/@fuwenjiang1997/draw-plugin/**',
        '!**/node_modules/@fuwenjiang1997/common-types/**',
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:12346',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
