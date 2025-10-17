import { defineComponent, ref, type PropType } from 'vue'
import { MyTagButton } from '@/components/button/MyTagButton'
import type { ChartInstance } from '@/hooks/useChart'

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
      { label: '1分钟', value: '1m' },
      { label: '5分钟', value: '5m' },
      { label: '15分钟', value: '15m' },
      { label: '30分钟', value: '30m' },
      { label: '1小时', value: '1h' },
      { label: '1天', value: '1d' },
      { label: '1周', value: '1w' },
      { label: '1月', value: '1M' },
    ]

    return () => (
      <div>
        <div class={'flex gap-1 px-4'}>
          {cycleList.map((item) => {
            return (
              <MyTagButton
                onClick={() => props.chart.setCircle(item.value)}
                active={item.value === props.chart.circle}
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
