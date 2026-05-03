import { computed, defineComponent, ref, type FunctionalComponent } from 'vue'
import { MAX_CHART_COUNT, useChartStore, type CodeSymbol } from '@/stores/chartStore'
import MyTable from '@/components/table/MyTable.vue'
import { NModal, NInput, NButton, NTag, useNotification, NScrollbar } from 'naive-ui'
import type { ModalProps } from 'naive-ui'

export default defineComponent({
  setup() {
    const isShowStockModal = ref(false)
    const chartStore = useChartStore()
    const notification = useNotification()

    function onSelectStock(data: CodeSymbol) {
      if (!data.code || !data.name) {
        return
      }
      const size = chartStore.chartList.length
      if (size >= MAX_CHART_COUNT) {
        notification.warning({
          content: `最多可以设置${MAX_CHART_COUNT}个图表`,
          duration: 3000,
        })
        return
      }
      chartStore.onAddChartByCode(data)
    }

    return () => {
      return (
        <>
          <div class={'w-full flex gap-2 items-center'}>
            <NButton
              class={' shrink-0'}
              size="small"
              onClick={() => (isShowStockModal.value = true)}
            >
              <i class={'iconfont icon-search mr-2'}></i>
              搜索
            </NButton>
            <NScrollbar x-scrollable>
              <div class={'h-8 flex-1 flex gap-2 items-center pr-20'}>
                <SelectedCodeList />
              </div>
            </NScrollbar>
          </div>
          <SearchDialog
            show={isShowStockModal.value}
            onUpdate:show={(v) => (isShowStockModal.value = v)}
            data={chartStore.codeSymbolList}
            onSelect={onSelectStock}
          />
        </>
      )
    }
  },
})

interface SearchDialogPropsData {
  code: string
  name: string
}
interface SearchDialogProps extends ModalProps {
  data: SearchDialogPropsData[]
  onSelect: (data: CodeSymbol) => void
}
const SearchDialog: FunctionalComponent<SearchDialogProps> = (props, { attrs }) => {
  const columns = [
    {
      title: '股票代码',
      dataIndex: 'code',
    },
    {
      title: '股票名称',
      dataIndex: 'name',
    },
    {
      title: '操作',
      slotName: 'action',
    },
  ]

  // const data = props.data
  const searchValue = ref('')
  const renderList = computed(() => {
    if (!searchValue.value) {
      return props.data
    }

    const _searchValue = searchValue.value.toLowerCase()
    return props.data.filter((item) => {
      if (item.code.toLowerCase().includes(_searchValue) || item.name.includes(_searchValue)) {
        return true
      }
      return false
    })
  })

  return (
    <NModal {...attrs} title="股票选择" preset="card" style="width: 700px">
      <div class="flex flex-col h-[70vh]">
        <div class="flex gap-4 mb-2">
          <NInput
            value={searchValue.value}
            onUpdate:value={(v) => (searchValue.value = v)}
            placeholder="搜索股票"
          />
          <NButton>搜索</NButton>
        </div>
        <div class={'flex flex-wrap gap-2 mb-5'}>
          <SelectedCodeList />
        </div>
        <MyTable class={'flex-1'} columns={columns} data={renderList.value}>
          {{
            action: ({ record }: { record: CodeSymbol }) => (
              <div class={'flex-center'}>
                <NButton size="small" onClick={() => props.onSelect(record)}>
                  选择
                </NButton>
              </div>
            ),
          }}
        </MyTable>
      </div>
    </NModal>
  )
}

const SelectedCodeList: FunctionalComponent = () => {
  const chartStore = useChartStore()
  const notification = useNotification()

  function onDeleteChart(id: string) {
    try {
      chartStore.onDeleteChart(id)
    } catch (error) {
      if (error instanceof Error && error?.message === 'Minimum1') {
        notification.warning({
          content: '至少需要有一个图表',
          duration: 3000,
        })
      }
    }
  }

  return (
    <>
      {chartStore.chartList.map((item, index) => {
        return (
          <NTag closable onClose={() => onDeleteChart(item.id)}>
            [{index + 1}] {item.name}({item.circle})
          </NTag>
        )
      })}
    </>
  )
}
