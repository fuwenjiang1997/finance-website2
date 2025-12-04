export interface KLine {
  high: number
  low: number
  time: number
  index: number
}

export interface ProcessedKLine extends KLine {
  direction?: 'up' | 'down' // 合并方向
}

export interface Fenxing {
  type: 'top' | 'bottom'
  k: ProcessedKLine // 包含形成分型的那根处理后K线的完整信息
  price: number
  time: number
}

export interface Bi {
  startFenxing: Fenxing
  endFenxing: Fenxing
  direction: 'up' | 'down'
  high: number
  low: number
}

export interface Duan {
  startBi: Bi
  endBi: Bi
  direction: 'up' | 'down'
  high: number
  low: number
  biList: Bi[] // 包含构成该线段的所有笔
}

export interface Zhongshu {
  start: { index: number; time: number }
  end: { index: number; time: number }
  zHigh: number
  zLow: number
  high: number
  low: number
}

// 最终计算结果
export interface ChanlunResult {
  biList: Bi[]
  duanList: Duan[]
  zhongshuList: Zhongshu[]
}

// 处理数据
export function processKlines(klines: KLine[]) {
  if (klines.length === 0) return []
  const processed: ProcessedKLine[] = []

  for (let i = 0; i < klines.length; i++) {
    let currentK: ProcessedKLine = { ...klines[i] }

    if (processed.length === 0) {
      processed.push(currentK)
      continue
    }
    let lastK = processed[processed.length - 1]

    while (true) {
      // 检查是否存在包含关系
      const isContained = currentK.high <= lastK.high && currentK.low >= lastK.low
      const contains = currentK.high >= lastK.high && currentK.low <= lastK.low

      if (isContained || contains) {
        const prevKIndex = lastK.index > 0 ? lastK.index - 1 : 0
        const direction = lastK.low >= klines[prevKIndex].low ? 'up' : 'down'

        // 合并逻辑
        const mergedHigh =
          direction === 'up'
            ? Math.max(lastK.high, currentK.high)
            : Math.min(lastK.high, currentK.high)
        const mergedLow =
          direction === 'up' ? Math.max(lastK.low, currentK.low) : Math.min(lastK.low, currentK.low)

        // 更新最后
        lastK.high = mergedHigh
        lastK.low = mergedLow
        lastK.low = currentK.low // close, time 跟随最新的线
        lastK.time = currentK.time
        lastK.index = currentK.index // 索引也更新
        lastK.direction = direction // 记录合并方向

        // 合并后，新生成的线需要和再往前一根比较，看是否还存在包含
        if (processed.length < 2) {
          // 如果前面没有线了，就跳出内部循环
          break
        } else {
          // 将合并后的 lastK 视为新的 currentK，并与更前一根比较
          currentK = { ...lastK }
          processed.pop() // 弹出最后一根
          lastK = processed[processed.length - 1] // 更新 lastK
        }
      } else {
        // 没有包含关系，将当前线推入并结束循环
        processed.push(currentK)
        break
      }
    }
  }

  return processed
}

export function findRawFenxings(processedKlines: ProcessedKLine[]): Fenxing[] {
  const rawFenxings: Fenxing[] = []
  if (processedKlines.length < 3) return []

  for (let i = 1; i < processedKlines.length - 1; i++) {
    const prev = processedKlines[i - 1]
    const curr = processedKlines[i]
    const next = processedKlines[i + 1]

    // 顶分型：中间线高点是三者中最高的
    if (curr.high > prev.high && curr.high > next.high) {
      rawFenxings.push({ type: 'top', k: curr, price: curr.high, time: curr.time })
    }

    // 底分型：中间线低点是三者中最低的
    if (curr.low < prev.low && curr.low < next.low) {
      rawFenxings.push({ type: 'bottom', k: curr, price: curr.low, time: curr.time })
    }
  }
  return rawFenxings
}

