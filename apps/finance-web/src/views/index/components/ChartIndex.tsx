import { computed, defineComponent, toValue, useTemplateRef, type PropType } from 'vue'
import { MyTagButton, MyTagButtonSize } from '@/components/button/MyTagButton'
import type { ChartInstance } from '@/hooks/useChart'
import { indexListMap } from '@/utils/const'
import { useElementSize } from '@vueuse/core'
import cn from 'classnames'
import type { INDEX_NAME } from '@fuwenjiang1997/draw-plugin'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
  },
  setup(props) {
    const cycleRef = useTemplateRef<HTMLElement>('cycleRef')
    const { width } = useElementSize(cycleRef)
    const isMinWindow = computed(() => width.value < 600)

    function onClickIndex(name: INDEX_NAME) {
      if (toValue(props.chart.renderIndexNameList).includes(name)) {
        props.chart.removeIndex(name)
      } else {
        props.chart.addIndex(name)
      }
    }

    return () => (
      <div
        class={cn('flex px-4 gap-[1px]', {
          '!gap-1': !isMinWindow.value,
        })}
        ref="cycleRef"
      >
        {Object.values(indexListMap).map((item) => {
          return (
            <MyTagButton
              onClick={() => onClickIndex(item.value)}
              active={toValue(props.chart.renderIndexNameList).includes(item.value)}
              size={isMinWindow.value ? MyTagButtonSize.Small : MyTagButtonSize.Default}
            >
              <span
                class={cn('select-none', {
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
