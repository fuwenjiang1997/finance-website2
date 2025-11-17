import { defineComponent, nextTick, toValue, type PropType } from 'vue'
import type { ChartInstance } from '@/hooks/useChart'
import { indexListMap } from '@/utils/const'
import { computedAsync } from '@vueuse/core'
import { sleep } from '@/utils/fun'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
  },
  setup(props) {
    const renderIndexSelectorOptions = computedAsync(async () => {
      const v = toValue(props.chart.renderIndexList)
      await sleep()

      const res = v
        .filter((item) => {
          return item.plugin.value?.name && indexListMap[item.plugin.value.name]
        })
        .map((item) => {
          const { left, top } = toValue(item.position)
          return {
            left,
            top,
            label: item.plugin.value?.name && indexListMap[item.plugin.value.name]?.label,
          }
        })
      console.log('res:>>', res)
      return res
    })

    return () => (
      <div class={'hidden'}>
        {(renderIndexSelectorOptions.value || []).map((item) => {
          return (
            <div
              class={'absolute'}
              style={{
                left: item.left,
                top: item.top,
              }}
            >
              {item.label}
            </div>
          )
        })}
      </div>
    )
  },
})
