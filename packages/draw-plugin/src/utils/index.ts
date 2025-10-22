import { IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts'

export function getTPFromScreenPosition(
  chart: IChartApi,
  kLineSeries: ISeriesApi<SeriesType>,
  x: number,
  y: number,
) {
  const time = chart.timeScale().coordinateToTime(x)
  return { time: time as number, price: kLineSeries.coordinateToPrice(y) }
}

export function getTpFromMouseEvent(
  chart: IChartApi,
  kLineSeries: ISeriesApi<SeriesType>,
  container: HTMLElement,
  event: MouseEvent,
) {
  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {
    tp: getTPFromScreenPosition(chart, kLineSeries, x, y),
    sp: { x, y },
  }
}

export function getScreenPositonFromTP(
  chart: IChartApi,
  kLineSeries: ISeriesApi<SeriesType>,
  x: number,
  y: number,
) {
  const timeScale = chart.timeScale()
  const _x = timeScale.timeToCoordinate(x as Time)
  const _y = kLineSeries.priceToCoordinate(y)
  if (_x === null || _y === null) return
  return { x, y }
}
