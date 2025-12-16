import { IChartApi, ISeriesApi, LineData, LineSeries, SeriesType, Time } from 'lightweight-charts'
import { type ChanlunResult, type KLine, calculateChanLun } from '../core/chanLun'
// import { type Bi, type KLine, calculateChanLun } from '../core/chanLun2'
import { DrawIndex } from './DrawIndex'
import { INDEX_NAME, INDEX_TYPE, KLineIndexData } from '../type'

export class CHANLUN extends DrawIndex {
  public biSeries?: ISeriesApi<SeriesType>
  public zsSeries: ISeriesApi<SeriesType>[] = []
  public testFxSeries?: ISeriesApi<SeriesType>
  public testFilterFxSeries?: ISeriesApi<SeriesType>
  constructor(chartContainer: HTMLElement, chart: IChartApi, kLineSeries: ISeriesApi<SeriesType>) {
    super(chart, chartContainer)
    this.kLineSeries = kLineSeries
    // this.name = INDEX_NAME.MACD
    // this.store.id = `${INDEX_NAME.MACD}_${uuidv4()}`
    // this.cciPeriod = 20
    this.indexType = INDEX_TYPE.MAIN
    this.name = INDEX_NAME.CHANLUN

    this.biSeries = this.chart?.addSeries(LineSeries, {
      color: '#2962FF',
      lineWidth: 1,
      title: `缠论`,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    this.testFxSeries = this.chart?.addSeries(LineSeries, {
      color: '#cf3ef3',
      lineWidth: 1,
      title: `测试分型`,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    this.testFilterFxSeries = this.chart?.addSeries(LineSeries, {
      color: '#90cd22',
      lineWidth: 1,
      title: `测试筛选分型`,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })
  }

  removeSeries() {
    this.biSeries && this.chart?.removeSeries(this.biSeries)
    this.biSeries = undefined
  }

  public setData(v: KLineIndexData): void {
    this.render(v)
  }
  render(v?: KLineIndexData): void {
    if (!v) return

    if (!Array.isArray(v.highs) || !Array.isArray(v.lows) || !Array.isArray(v.times)) {
      return
    }
    const res = calcChanLun(v.highs, v.lows, v.openTimes)

    let lastFenXingTime: number | undefined
    const biData: LineData<Time>[] = []
    res.biList.forEach((item) => {
      if (biData.length === 0) {
        biData.push({
          time: item.startFenxing.time as Time,
          value: item.startFenxing.price,
        })
        lastFenXingTime = item.startFenxing.time
        return
      }
      const endTime = item.endFenxing.time

      // if (lastFenXingTime === endTime) {
      //   return
      // }
      lastFenXingTime = endTime
      biData.push({
        time: endTime as Time,
        value: item.endFenxing.price,
      })
    })

    // biData.sort((a, b) => (a.time as number) - (b.time as number))

    // console.log('biData:', biData)

    // const biData = res.biList
    //   .map((item) => {
    //     return [
    //       {
    //         time: item.startFenxing.time as Time,
    //         value: item.startFenxing.price,
    //       },
    //       {
    //         time: item.endFenxing.time as Time,
    //         value: item.endFenxing.price,
    //       },
    //     ]
    //   })
    //   .flat()
    //   .filter((item) => {
    //     if (biMap[item.time as number]) {
    //       return false
    //     }
    //     biMap[item.time as number] = true
    //     return true
    //   })
    this.biSeries?.setData(biData)

    this.testFxSeries?.setData(
      res.fenXingList.map((item) => {
        return {
          time: item.time as Time,
          value: item.price,
        }
      }),
    )
    this.testFilterFxSeries?.setData(
      res.filterFenXings.map((item) => {
        return {
          time: item.time as Time,
          value: item.price,
        }
      }),
    )

    // res.fenXingList
  }
  remove(): void {
    this.removeSeries()
    super.remove()
  }
}

function calcChanLun(highs: number[], lows: number[], times: number[]): ChanlunResult {
  const kLines: KLine[] = highs.map(
    (high, i) =>
      ({
        time: times[i],
        high,
        low: lows[i],
        index: i,
      }) as KLine,
  )

  const tMap: { [k: number]: boolean } = {}
  times.forEach((item) => {
    tMap[item] = true
  })

  const _res = calculateChanLun(kLines)
  const list = _res.biList.map((item) => {
    return [item.startFenxing.time, item.endFenxing.time]
  })
  // console.log('list:', list)
  const res: ChanlunResult = {
    biList: _res.biList,
    fenXingList: _res.fenXingList,
    filterFenXings: _res.filterFenXings,
    // duanList: [],
    // zhongshuList: [],
  }

  return res
}
