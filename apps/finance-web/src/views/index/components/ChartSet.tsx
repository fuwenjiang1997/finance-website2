import { MyTagButton, MyTagButtonSize } from '@/components/button/MyTagButton'
import type { ChartInstance } from '@/hooks/useChart'
import { PluginWidth } from '@fuwenjiang1997/draw-plugin'
import { useResizeObserver } from '@vueuse/core'
import { NButton, NColorPicker, NDropdown, NPopconfirm } from 'naive-ui'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { toValue, type FunctionalComponent } from 'vue'
import cn from 'classnames'
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  type PropType,
  type TemplateRef,
} from 'vue'
import { LineStyle } from 'lightweight-charts'

interface SetItem {
  key: string
  label: string
  cmp: FunctionalComponent<SetItemCmpProps>
}

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
    const yColWidth = ref()
    const setMap: { [k: string]: SetItem } = {
      color: {
        key: 'color',
        label: '颜色',
        cmp: SetColor,
      },
      lineWidth: {
        key: 'lineWidth',
        label: '线条宽度',
        cmp: SetLineWidth,
      },
      lineType: {
        key: 'lineType',
        label: '线条类型',
        cmp: setLineType,
      },
      lock: {
        key: 'lock',
        label: '锁',
        cmp: SetLock,
      },
      lineVisible: {
        key: 'lineVisible',
        label: '是否可见',
        cmp: setLineVisible,
      },
      lineDelete: {
        key: 'lineDelete',
        label: '删除',
        cmp: setDeleteDraw,
      },
    }

    const { stop } = useResizeObserver(props.chartContainerRef, (entries) => {
      const entry = entries[0]
      if (!entry) return
      yColWidth.value = props.chartContainerRef.value?.querySelector(
        'table tr:nth-child(1) td:nth-child(3)',
      )?.clientWidth
    })

    const style = computed(() => {
      const containerWidth = props.chartContainerRef.value?.clientWidth
      if (!yColWidth.value || !containerWidth) return ''

      return `right: ${yColWidth.value + containerWidth * 0.05}px`
    })

    onBeforeUnmount(() => {
      stop()
    })

    return () => {
      return (
        <div
          class={
            ' absolute top-10 z-10 flex gap-1 items-center py-2 px-2 bg-white box-shadow rounded text-sm'
          }
          style={style.value}
        >
          {Object.values(setMap).map((item) => {
            return <item.cmp key={item.key} item={item} chart={props.chart}></item.cmp>
          })}
        </div>
      )
    }
  },
})

interface SetItemCmpProps {
  item: SetItem
  chart: ChartInstance
}

const SetColor: FunctionalComponent<SetItemCmpProps> = (props) => {
  const selectedDrawing = toValue(props.chart.selectedDrawing)
  return (
    <div class={'w-8 flex-center'}>
      <NColorPicker
        value={selectedDrawing?.store.color}
        onUpdateValue={(v) => selectedDrawing?.setLineColor(v)}
        class={'!h-4'}
        render-label="1"
        size="small"
        swatches={['#FFFFFF', '#18A058', '#2080F0', '#F0A020', 'rgba(208, 48, 80, 1)']}
        onUpdate:value={(v) => selectedDrawing?.setLineColor(v)}
      >
        {{
          label: (color: string) => {
            ;<div class={'w-full h-full'} style={{ background: color }}></div>
          },
        }}
      </NColorPicker>
    </div>
  )
}

