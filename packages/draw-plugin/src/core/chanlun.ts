import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'
export enum FenXingType {
  TOP = 'top',
  BOTTOM = 'bottom',
}
export enum BiType {
  UP = 'up',
  DOWN = 'down',
}

export interface KLine {
  high: number
  low: number
  time: number
  index: number
  startIndex?: number
  endIndex?: number
}
export interface FenXing {
  type: FenXingType
  price: number
  time: number
  startKLine: KLine
  kLine: KLine
  endKline: KLine
}

export interface Bi {
  startFenxing: FenXing
  endFenxing: FenXing
  direction: BiType
  high: number
  low: number
}

export interface ChanlunResult {
  biList: Bi[]
  fenXingList: FenXing[]
  filterFenXings: FenXing[]
  // duanList: Duan[]
  // zhongshuList: Zhongshu[]
}

// 处理数据，合并
function processKlines(kLines: KLine[], isPre = false) {
  const len = kLines.length
  const newKlineList: KLine[] = []
  let tmpKLine: KLine | undefined = undefined

  if (isPre) {
    for (let i = 0; i < len; i++) {
      const _current = kLines[i]
      _current.startIndex = _current.startIndex ?? _current.index
      _current.endIndex = _current.endIndex ?? _current.index

      if (!tmpKLine) {
        tmpKLine = {
          ..._current,
        }
        continue
      }
      // 前一根包含后一根,endIndex增加
      if (tmpKLine.high >= _current.high && tmpKLine.low <= _current.low) {
        tmpKLine.endIndex = _current.endIndex
      } else if (tmpKLine.high <= _current.high && tmpKLine.low >= _current.low) {
        // 后一根包含前一根，index 和 endIndex 增加
        tmpKLine = {
          ..._current,
          startIndex: tmpKLine.startIndex,
        }
      } else {
        // 前一根和后一根不存在包含关系，入栈
        newKlineList.push(tmpKLine)
        tmpKLine = {
          ..._current,
        }
      }
    }

    if (tmpKLine) {
      newKlineList.push(tmpKLine)
    }
  } else {
    // 从后面开始合并
    for (let i = len - 1; i >= 0; i--) {
      const _current = kLines[i]
      _current.startIndex = _current.startIndex ?? _current.index
      _current.endIndex = _current.endIndex ?? _current.index
      if (!tmpKLine) {
        tmpKLine = {
          ..._current,
        }
        continue
      }

      // 如果后一根包含前一根
      if (_current.high >= tmpKLine.high && _current.low <= tmpKLine.low) {
        // startIndex向前移动
        tmpKLine = {
          ..._current,
          startIndex: tmpKLine.startIndex,
        }
      } else if (_current.high <= tmpKLine.high && _current.low >= tmpKLine.low) {
        // 如果前一根包含后一根
        tmpKLine.endIndex = _current.endIndex
      } else {
        // 入栈
        newKlineList.unshift(tmpKLine)
        tmpKLine = {
          ..._current,
        }
      }
    }
  }

  return newKlineList
}

function checkProcessKlines(_kLines: KLine[], kLines: KLine[]) {
  let isValid = true
  let lastIndex: number | undefined = undefined
  // 判断k线合并是否有效
  kLines.forEach((item, index) => {
    if (!item.startIndex || !item.endIndex) return
    const sliceKlines = _kLines.slice(item.startIndex, item.endIndex + 1)

    const isContains = sliceKlines.every((_item) => {
      return _item.high <= item.high && _item.low >= item.low
    })

    let isContinuous = true
    if (lastIndex === undefined) {
      lastIndex = index
    } else {
      // index是否连续
      isContinuous =
        item.startIndex === kLines[lastIndex].endIndex! + 1 &&
        !(
          (kLines[lastIndex].high <= item.high && kLines[lastIndex].low >= item.low) ||
          (kLines[lastIndex].high >= item.high && kLines[lastIndex].low <= item.low)
        )
      if (!(item.startIndex === kLines[lastIndex].endIndex! + 1)) {
        console.log('不连续：', kLines[lastIndex], item)
      }
      if (
        (kLines[lastIndex].high <= item.high && kLines[lastIndex].low >= item.low) ||
        (kLines[lastIndex].high >= item.high && kLines[lastIndex].low <= item.low)
      ) {
        console.log('xxxx包含:', kLines[lastIndex], item)
      }
    }

    lastIndex = index

    if (!isContains || !isContinuous) {
      console.log(
        'k线合并校验没通过',
        isContains,
        !isContinuous,
        item.index,
        dayjs(item.time * 1000).format('YYYY/MM/DD'),
        item,
      )
      isValid = false
    }
  })

  return isValid
}

