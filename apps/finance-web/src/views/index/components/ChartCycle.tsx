import { defineComponent, ref } from 'vue'
import { MyTagButton } from '@/components/button/MyTagButton'

export default defineComponent({
  setup() {
    const activeCycle = ref('1d')
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
                onClick={() => (activeCycle.value = item.value)}
                active={item.value === activeCycle.value}
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
