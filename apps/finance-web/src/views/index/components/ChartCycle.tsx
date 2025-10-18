import { computed, defineComponent, ref, toValue, type PropType } from 'vue'
import { MyTagButton } from '@/components/button/MyTagButton'
import type { ChartInstance } from '@/hooks/useChart'
import { KLineCircle } from '@/utils/const'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
  },
  setup(props) {
    // const activeCycle = ref('1d')
    console.log('props:>>', props)
    const cycleList = [
      { label: '1分钟', value: KLineCircle.m1 },
      { label: '5分钟', value: KLineCircle.m5 },
      { label: '15分钟', value: KLineCircle.m15 },
      { label: '30分钟', value: KLineCircle.m30 },
      { label: '1小时', value: KLineCircle.H1 },
      { label: '1天', value: KLineCircle.D1 },
      { label: '1周', value: KLineCircle.W1 },
      { label: '1月', value: KLineCircle.M1 },
    ]

    const currentCircle = computed(() => toValue(props.chart.circle))

    return () => (
      <div>
        <div class={'flex gap-1 px-4'}>
          {cycleList.map((item) => {
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
