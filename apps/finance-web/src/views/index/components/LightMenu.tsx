import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toValue,
  type PropType,
  type TemplateRef,
} from 'vue'
import { NDropdown, type DropdownOption } from 'naive-ui'
import type { ChartInstance } from '@/hooks/useChart'

export default defineComponent({
  props: {
    chartContainerRef: {
      type: Object as PropType<TemplateRef<HTMLElement>>,
      required: true,
    },
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
  },
  setup(props) {
    const chart = props.chart
    const chartContainerRef = props.chartContainerRef
    const dropdownPosition = reactive<{ x: number; y: number }>({
      x: 0,
      y: 0,
    })
    const kLineInfo = reactive<{ time: number | undefined; price: number | undefined }>({
      time: undefined,
      price: undefined,
    })
    const showDropdown = ref(false)

    // Dropdown 菜单的选项
    const dropdownOptions = computed((): DropdownOption[] => {
      return [
        {
          label: toValue(chart.kLineSimulation.isActriveKLineSimulation)
            ? '退出k线回放'
            : 'k线回放',
          key: 'k-line-playback',
          needVip: false,
          props: {
            onClick: () => {
              if (toValue(chart.kLineSimulation.isActriveKLineSimulation)) {
                chart.kLineSimulation.exitKLineSimulation()
              } else {
                if (kLineInfo.time !== undefined) {
                  chart.kLineSimulation.startKLineSimulation(kLineInfo.time)
                }
              }
              showDropdown.value = false
            },
          },
        },
      ]
    })

    function onClickOutside() {}
    function handleDropdownSelect() {}

    function handleContextMenu(event: MouseEvent) {
      event.preventDefault() // 阻止默认浏览器菜单
      if (!chartContainerRef.value) {
        return
      }
      showDropdown.value = false // 先关闭

      // const chartX = event.clientX - chartContainerRef.value.getBoundingClientRect().left
      // const chartY = event.clientY - chartContainerRef.value.getBoundingClientRect().top

      const data = chart.getTimePriceFromPosition(event)
      if (data) {
        kLineInfo.price = data.price || undefined
        kLineInfo.time = data.time || undefined
      }
      dropdownPosition.x = event.clientX //chartX
      dropdownPosition.y = event.clientY
      showDropdown.value = true
    }

    function closeContextMenu() {
      showDropdown.value = false
    }

    onMounted(() => {
      chartContainerRef.value?.addEventListener('contextmenu', handleContextMenu)
      chartContainerRef.value?.addEventListener('click', closeContextMenu)
    })
    onBeforeUnmount(() => {
      chartContainerRef.value?.removeEventListener('contextmenu', handleContextMenu)
      chartContainerRef.value?.removeEventListener('click', closeContextMenu)
    })

    return () => (
      <NDropdown
        placement="bottom-start"
        trigger="manual"
        x={dropdownPosition.x}
        y={dropdownPosition.y}
        options={dropdownOptions.value}
        show={showDropdown.value}
        onClickoutside={onClickOutside}
        onSelect={handleDropdownSelect}
      />
    )
  },
})
