import AdminLayout from '@/layout/AdminLayout'
import { defineComponent } from 'vue'
import AdminHeader from './components/AdminHeader'
import AdminSide from './components/AdminSide'
import Chart from './components/Chart'

export default defineComponent({
  setup() {
    return () => (
      <div class={'h-screen overflow-hidden flex flex-col'}>
        <AdminHeader class={'shrink-0'}></AdminHeader>
        <div class={'flex-1 flex'}>
          <AdminSide class={'shrink-0'}></AdminSide>
          <div class={'flex-1 flex flex-col gap-1'}>
            <Chart></Chart>
          </div>
        </div>
      </div>
    )
  },
})
