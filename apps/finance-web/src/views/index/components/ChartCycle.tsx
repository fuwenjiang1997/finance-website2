import {
  computed,
  defineComponent,
  onMounted,
  ref,
  toValue,
  useTemplateRef,
  type PropType,
} from 'vue'
import { MyTagButton, MyTagButtonSize } from '@/components/button/MyTagButton'
import type { ChartInstance } from '@/hooks/useChart'
import { cycleListMap, KLineCircle } from '@/utils/const'
import { useElementSize } from '@vueuse/core'
import cn from 'classnames'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
  },
  setup(props) {
    const currentCircle = computed(() => toValue(props.chart.circle))
    const cycleRef = useTemplateRef<HTMLElement>('cycleRef')
    const { width } = useElementSize(cycleRef)

    const isMinWindow = computed(() => width.value < 600)

    return () => (
      <div
        class={cn('flex px-4 gap-[1px]', {
          '!gap-1': !isMinWindow.value,
        })}
        ref="cycleRef"
      >
        {Object.values(cycleListMap).map((item) => {
          return (
            <MyTagButton
              onClick={() => props.chart.setCircle(item.value)}
              active={item.value === currentCircle.value}
              size={isMinWindow.value ? MyTagButtonSize.Small : MyTagButtonSize.Default}
            >
              <span
                class={cn({
                  'text-[11px]': isMinWindow.value,
                })}
              >
                {item.label}
              </span>
            </MyTagButton>
          )
        })}
      </div>
    )
  },
})
