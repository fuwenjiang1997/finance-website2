import {
  CandlestickData,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  Time,
  WhitespaceData,
} from 'lightweight-charts'
import { shallowRef, watch } from 'vue'
import { VChartSeriesParams } from '../type'

export interface KLineData {
  OpenTime: string
  Open: number
  High: number
  Low: number
  Close: number
  Volume: number
  CloseTime: string
  QuoteVolume: number
  TradeNum: number
  TakerBuyBase: number
  TakerBuyQuote: number
}

export type ReturnkLineSeries = ReturnType<typeof kLineSeries>

/** k线 */
const kLineSeries = (chart: IChartApi, params: VChartSeriesParams) => {
  watch(params.kLineData, (_kLineData) => {
    setData(_kLineData)
  })

  const mainSeries = shallowRef<ISeriesApi<'Candlestick'>>()

  mainSeries.value = chart.addSeries(CandlestickSeries, {
    borderVisible: false,
    upColor: params.color.upColor,
    downColor: params.color.downColor,
    wickUpColor: params.color.upColor,
    wickDownColor: params.color.downColor,
  })

  mainSeries.value.priceScale().applyOptions({
    scaleMargins: {
      top: 0.05, // 主图顶部留白 5%
      bottom: 0.05, // 主图底部留白 5%
    },
  })

  function getSeries() {
    return mainSeries.value
  }

  function setData(data: (CandlestickData<Time> | WhitespaceData<Time>)[]) {
    mainSeries.value?.setData(data)
  }

  function renderByUpdateColor() {
    mainSeries.value?.applyOptions({
      upColor: params.color.upColor,
      downColor: params.color.downColor,
      wickUpColor: params.color.upColor,
      wickDownColor: params.color.downColor,
    })
  }

  return {
    mainSeries,
    getSeries,
    renderByUpdateColor,
  }
}

export default kLineSeries
