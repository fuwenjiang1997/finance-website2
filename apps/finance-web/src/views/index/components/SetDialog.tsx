import { defineComponent } from 'vue'
import { NModal, NForm, NFormItem, NButton } from 'naive-ui'

export default defineComponent({
  setup(props, { attrs }) {
    return () => (
      <NModal {...attrs}>
        <div>
          <NForm>
            <NFormItem>
              <NButton>11</NButton>
            </NFormItem>
          </NForm>
        </div>
      </NModal>
    )
  },
})
