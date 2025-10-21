import { Plugin, PluginName } from './type'
export * from './type'
import { lineSegment } from './plugins/lineSegment'

const plugins: { [k in PluginName]: Plugin } = {
  [PluginName.lineSegment]: lineSegment,
}

export default plugins

// // 每个模块导出的都是一个包含任意属性的对象
// type PluginModule = { [key in PluginName]: any }

// // 使用 import.meta.glob 动态导入
// //    - './plugins/*.ts' 是匹配模式
// //    - { eager: true } 会立即加载所有模块，而不是返回一个动态导入函数
// //      这使得我们可以立即访问模块的导出内容
// const modules: Record<string, PluginModule> = import.meta.glob('./plugins/*.ts', { eager: true })

// export const allPlugins: PluginModule = {} as PluginModule

// for (const path in modules) {
//   const moduleContent = modules[path]

//   Object.assign(allPlugins, moduleContent)
// }
