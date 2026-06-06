// Central route map for pages rendered inside the shared admin layout.
import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import AttendanceFormView from '../views/AttendanceFormView.vue'
import AttendanceListView from '../views/AttendanceListView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Child routes keep the sidebar and topbar mounted across page changes.
  routes: [
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: {
            title: 'Dashboard',
          },
        },
        {
          path: 'attendance',
          name: 'attendance-list',
          component: AttendanceListView,
          meta: {
            title: 'Data Absensi',
          },
        },
        {
          path: 'attendance/create',
          name: 'attendance-create',
          component: AttendanceFormView,
          meta: {
            title: 'Tambah Absensi',
          },
        },
        {
          path: 'attendance/:id/edit',
          name: 'attendance-edit',
          component: AttendanceFormView,
          meta: {
            title: 'Edit Absensi',
          },
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
