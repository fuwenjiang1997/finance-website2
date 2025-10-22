import { IChartApi, ISeriesApi, LineSeries, LineStyle, SeriesType, Time } from 'lightweight-charts'
import { DrawPlugin } from './DrawPlugin'
import { PluginPoint } from '../type'
import { cloneDeep, throttle } from 'lodash-es'

export class LineSegment extends DrawPlugin {
  constructor(chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart)
    this.kLineSeries = kLineSeries
    const _series = chart.addSeries(LineSeries, {
      color: 'red',
      lineWidth: 1,
      lineStyle: LineStyle.Solid, // 预览时使用虚线
    })
    this.series.push(_series)
    this.render = throttle((points: PluginPoint[]) => {
      const renderPoints = cloneDeep(points)
        .sort((a, b) => a.x - b.x)
        .map((item) => ({
          time: item.x as Time,
          value: item.y,
        }))
      try {
        this.series[0].setData(renderPoints)
      } catch (error) {
        console.log('error:>>', error)
      }
    }, 16)
  }

  isPointNear(point: PluginPoint) {
    if (this.store.points.length < 2) return false

    const p1 = this.store.points[0]
    const p2 = this.store.points[1]

    const screenMouse = this.toScreen(point)
    const screenP1 = this.toScreen(p1)
    const screenP2 = this.toScreen(p2)

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
  onMouseMove(_: PluginPoint) {}
  onChartCrosshairMove(point: PluginPoint) {
    if (!this.isDrawing || this.store.points.length < 1) return

    // "橡皮筋"效果: 更新第二个点的位置
    const tempPoints = [this.store.points[0], point]

    if (tempPoints[0].x === tempPoints[1].x) return
    tempPoints.sort((a, b) => a.x - b.x)

    if (this.series[0]) {
      this.render?.(tempPoints)
    } else {
      this.series[0] = this.chart.addSeries(LineSeries, {
        color: 'red',
        lineWidth: 1,
        lineStyle: LineStyle.Solid, // 预览时使用虚线
      })
      this.render?.(tempPoints)
    }
  }
  onCrosshairMove() {}
  onMouseDown(point: PluginPoint) {
    super.onMouseDown(point) // 调用基类方法设置 isDragging

    const screenMouse = this.toScreen(point)
    if (!screenMouse) return

    const threshold = 15 // 稍大的点击区域

    // 判断点击的是哪个端点
    for (let i = 0; i < this.store.points.length; i++) {
      const screenP = this.toScreen(this.store.points[i])
      if (!screenP) continue

      const dist = Math.sqrt(
        Math.pow(screenMouse.x - screenP.x, 2) + Math.pow(screenMouse.y - screenP.y, 2),
      )
      if (dist < threshold) {
        this.draggedPointIndex = i // 记录被拖拽的端点索引
        return
      }
    }

    // 如果没有点击到端点，则认为是拖拽整个线段
    this.draggedPointIndex = 'body'
  }
  onDrag(point: PluginPoint) {
    super.onDrag(point) // 调用基类方法
    if (!this.isDragging || !this.dragStartPoint) return

    const priceDiff = point.y - this.dragStartPoint.y
    // 时间戳不能直接加减，需要转换为数值
    const timeDiff = (point.x as number) - (this.dragStartPoint.x as number)

    if (this.draggedPointIndex === 'body') {
      // 移动整个线段
      this.store.points[0].y += priceDiff
      this.store.points[1].y += priceDiff
      this.store.points[0].x = (this.store.points[0].x as number) + timeDiff
      this.store.points[1].x = (this.store.points[1].x as number) + timeDiff
    } else if (typeof this.draggedPointIndex === 'number') {
      // 移动单个端点
      this.store.points[this.draggedPointIndex] = { ...point }
    }
    // 更新拖拽起始点为当前点，以实现连续拖拽
    this.dragStartPoint = { ...point }
    this.render?.(this.store.points)
  }
  onMouseUp(point: PluginPoint) {
    super.onMouseUp(point)
  }
  onClick(_: PluginPoint) {}
  onCrosshairClick(point: PluginPoint) {
    if (!this.isDrawing) {
      // 开始绘制
      this.isDrawing = true

      const _points = cloneDeep(this.store.points)
      _points.push(point)
      _points.sort((a, b) => a.x - b.x)
      this.store.points = _points
    } else {
      // 第二次绘制
      const _points = cloneDeep(this.store.points)
      _points.push(point)
      _points.sort((a, b) => a.x - b.x)
      this.store.points = _points
      this.isDrawing = false
      // 确保 line series 已创建并更新最终数据
      if (this.series[0]) {
        ;(this.series[0] as ISeriesApi<'Line'>).setData(
          this.store.points.map((item) => {
            return {
              time: item.x as Time,
              value: item.y,
            }
          }),
        )
      }
    }
  }
  isComplete() {
    console.log('是否玩成:', this.store.points.length >= 2)
    return this.store.points.length >= 2
  }
  remove() {}
}