// 寻找分型
function findRawFenxings(processedKlines: KLine[]): FenXing[] {
  const rawFenxings: FenXing[] = []
  if (processedKlines.length < 3) return rawFenxings

  for (let i = 1; i < processedKlines.length - 1; i++) {
    const prev = processedKlines[i - 1]
    const curr = processedKlines[i]
    const next = processedKlines[i + 1]

    // 顶分型：中间线高点是三者中最高的
    if (curr.high > prev.high && curr.high > next.high) {
      rawFenxings.push({
        type: FenXingType.TOP,
        price: curr.high,
        time: curr.time,
        kLine: curr,
        startKLine: prev,
        endKline: next,
      })
    }

    // 底分型：中间线低点是三者中最低的
    if (curr.low < prev.low && curr.low < next.low) {
      rawFenxings.push({
        type: FenXingType.BOTTOM,
        price: curr.low,
        time: curr.time,
        kLine: curr,
        startKLine: prev,
        endKline: next,
      })
    }
  }

  return rawFenxings
}

// 筛选分型
function filterFengxings(rawFenxings: FenXing[]): FenXing[] {
  if (rawFenxings.length < 1) return []
  const filtered: FenXing[] = []
  let lastFenxing: FenXing | undefined = undefined

  // todo 筛选出来的分型必须是有效分型
  // for (let i = 0; i < rawFenxings.length; i++) {
  //   const currentFenxing = rawFenxings[i]
  // }

  for (const currentFenxing of rawFenxings) {
    if (!lastFenxing) {
      lastFenxing = currentFenxing
      continue
    }
    // 如果当前分型与上一个分型类型相同
    if (currentFenxing.type === lastFenxing.type) {
      if (lastFenxing.type === FenXingType.TOP) {
        // 顶分型
        // 保留更高的高点
        if (currentFenxing.price > lastFenxing.price) {
          lastFenxing = currentFenxing
        }
      } else {
        // 底分型
        // 保留更低的低点
        if (currentFenxing.price < lastFenxing.price) {
          lastFenxing = currentFenxing
        }
      }
    } else {
      // 类型不同，上一个分型可以被确认
      // 检查K线是否有重叠（分型之间至少隔一根K线）

      // 需要判断是否有效
      let isValidate = true
      if (currentFenxing.startKLine.startIndex! - lastFenxing.endKline.endIndex! <= 2) {
        isValidate = false
      }

      // 向上的一笔，顶分型的最低点必须高于底分型的最低点；向下的一笔，底分型的高点必须小于顶分型的低点
      if (
        (currentFenxing.type === FenXingType.TOP &&
          currentFenxing.kLine.low <= lastFenxing.kLine.high) ||
        (currentFenxing.type === FenXingType.BOTTOM &&
          currentFenxing.kLine.high >= lastFenxing.kLine.low)
      ) {
        isValidate = false
      }

      if (isValidate) {
        filtered.push(lastFenxing)
        lastFenxing = currentFenxing
      }

      // if (currentFenxing.startKLine.startIndex! - lastFenxing.endKline.endIndex! > 2) {
      //   if (
      //     (currentFenxing.type === FenXingType.TOP &&
      //       currentFenxing.kLine.low > lastFenxing.kLine.low) ||
      //     (currentFenxing.type === FenXingType.BOTTOM &&
      //       currentFenxing.kLine.low < lastFenxing.kLine.low)
      //   ) {
      //     filtered.push(lastFenxing)
      //     lastFenxing = currentFenxing
      //   }
      // } else {
      //   // todo K线重叠，进行比较取舍
      //   // K线重叠，进行比较取舍（这是更严格的处理）
      //   // if (lastFenxing.type === FenXingType.TOP && currentFenxing.price < lastFenxing.price) {
      //   //   // 底分型更强，保留底
      //   //   lastFenxing = currentFenxing
      //   // } else if (
      //   //   lastFenxing.type === FenXingType.BOTTOM &&
      //   //   currentFenxing.price > lastFenxing.price
      //   // ) {
      //   //   // 顶分型更强，保留顶
      //   //   lastFenxing = currentFenxing
      //   // }
      // }
    }
  }
  // 将最后一个暂存的分型加入
  if (
    lastFenxing &&
    (filtered.length === 0 || filtered[filtered.length - 1].time !== lastFenxing.time)
  ) {
    filtered.push(lastFenxing)
  }

  return filtered
}

