export {}

declare global {
  interface Window {
    CCI?: () => any
    MACD?: (v1: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number) => number[]
    Go: new () => any
  }
}
