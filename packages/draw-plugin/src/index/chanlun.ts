import {
  ChanlunResult,
  KLine,
  processKlines,
  findRawFenxings,
  filterFenxings,
  findBi,
} from '../core/chanlun'

function Chanlun(highs: number[], lows: number[], times: number[]): ChanlunResult {
  const klines: KLine[] = highs.map((high, i) => ({
    high,
    low: lows[i],
    time: times[i],
    index: i,
  }))

  const res = {
    biList: [],
    duanList: [],
    zhongshuList: [],
  }

  const processedKlines = processKlines(klines)
  const rawFenxings = findRawFenxings(processedKlines)
  const finalFenxings = filterFenxings(rawFenxings)
  const biList = findBi(finalFenxings, processedKlines)

  return res
}
