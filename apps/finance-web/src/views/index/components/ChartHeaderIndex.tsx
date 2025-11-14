import { computed, defineComponent, ref, useTemplateRef, type PropType } from 'vue'
import type { ChartInstance } from '@/hooks/useChart'
import { useElementSize } from '@vueuse/core'
import cn from 'classnames'
import { INDEX_NAME } from '@fuwenjiang1997/draw-plugin'
import { NButton, NDropdown } from 'naive-ui'

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

    const defaultColor = '#000'
    const indexList = [
      {
        label: '无',
        value: undefined,
        options: [],
      },
      {
        label: 'MA',
        value: INDEX_NAME.SMA,
        options: [
          { label: 'MA5', value: 5, color: '#000' },
          { label: '10', value: 10, color: '#f5ca0f' },
          { label: '20', value: 20, color: '#b715d7' },
          { label: '60', value: 60, color: '#3ea44b' },
          // { label: '120', value: 120, color: '#d91a45' },
        ],
      },
    ]

    const selectedIndexValue = ref<INDEX_NAME | undefined>(undefined)
    const selectedIndexOption = computed(() => {
      return indexList.find((item) => item.value === selectedIndexValue.value)
    })

    function onCLickIndex(v?: INDEX_NAME) {
      if (selectedIndexValue.value) {
        props.chart.removeIndex(selectedIndexValue.value)
      }
      selectedIndexValue.value = v
      if (v) {
        props.chart.addIndex(v, undefined)
      }
    }

    const IndexSelecter = () => {
      return (
        <div class={'grid grid-cols-4 gap-2 p-2 w-40 text-sm'}>
          {indexList.map((item) => {
            return (
              <div>
                <div
                  class={cn('inline-block px-1 py-0.5 cursor-pointer rounded hover:bg-gray-100', {
                    'bg-gray-200': selectedIndexValue.value === item.value,
                  })}
                  onClick={() => onCLickIndex(item.value)}
                >
                  {item.label}
                  {/* <i class={' ml-0.5 text-xs iconfont icon-zhibiao'}></i> */}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    const IndexSelector = [
      {
        key: 'header',
        type: 'render',
        render: IndexSelecter,
      },
    ]

    return () => (
      <div class={cn('flex gap-2 items-center px-4')}>
        <NDropdown trigger="click" placement="top-start" options={IndexSelector}>
          <NButton size="tiny">
            <span
              class={cn('select-none', {
                'text-[11px]': isMinWindow.value,
              })}
            >
              {selectedIndexOption.value?.label}
            </span>
          </NButton>
        </NDropdown>

        <div class={'flex gap-2'}>
          {selectedIndexOption.value?.options.map((item) => {
            return <span style={{ color: item.color || defaultColor }}>{item.label}</span>
          })}
        </div>
      </div>
    )
  },
})
