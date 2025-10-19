import {
  CandlestickData,
  CandlestickSeries,
  ISeriesApi,
  Time,
  WhitespaceData,
} from 'lightweight-charts'
import { shallowRef, watch } from 'vue'
import { VChartSeries } from '../type'

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

// 画k线
const kLineSeries: VChartSeries = (chart, params) => {
  watch(params.kLineData, (_kLineData) => {
    setData(_kLineData)
  })

  const mainSeries = shallowRef<ISeriesApi<'Candlestick'>>()

  mainSeries.value = chart.addSeries(CandlestickSeries, {
    // upColor: uiColor.value.upColor,
    // downColor: uiColor.value.downColor,
    borderVisible: false,
    // wickUpColor: uiColor.value.upColor,
    // wickDownColor: uiColor.value.downColor,
  })

  mainSeries.value.priceScale().applyOptions({
    scaleMargins: {
      top: 0.1, // 主图顶部留白 10%
      bottom: 0.25, // 主图底部留白 25%
    },
  })

  function getSeries() {
    return mainSeries.value
  }

  function setData(data: (CandlestickData<Time> | WhitespaceData<Time>)[]) {
    mainSeries.value?.setData(data)
  }

  return {
    getSeries,
    setData,
  }
}

export default kLineSeries
