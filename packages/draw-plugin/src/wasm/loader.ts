import './wasm_exec.js' // 侧效导入，提供全局 window.Go

export let exportsCache: WebAssembly.WebAssemblyInstantiatedSource | null = null

async function instantiate(url: string) {
  const go = new (window as any).Go()
  const resp = await fetch(url)
  try {
    exportsCache = await WebAssembly.instantiateStreaming(resp, go.importObject)
  } catch {
    const bytes = await resp.arrayBuffer()
    exportsCache = await WebAssembly.instantiate(bytes, go.importObject)
  }
  go.run(exportsCache.instance) // 启动 Go 运行时
}

export async function initTradeWasm(): Promise<WebAssembly.WebAssemblyInstantiatedSource | null> {
  if (exportsCache) return exportsCache
  const wasmUrl = new URL('./trade.wasm', import.meta.url).toString()
  await instantiate(wasmUrl)
  console.log('exportsCache:', window?.CCI, window.MACD)
  return exportsCache
}
