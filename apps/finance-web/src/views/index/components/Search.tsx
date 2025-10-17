import { computed, defineComponent, ref, type FunctionalComponent } from 'vue'
import { useChartStore, type CodeSymbol } from '@/stores/chartStore'
import MyTable from '@/components/table/MyTable.vue'
import { NModal, NInput, NButton, NTag, useNotification } from 'naive-ui'
import type { ModalProps } from 'naive-ui'
import { throttle } from 'lodash-es'

const MAX_CHART_COUNT = 4

export default defineComponent({
  setup() {
    const isShowStockModal = ref(false)
    const chartStore = useChartStore()
    const notification = useNotification()

    function onSelectStock(data: CodeSymbol) {
      if (!data.code || !data.name) {
        return
      }
      const size = chartStore.chartList.size
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
          <div class={'flex gap-2 items-center'}>
            <NButton size="small" onClick={() => (isShowStockModal.value = true)}>
              <i class={'iconfont icon-search mr-2'}></i>
              搜索
            </NButton>
            <div class={'flex gap-2'}>
              <SelectedCodeList />
            </div>
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
    return props.data.filter((item) => {
      if (item.code.includes(searchValue.value) || item.name.includes(searchValue.value)) {
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
        <div class={'flex gap-2 mb-5'}>
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
    if (chartStore.chartList.size <= 1) {
      notification.warning({
        content: '至少需要有一个图表',
        duration: 3000,
      })
      return
    }
    chartStore.onDeleteChart(id)
  }

  return (
    <>
      {[...chartStore.chartList].map(([, item]) => {
        return (
          <NTag closable onClose={() => onDeleteChart(item.id)}>
            {item.name}
          </NTag>
        )
      })}
    </>
  )
}
