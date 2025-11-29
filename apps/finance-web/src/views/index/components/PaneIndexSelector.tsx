import { computed, defineComponent, ref, toValue, type PropType } from 'vue'
import type { ChartInstance } from '@/hooks/useChart'
import { indexListMap } from '@/utils/const'
import type { Position, UsePane } from '@/hooks/usePane'
import type { INDEX_NAME } from '@fuwenjiang1997/draw-plugin'
import { NSelect } from 'naive-ui'

export default defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
  },
  setup(props) {
    const renderFooterIndexList = computed(() => {
      return toValue(props.chart.renderIndexList).filter((item) => {
        const _item = toValue(item.plugin)
        return _item?.name && indexListMap[_item.name]
      })
    })
    const renderFooterIndexNameList = computed(() => {
      return renderFooterIndexList.value
        .map((item) => {
          const name = toValue(item.plugin)?.name
          return name ? indexListMap[name]?.value : undefined
        })
        .filter(Boolean)
    })

    return () => (
      <div>
        {(renderFooterIndexList.value || []).map((item, index) => {
          const _item = toValue(item.plugin)
          return (
            <PaneIndexSelectorItem
              chart={props.chart}
              pane={item}
              name={_item?.name ? indexListMap[_item.name]?.label : ''}
              selectedPluginNameList={renderFooterIndexNameList.value}
              key={item.id}
              index={index}
            ></PaneIndexSelectorItem>
          )
        })}
      </div>
    )
  },
})

const PaneIndexSelectorItem = defineComponent({
  props: {
    chart: {
      type: Object as PropType<ChartInstance>,
      required: true,
    },
    pane: {
      type: Object as PropType<UsePane>,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    selectedPluginNameList: {
      type: Array as PropType<(INDEX_NAME | undefined)[]>,
      default: () => [],
    },
    index: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const options = computed(() => {
      return Object.values(indexListMap).filter((item) => {
        return !props.selectedPluginNameList.includes(item.value)
      })
    })

    const selectPlugin = computed({
      get() {
        return toValue(props.pane.plugin)?.name
      },
      set(v: INDEX_NAME) {
        props.pane.removePlugin()
        props.chart.addIndex(v, props.index)
      },
    })

    return () => {
      return (
        <>
          {/* <div
            class={'absolute z-10 w-full h-[1px] bg-black'}
            style={{
              left: `${position.value.left}px`,
              top: `${position.value.top - 1}px`,
            }}
          ></div> */}
          <div
            class={'absolute z-10'}
            style={{
              left: `${toValue(props.pane.position).left}px`,
              top: `${toValue(props.pane.position).top}px`,
            }}
          >
            <NSelect
              size="tiny"
              class={'min-w-22 opacity-75'}
              placeholder="指标"
              value={selectPlugin.value}
              onUpdate:value={(v) => (selectPlugin.value = v)}
              options={options.value}
            >
              {{
                empty: () => <div class={'text-gray-500'}>None</div>,
              }}
            </NSelect>
          </div>
        </>
      )
    }
  },
})
