import { Plugin, PluginCategory, PluginName, PluginPoint, PluginStore, PluginWidth } from '../type'
import { LineSeries, LineStyle, UTCTimestamp } from 'lightweight-charts'
import { DEFAULT_COLOR, DEFAULT_LINE_WIDTH } from '../utils/const'
import { reactive, ref } from 'vue'

export const lineSegment: Plugin = (chart, params) => {
  const category = PluginCategory.Line
  const name = PluginName.lineSegment
  const isFinished = ref(false)
  const store = reactive<PluginStore>({
    points: [],
    series: [],
    width: DEFAULT_LINE_WIDTH,
    lineStyle: LineStyle.Solid,
  })

  function setPoint(_points: PluginPoint[]) {
    if (!Array.isArray(_points)) return
    try {
      store.points = _points.sort((item) => item.x - item.y)

      // store.points[0] = _points[0]
      // store.points[1] = _points[1]
      console.log('设置了points:', store.points)
      render()
    } catch (error) {}
  }
  // const throttleSetPoint = throttle(setPoint, 1)
  function setWidth(w: PluginWidth) {
    store.width = w
    render()
  }
  function setLineStyle(v: LineStyle) {
    store.lineStyle = v
    render()
  }

  const SPACE = 20

  // 判断点是否命中了这个图表
  function isFoucus(point: PluginPoint): boolean {
    if (store.points.length < 2) return false

    const p1 = params.getScreenPositionFromPoint(store.points[0])
    const p2 = params.getScreenPositionFromPoint(store.points[1])

    const screenMouse = point
    const screenP1 = p1
    const screenP2 = p2

    if (!screenMouse || !screenP1 || !screenP2) return false

    const threshold = 10 // 10像素的容差范围

    // 检查是否靠近端点
    const distToP1 = Math.sqrt(
      Math.pow(screenMouse.x - screenP1.x, 2) + Math.pow(screenMouse.y - screenP1.y, 2),
    )
    if (distToP1 < threshold) return true

    const distToP2 = Math.sqrt(
      Math.pow(screenMouse.x - screenP2.x, 2) + Math.pow(screenMouse.y - screenP2.y, 2),
    )
    if (distToP2 < threshold) return true

    // 检查是否靠近线段主体 (点到线段的距离)
    const dx = screenP2.x - screenP1.x
    const dy = screenP2.y - screenP1.y
    const lenSq = dx * dx + dy * dy

    if (lenSq === 0) return distToP1 < threshold

    let t = ((screenMouse.x - screenP1.x) * dx + (screenMouse.y - screenP1.y) * dy) / lenSq
    t = Math.max(0, Math.min(1, t)) // 确保投影点在线段内

    const projectionX = screenP1.x + t * dx
    const projectionY = screenP1.y + t * dy

    const distToLine = Math.sqrt(
      Math.pow(screenMouse.x - projectionX, 2) + Math.pow(screenMouse.y - projectionY, 2),
    )
    return distToLine < threshold
  }

  function isFoucesFirstPoint(p: PluginPoint) {
    const _p = store.points[0]
    if (!_p) return false

    return p.x >= _p.x - SPACE && p.x <= _p.x + SPACE && p.y >= _p.y - SPACE && p.y <= _p.y + SPACE
  }
  function isFoucesEndPoint(p: PluginPoint) {
    const _p = store.points[1]
    if (!_p) return false

    // console.log(
    //   'xxxx',
    //   p.x >= _p.x - SPACE,
    //   p.x <= _p.x + SPACE,
    //   p.y >= _p.y - SPACE,
    //   p.y <= _p.y + SPACE,
    // )
    return p.x >= _p.x - SPACE && p.x <= _p.x + SPACE && p.y >= _p.y - SPACE && p.y <= _p.y + SPACE
  }

  function render() {
    if (store.series.length === 0) {
      const _series = chart.addSeries(LineSeries, {
        color: DEFAULT_COLOR,
        lineWidth: store.width || DEFAULT_LINE_WIDTH,
        lineStyle: store.lineStyle,
      })
      store.series.push(_series)
    }

    const series = store.series[0]
    if (store.points.length > 2) {
      store.points.length = 2
    }
    if (!series || store.points.length < 2) return

    console.log('渲染:', store.points.length, store.points)
    series.setData(
      store.points.map((item) => {
        return {
          time: item.x as UTCTimestamp,
          value: item.y,
        }
      }),
    )
  }

  function finished() {
    isFinished.value = true
    params?.finished?.()
  }

  let isMouseDown = false
  let isMouseMoveFirstPoint = false
  let isMouseMoveEndPoint = false
  function click(_: MouseEvent, point: PluginPoint) {
    if (isFinished.value) {
      return
    }
    console.log('点击:', store.points.length)
    if (store.points.length === 0) {
      console.log('1点击')
      setPoint([point])
    } else {
      console.log('多个点:')
      setPoint([store.points[0], point])
      finished()
    }
  }
  function mousemove(event: MouseEvent, point: PluginPoint) {
    event.stopPropagation()
    if (isMouseDown) {
      console.log('1:', point)
      if (isMouseMoveFirstPoint) {
        setPoint([point, store.points[0]])
      }
      if (isMouseMoveEndPoint) {
        setPoint([store.points[0], point])
      }
    } else if (!isFinished.value && store.points[0]) {
      console.log('2:')
      setPoint([store.points[0], point])
    }
  }

  function mousedown(_: MouseEvent, point: PluginPoint) {
    console.log(point)
    isMouseDown = true

    if (isFoucesEndPoint(point)) {
      isMouseMoveEndPoint = true
    } else if (isFoucesFirstPoint(point)) {
      isMouseMoveFirstPoint = true
    }
  }
  function mouseup(_: MouseEvent, _2: PluginPoint) {
    console.log('mouseup:')
    isMouseDown = false
  }

  // 销毁
  function destory() {}

  return {
    category,
    name,
    store,
    click,
    mousemove,
    mousedown,
    mouseup,
    setPoint,
    setWidth,
    isFoucus,
    destory,
    setLineStyle,
  }
}
