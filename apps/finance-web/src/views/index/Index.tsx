import { defineComponent } from 'vue'
import AdminHeader from './components/AdminHeader'
import AdminSide from './components/AdminSide'
import Chart from './components/Chart'

export default defineComponent({
  setup() {
    return () => (
      <div class={'h-screen overflow-hidden flex flex-col bg-gray'}>
        <AdminHeader class={'shrink-0'}></AdminHeader>
        <div class={'flex-1 flex'}>
          <AdminSide class={'shrink-0 py-2'}></AdminSide>
          <div class={'flex-1 flex flex-col gap-1 p-1 bg-gray'}>
            <Chart></Chart>
          </div>
        </div>
      </div>
    )
  },
})