export function filterFenxings(rawFenxings: Fenxing[]): Fenxing[] {
  if (rawFenxings.length < 1) return []

  const filtered: Fenxing[] = []
  let lastFenxing: Fenxing | null = null

  for (const currentFenxing of rawFenxings) {
    if (!lastFenxing) {
      lastFenxing = currentFenxing
      continue
    }

    // 如果当前分型与上一个分型类型相同
    if (currentFenxing.type === lastFenxing.type) {
      if (lastFenxing.type === 'top') {
        // 保留更高的高点
        if (currentFenxing.price > lastFenxing.price) {
          lastFenxing = currentFenxing
        }
      } else {
        // bottom
        // 保留更低的低点
        if (currentFenxing.price < lastFenxing.price) {
          lastFenxing = currentFenxing
        }
      }
    } else {
      // 类型不同，上一个分型可以被确认
      // 检查K线是否有重叠（分型之间至少隔一根K线）
      if (Math.abs(currentFenxing.k.index - lastFenxing.k.index) > 1) {
        filtered.push(lastFenxing)
        lastFenxing = currentFenxing
      } else {
        // K线重叠，进行比较取舍（这是更严格的处理）
        if (lastFenxing.type === 'top' && currentFenxing.price < lastFenxing.price) {
          // 底分型更强，保留底
          lastFenxing = currentFenxing
        } else if (lastFenxing.type === 'bottom' && currentFenxing.price > lastFenxing.price) {
          // 顶分型更强，保留顶
          lastFenxing = currentFenxing
        }
      }
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

export function findBi(fenxings: Fenxing[], processedKlines: ProcessedKLine[]): Bi[] {
  const biList: Bi[] = []
  if (fenxings.length < 2) return []

  let lastBi: Bi | null = null
  let tempFenxing: Fenxing | null = fenxings[0] // 临时的、尚未确定为笔端点的分型

  for (let i = 1; i < fenxings.length; i++) {
    const currentFenxing = fenxings[i]

    if (!tempFenxing) {
      tempFenxing = currentFenxing
      continue
    }

    // 寻找一顶一底的配对
    if (currentFenxing.type === tempFenxing.type) {
      // 同类分型，根据规则进行取舍
      if (tempFenxing.type === 'top') {
        // 新的顶更高，则之前的顶无效，用新的顶作为潜在笔的起点
        if (currentFenxing.price > tempFenxing.price) tempFenxing = currentFenxing
      } else {
        // 新的底更低，则之前的底无效，用新的底作为潜在笔的起点
        if (currentFenxing.price < tempFenxing.price) tempFenxing = currentFenxing
      }
      continue // 继续寻找下一个异类分型
    }

    // 异类分型，检查是否能构成一笔
    const fx1 = tempFenxing
    const fx2 = currentFenxing

    // 确定K线索引，用于后续切片
    // 这是在 processedKlines 数组中的索引
    const idx1 = processedKlines.findIndex((k) => k.time === fx1.k.time)
    const idx2 = processedKlines.findIndex((k) => k.time === fx2.k.time)

    // 规则 2: K线间隔检查
    // 确保两个分型之间至少隔了1根K线。
    if (Math.abs(idx1 - idx2) <= 1) {
      continue // 间隔不够，不能成笔
    }

    // 规则 3: 无包含关系检查 (这是简化的验证)
    // 严格的笔破坏发生在笔划定后，这里我们先确保中间没有更极端的值
    const startIndex = Math.min(idx1, idx2)
    const endIndex = Math.max(idx1, idx2)
    const klinesBetween = processedKlines.slice(startIndex, endIndex + 1)

    let isValid = true
    const highBetween = Math.max(...klinesBetween.map((k) => k.high))
    const lowBetween = Math.min(...klinesBetween.map((k) => k.low))

    if (fx1.type === 'bottom' && fx2.type === 'top') {
      // 潜在的向上一笔
      if (highBetween > fx2.price || lowBetween < fx1.price) {
        isValid = false
      }
    } else {
      // 潜在的向下一笔 (fx1: top, fx2: bottom)
      if (highBetween > fx1.price || lowBetween < fx2.price) {
        isValid = false
      }
    }

    if (!isValid) {
      // 如果不合法，看哪个分型更强，把它作为下一次笔判断的起点
      // 例如顶A和底B不成笔，又来了新顶C。若C比A高，则起点变成C，继续找底。
      // 这里的逻辑可以很复杂，简化处理：不成笔就跳过，用当前分型作为新的起点
      tempFenxing = currentFenxing
      continue
    }

    // --- 成功构成一笔 ---
    const direction = fx1.type === 'bottom' ? 'up' : 'down'
    const newBi: Bi = {
      startFenxing: fx1,
      endFenxing: fx2,
      direction,
      high: highBetween,
      low: lowBetween,
    }

    biList.push(newBi)
    lastBi = newBi // 记录最后一笔
    tempFenxing = fx2 // 当前分型成为下一笔的起点
  }

  return biList
}
