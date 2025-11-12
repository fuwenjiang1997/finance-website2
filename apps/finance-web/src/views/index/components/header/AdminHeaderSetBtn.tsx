import { MyTagButton } from '@/components/button/MyTagButton'
import { defineComponent, reactive, ref } from 'vue'
import { NForm, NFormItem, NColorPicker, NButton, NModal, NSpace } from 'naive-ui'
import { DEFAULT_UP_COLOR, DEFAULT_DOWN_COLOR } from '@/utils/const'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
  setup() {
    const showModal = ref(false)
    return () => (
      <>
        <MyTagButton onClick={() => (showModal.value = true)}>
          <i class={'iconfont icon-shezhi'}></i>
        </MyTagButton>
        <NModal
          show={showModal.value}
          onUpdate:show={(v) => (showModal.value = v)}
          preset="dialog"
          title="设置"
          class={'!w-[600px]'}
        >
          <PopoverContent onUpdate:show={(v) => (showModal.value = v)}></PopoverContent>
        </NModal>
      </>
    )
  },
})

const PopoverContent = defineComponent({
  emits: {
    'update:show': (v: boolean) => true,
  },
  setup(props, { emit }) {
    const appStore = useAppStore()
    const { appSets } = storeToRefs(appStore)

    const form = reactive(cloneDeep(appSets.value))

    function onReSetKLineColor() {
      form.upColor = DEFAULT_UP_COLOR
      form.downColor = DEFAULT_DOWN_COLOR
    }

    function onCancel() {
      emit('update:show', false)
    }

    function onOk() {
      appSets.value = cloneDeep(form)
      emit('update:show', false)
    }

    return () => (
      <div class={' mt-4'}>
        <NForm label-placement="left">
          <div>
            <h2 class={'my-2 text-base font-semibold'}>K线颜色</h2>

            <div class={' w-full flex gap-2'}>
              <NFormItem class={'flex-1'} label="上涨">
                <NColorPicker
                  value={form.upColor}
                  swatches={[DEFAULT_UP_COLOR, DEFAULT_DOWN_COLOR]}
                  onUpdate:value={(v: string) => (form.upColor = v)}
                ></NColorPicker>
              </NFormItem>
              <NFormItem class={'flex-1'} label="下跌">
                <NColorPicker
                  value={form.downColor}
                  onUpdate:value={(v) => (form.downColor = v)}
                  swatches={[DEFAULT_UP_COLOR, DEFAULT_DOWN_COLOR]}
                ></NColorPicker>
              </NFormItem>

              <NButton type="primary" onClick={onReSetKLineColor}>
                恢复默认值
              </NButton>
            </div>
          </div>
          <div>
            <NSpace class={'w-full'} justify="end">
              <NButton onClick={onCancel}>取消</NButton>
              <NButton type="primary" onClick={onOk}>
                确认
              </NButton>
            </NSpace>
          </div>
        </NForm>
      </div>
    )
  },
})
