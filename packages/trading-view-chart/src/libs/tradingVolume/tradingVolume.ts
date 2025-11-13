import { HistogramSeries, IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { KLineOriginData, VChartSeriesParams } from '../type'
import { shallowRef, watch } from 'vue'
import dayjs from 'dayjs'
import Color from 'color'

/**  成交量 */
const tradingVolume = (chart: IChartApi, params: VChartSeriesParams) => {
  watch(params.kLineOriginData, (_kLineData) => {
    setData(_kLineData)
  })

  const volumeSeries = shallowRef<ISeriesApi<'Histogram'>>()

  function setData(data: KLineOriginData[]) {
    const volumeData = data.map((item) => {
      return {
        time: dayjs(item.OpenTime).unix() as number,
        value: item.Volume,
      }
    })
    volumeSeries.value?.setData(
      volumeData.map((vol, idx) => {
        return {
          time: vol.time as Time,
          value: vol.value,
          color:
            data[idx].Close > data[idx].Open
              ? Color(params.color.upColor).alpha(0.7).toString()
              : Color(params.color.downColor).alpha(0.7).toString(),
        }
      }),
    )
  }

  volumeSeries.value = chart.addSeries(HistogramSeries, {
    priceFormat: {
      type: 'volume', // 格式化成交量，例如 1.5K, 2M
    },
    priceScaleId: '', // 隐藏Y轴价格标签，它不代表价格
  })
  volumeSeries.value.priceScale().applyOptions({
    scaleMargins: {
      top: 0.8, // 主图顶部留白 10%
      bottom: 0, // 主图底部留白 30%，这个空间会给 pane 1
    },
  })

  function getSeries() {
    return volumeSeries.value
  }

  function renderByUpdateColor() {
    setData(params.kLineOriginData.value)
  }

  return {
    getSeries,
    renderByUpdateColor,
  }
}

export default tradingVolume
