/**
 * k线模拟
 */

import type { CandlestickData, Time, WhitespaceData } from 'lightweight-charts'
import { ref } from 'vue'
import { useMagicKeys, onKeyStroke } from '@vueuse/core'

export function useKLineSimulation() {
  const isActriveKLineSimulation = ref(false)
  const startTime = ref<number>(0)
  const endTime = ref<number>(0)
  const simulationHandler = {
    next: () => {},
    pre: () => {},
  }
  // const rangeTime = ref<[number, number]>()

  function startKLineSimulation(_endTime: number, _startTime: number = 0) {
    isActriveKLineSimulation.value = true
    startTime.value = Math.max(0, _startTime)
    endTime.value = Math.max(0, _endTime)
  }
  function exitKLineSimulation() {
    isActriveKLineSimulation.value = false
    startTime.value = 0
    endTime.value = 0
  }
  // function next(data: (CandlestickData<Time> | WhitespaceData<Time>)[]) {
  //   const endIndex = data.findIndex((item) => item.time === endTime.value)
  //   const newIndex = endIndex + 1
  //   const nextValue = data[newIndex]
  //   if (nextValue && nextValue.time) {
  //     endTime.value = nextValue.time as number
  //   }
  // }
  // function last(data: (CandlestickData<Time> | WhitespaceData<Time>)[]) {
  //   const endIndex = data.findIndex((item) => item.time === endTime.value)
  //   const newIndex = endIndex - 1
  //   const preValue = data[newIndex]
  //   if (preValue && preValue.time) {
  //     endTime.value = preValue.time as number
  //   }
  // }
  function getSimulationKLineData(data: (CandlestickData<Time> | WhitespaceData<Time>)[]) {
    if (isActriveKLineSimulation.value) {
      const startIndex = Math.max(
        0,
        data.findIndex((item) => (item.time as number) >= startTime.value),
      )

      const endIndex = Math.max(
        0,
        data.findIndex((item) => (item.time as number) >= endTime.value),
      )

      simulationHandler.next = () => {
        const newIndex = endIndex + 1
        if (newIndex > data.length - 1 || !data[newIndex]?.time) return

        endTime.value = data[newIndex].time as number
      }
      simulationHandler.pre = () => {
        const newIndex = endIndex - 1
        if (newIndex > data.length - 1 || !data[newIndex]?.time) return

        endTime.value = data[newIndex].time as number
      }

      return data.slice(startIndex, endIndex + 1)
    }
    return data
  }

  return {
    isActriveKLineSimulation,
    startKLineSimulation,
    exitKLineSimulation,
    getSimulationKLineData,
    simulationHandler,
  }
}
