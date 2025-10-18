import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    dts({
      // 使用 dts 插件
      insertTypesEntry: true, // 为包的入口文件生成一个 .d.ts 入口
    }),
  ],
  build: {
    // 核心：库模式配置
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // 你的库的入口文件
      name: 'vchart', // UMD 构建模式下的全局变量名
      fileName: (format) => `common-types.${format}.js`, // 输出文件的名字
      formats: ['es', 'umd'], // 你想要生成的模块格式
    },
    // sourcemap: true, // 如果需要，可以开启 sourcemap
  },
})