// 寻找笔
function findBi(fenXings: FenXing[], processedKlines: KLine[]): Bi[] {
  const biList: Bi[] = []
  if (fenXings.length < 2) return []

  let lastBi: Bi | null = null
  let tempFenxing: FenXing = fenXings[0] // 临时的、尚未确定为笔端点的分型

  for (let i = 1; i < fenXings.length; i++) {
    const currentFenxing = fenXings[i]
    if (!tempFenxing) {
      tempFenxing = currentFenxing
      continue
    }

    // 寻找一顶一底的配对
    if (currentFenxing.type === tempFenxing.type) {
      // 同类分型，根据规则进行取舍
      if (tempFenxing.type === FenXingType.TOP) {
        // 新的顶更高，则之前的顶无效，用新的顶作为潜在笔的起点
        if (currentFenxing.price > tempFenxing.price) tempFenxing = currentFenxing
      } else {
        // 新的底更低，则之前的底无效，用新的底作为潜在笔的起点
        if (currentFenxing.price < tempFenxing.price) tempFenxing = currentFenxing
      }
      continue // 继续寻找下一个异类分型
    } else {
      // 向下的一笔，前一个是顶分型
      if (tempFenxing.type === FenXingType.TOP) {
        // 如果顶分型的low <= 底分型的high , 破坏笔,不成立
        if (tempFenxing.kLine.low <= currentFenxing.kLine.high) {
          continue // 继续寻找下一个异类分型
        }
      } else {
        // 向上的一笔，前一个是底分型
        // 如果底分型的high >= 顶分型的low, 破坏笔,不成立
        // tempFenxing.kLine.high >= currentFenxing.kLine.low
        if (tempFenxing.kLine.high >= currentFenxing.kLine.low) {
          continue // 继续寻找下一个异类分型
        }
      }
    }

    const fx1 = tempFenxing
    const fx2 = currentFenxing

    if (Math.abs(fx1.endKline.endIndex! - fx2.startKLine.startIndex!) <= 1) {
      continue // 间隔不够，不能成笔
    }

    const direction = currentFenxing.type === FenXingType.BOTTOM ? BiType.UP : BiType.DOWN

    // // 判断分型是否有效
    // const idx1 = fx1.kLine.index
    // const idx2 = fx2.kLine.index

    // // 规则 3: 无包含关系检查 (这是简化的验证)
    // // 严格的笔破坏发生在笔划定后，这里我们先确保中间没有更极端的值
    // const startIndex = Math.min(idx1, idx2)
    // const endIndex = Math.max(idx1, idx2)
    // const klinesBetween = processedKlines.slice(startIndex, endIndex + 1)

    // let isValid = true
    // const highBetween = Math.max(...klinesBetween.map((k) => k.high))
    // const lowBetween = Math.min(...klinesBetween.map((k) => k.low))

    // if (fx1.type === FenXingType.BOTTOM && fx2.type === FenXingType.TOP) {
    //   // 潜在的向上一笔
    //   if (highBetween > fx2.price || lowBetween < fx1.price) {
    //     isValid = false
    //   }
    // } else {
    //   // 潜在的向下一笔 (fx1: top, fx2: bottom)
    //   if (highBetween > fx1.price || lowBetween < fx2.price) {
    //     isValid = false
    //   }
    // }

    // if (!isValid) {
    //   // 如果不合法，看哪个分型更强，把它作为下一次笔判断的起点
    //   // 例如顶A和底B不成笔，又来了新顶C。若C比A高，则起点变成C，继续找底。
    //   // 这里的逻辑可以很复杂，简化处理：不成笔就跳过，用当前分型作为新的起点
    //   tempFenxing = currentFenxing
    //   continue
    // }

    const newBi: Bi = {
      startFenxing: fx1,
      endFenxing: fx2,
      direction,
      high: Math.max(fx1.kLine.high, fx2.kLine.high),
      low: Math.max(fx1.kLine.low, fx2.kLine.low),
    }

    biList.push(newBi)
    lastBi = newBi // 记录最后一笔
    tempFenxing = currentFenxing // 当前分型成为下一笔的起点
  }

  return biList
}

export function calculateChanLun(_kLines: KLine[]): ChanlunResult {
  // console.log('_kLines:>> ', _kLines)
  const kLines = processKlines(processKlines(_kLines), true)
  // const max = 100
  // let count = 0
  // while (!checkProcessKlines(_kLines, kLines) && count < max) {
  //   kLines = processKlines(kLines)
  //   count++
  // }
  // console.log('count:', count)
  // console.log('kLines:', kLines)

  let isValid = checkProcessKlines(_kLines, kLines)
  if (isValid) {
    console.log('k线合并校验通过:')
  }

  const fenXings = findRawFenxings(kLines)
  // console.log('fenXings:>>', fenXings)
  const filterFenXings = filterFengxings(fenXings)
  console.log('filterFenXings:>>', filterFenXings)
  const biList = findBi(filterFenXings, kLines)

  // console.log('kLines:', biList)
  // 1747008000

  return {
    biList: biList,
    fenXingList: [], //fenXings,
    filterFenXings: [], // filterFenXings,
  }
}
