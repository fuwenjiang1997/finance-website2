import { expect, test } from 'vitest'
import { processKlines, findRawFenxings, filterFenxings, KLine, findBi } from '../src/core/chanLun'
import { data } from './data'

const klines: KLine[] = data.highs.slice(data.highs.length - 20).map((high, i) => ({
  high,
  low: data.lows[i],
  time: data.times[i],
  index: i,
}))

test('合并数据', () => {
  const res = processKlines(klines)
  const res2 = findRawFenxings(res)
  const res3 = filterFenxings(res2)
  const bi = findBi(res3, res)
  console.log('分型：', res3)
  console.log('笔', bi)
})