const SetLock: FunctionalComponent<SetItemCmpProps> = (props) => {
  const selectedDrawing = toValue(props.chart.selectedDrawing)
  return (
    <MyTagButton
      active={selectedDrawing?.store.isLocked}
      onClick={() => selectedDrawing?.setLock(!selectedDrawing?.store.isLocked)}
    >
      <i class={'iconfont icon-lock !text-xl'}></i>
    </MyTagButton>
  )
}
const SetLineWidth: FunctionalComponent<SetItemCmpProps> = (props) => {
  const options: DropdownMixedOption[] = [
    {
      label: `${PluginWidth.w1}px`,
      key: PluginWidth.w1,
    },
    {
      label: `${PluginWidth.w2}px`,
      key: PluginWidth.w2,
    },
    {
      label: `${PluginWidth.w3}px`,
      key: PluginWidth.w3,
    },
    {
      label: `${PluginWidth.w4}px`,
      key: PluginWidth.w4,
    },
  ]
  const selectedDrawing = toValue(props.chart.selectedDrawing)
  return (
    <NDropdown options={options} onSelect={(k) => selectedDrawing?.setLineWidth(k as PluginWidth)}>
      <MyTagButton>{selectedDrawing?.store.lineWidth}px</MyTagButton>
    </NDropdown>
  )
}

const SetLineStyleItemOptiop: FunctionalComponent<{
  showText: string
  class: string
  onClick: () => void
}> = (props) => {
  return (
    <div class={'w-20 px-1'}>
      <div
        class={'px-2 py-2 flex items-center gap-2 text-xs hover:bg-gray-100 cursor-pointer rounded'}
      >
        <div class={cn('w-4 border-b-2 border-black', props.class)}></div>
        <span>{props.showText}</span>
      </div>
    </div>
  )
}

const setLineType: FunctionalComponent<SetItemCmpProps> = (props) => {
  const lineCmp = {
    [LineStyle.Solid]: () => (
      <SetLineStyleItemOptiop
        showText="实现"
        class="border-solid"
        onClick={() => selectedDrawing?.setLineStyle(LineStyle.Solid)}
      ></SetLineStyleItemOptiop>
    ),
    [LineStyle.Dashed]: () => (
      <SetLineStyleItemOptiop
        showText="虚线"
        class="border-dashed"
        onClick={() => selectedDrawing?.setLineStyle(LineStyle.Dashed)}
      ></SetLineStyleItemOptiop>
    ),
  }

  const options: DropdownMixedOption[] = [
    {
      key: LineStyle.Solid,
      type: 'render',
      render: lineCmp[LineStyle.Solid],
    },
    {
      key: LineStyle.Dashed,
      type: 'render',
      render: lineCmp[LineStyle.Dashed],
    },
  ]

  const selectedDrawing = toValue(props.chart.selectedDrawing)

  return (
    <NDropdown options={options}>
      <MyTagButton>
        <div
          class={cn('w-4 border-b-2 border-black', {
            ' border-solid': selectedDrawing?.store?.lineStyle === LineStyle.Solid,
            ' border-dashed': selectedDrawing?.store?.lineStyle === LineStyle.Dashed,
          })}
        ></div>
      </MyTagButton>
    </NDropdown>
  )
}

const setLineVisible: FunctionalComponent<SetItemCmpProps> = (props) => {
  const selectedDrawing = toValue(props.chart.selectedDrawing)

  const lineVisible = selectedDrawing?.store.lineVisible

  return (
    <MyTagButton onClick={() => selectedDrawing?.setLineVisible(!lineVisible)}>
      <i
        class={cn('iconfont ', {
          'icon-kejianxing-kejian': lineVisible,
          'icon-kejianxing-bukejian': !lineVisible,
        })}
      ></i>
    </MyTagButton>
  )
}

const setDeleteDraw: FunctionalComponent<SetItemCmpProps> = (props) => {
  const selectedDrawing = toValue(props.chart.selectedDrawing)

  return (
    <NPopconfirm onPositiveClick={() => props.chart.deleteDraw(selectedDrawing!.store.id)}>
      {{
        trigger: () => (
          <MyTagButton>
            <i class={cn('iconfont icon-shanchu')}></i>
          </MyTagButton>
        ),
        default: () => '确定要删除吗？',
      }}
    </NPopconfirm>
  )
}
