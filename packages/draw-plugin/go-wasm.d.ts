export {}

declare global {
  interface Window {
    CCI?: (v1: number[], v2: mber[], v3: numbermber[], period: number) => number[]
    MACD?: (v1: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number) => number[]
    SMA: (closePrices: number[], period: number) => number[]
    Go: new () => any
  }
}
