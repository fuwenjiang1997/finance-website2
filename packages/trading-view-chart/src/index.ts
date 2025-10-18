import { type IChartApi } from 'lightweight-charts'
import kLineSeries from './libs/kLineSeries/kLineSeries'

export { type KLineData } from './libs/kLineSeries/kLineSeries'

interface VChartParams {}

export type VChart = ReturnType<typeof vChart>

export default function vChart(chart: IChartApi, params?: VChartParams) {
  console.log('params:>>', params)
  const kLine = kLineSeries(chart)

  return {
    kLine,
  }
}
