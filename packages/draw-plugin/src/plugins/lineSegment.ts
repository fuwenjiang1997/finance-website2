import { Plugin, PluginCategory, PluginName, PluginPoint, PluginStore, PluginWidth } from '../type'
import { LineSeries, LineStyle, UTCTimestamp } from 'lightweight-charts'
import { DEFAULT_COLOR, DEFAULT_LINE_WIDTH } from '../utils/const'
import { reactive } from 'vue'

export const lineSegment: Plugin = (chart) => {
  const category = PluginCategory.Line
  const name = PluginName.lineSegment
  const store = reactive<PluginStore>({
    points: [],
    series: [],
    width: DEFAULT_LINE_WIDTH,
    lineStyle: LineStyle.Solid,
  })

  function setPoint(fn: (oldPoints: PluginPoint[]) => PluginPoint[]) {
    const newPoints = fn(store.points)
    if (Array.isArray(newPoints)) store.points = newPoints
    render()
  }
  function setWidth(w: PluginWidth) {
    store.width = w
    render()
  }
  function setLineStyle(v: LineStyle) {
    store.lineStyle = v
    render()
  }
  // 判断点是否命中了这个图表
  function isFoucus(p: PluginPoint): boolean {
    if (store.points.length < 2) return false
    const [a, b] = store.points
    const width = store.width
    // 计算线段AB的向量及其长度的平方
    const dx = b.x - a.x
    const dy = b.y - a.y
    const segmentLengthSq = dx * dx + dy * dy

    // --- 特殊情况处理：线段的两个端点是同一个点 ---
    // 此时，区域为一个以a为圆心，width/2为半径的圆
    if (segmentLengthSq === 0) {
      const distSq = (p.x - a.x) * (p.x - a.x) + (p.y - a.y) * (p.y - a.y)
      return distSq <= (width / 2) * (width / 2)
    }

    // --- 1. 投影条件检查 ---
    // 计算向量AP的点积 (dot product)
    // dot = (p.x - a.x) * dx + (p.y - a.y) * dy
    // 如果点p的投影不在线段AB上，则直接返回false
    // 0 <= dot <= segmentLengthSq
    const dot = (p.x - a.x) * dx + (p.y - a.y) * dy
    if (dot < 0 || dot > segmentLengthSq) {
      return false
    }

    // --- 2. 垂直距离条件检查 ---
    // 计算向量AP和AB的叉积 (cross product) 的绝对值
    // crossProduct = |(p.y - a.y) * dx - (p.x - a.x) * dy|
    // crossProduct的平方等于点p到直线AB的垂直距离的平方乘以线段长度的平方
    const crossProduct = (p.y - a.y) * dx - (p.x - a.x) * dy
    const distanceSq = (crossProduct * crossProduct) / segmentLengthSq

    // 检查垂直距离的平方是否小于等于 (width/2) 的平方
    const halfWidthSq = (width / 2) * (width / 2)

    return distanceSq <= halfWidthSq
  }

  function render() {
    let series
    if (store.series.length === 0) {
      series = chart.addSeries(LineSeries, {
        color: DEFAULT_COLOR,
        lineWidth: store.width || DEFAULT_LINE_WIDTH,
        lineStyle: store.lineStyle,
      })
      store.series.push(series)
    } else {
      series = store.series[0]
    }
    if (!series) return

    series.setData(
      store.points.map((item) => {
        return {
          time: item.x as UTCTimestamp,
          value: item.y,
        }
      }),
    )
  }

  // 销毁
  function destory() {}

  return {
    category,
    name,
    store,
    setPoint,
    setWidth,
    isFoucus,
    destory,
    setLineStyle,
  }
}
