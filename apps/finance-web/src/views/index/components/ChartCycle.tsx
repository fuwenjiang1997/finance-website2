import { computed, defineComponent, ref, toValue, type PropType } from 'vue'
import { MyTagButton } from '@/components/button/MyTagButton'
import type { ChartInstance } from '@/hooks/useChart'
import { cycleListMap, KLineCircle } from '@/utils/const'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
  },
  setup(props) {
    const currentCircle = computed(() => toValue(props.chart.circle))

    return () => (
      <div>
        <div class={'flex gap-1 px-4'}>
          {Object.values(cycleListMap).map((item) => {
            return (
              <MyTagButton
                onClick={() => props.chart.setCircle(item.value)}
                active={item.value === currentCircle.value}
              >
                {item.label}
              </MyTagButton>
            )
          })}
        </div>
      </div>
    )
  },
})
