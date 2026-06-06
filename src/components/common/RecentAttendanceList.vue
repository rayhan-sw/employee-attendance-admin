<script setup>
// Compact dashboard table for the five most recent valid attendance records.
import EmptyState from './EmptyState.vue'
import { getAttendanceStatus } from '../../utils/attendanceStatus'

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  workSchedule: {
    type: Object,
    required: true,
  },
})

function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getRecordStatus(record) {
  // Use the same global schedule as the full attendance table.
  return getAttendanceStatus(record, props.workSchedule)
}
</script>

<template>
  <div class="card content-card border-0 h-100">
    <div
      class="card-header bg-white border-bottom d-flex align-items-center justify-content-between gap-3 p-4"
    >
      <div>
        <h3 class="h5 fw-semibold mb-1">Absensi Terbaru</h3>
        <p class="text-secondary small mb-0">
          Lima catatan kehadiran paling baru.
        </p>
      </div>
      <RouterLink
        v-if="records.length"
        class="btn btn-sm btn-light border text-nowrap"
        to="/attendance"
      >
        Lihat Semua
      </RouterLink>
    </div>

    <div v-if="records.length" class="table-responsive">
      <table class="table recent-attendance-table align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Karyawan</th>
            <th scope="col">Tanggal</th>
            <th scope="col">Jam Kerja</th>
            <th scope="col">Gender</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attendance in records" :key="attendance.id">
            <td>
              <div class="d-flex align-items-center gap-2">
                <span class="table-avatar">
                  {{ attendance.name.charAt(0).toUpperCase() }}
                </span>
                <span class="fw-semibold text-dark text-nowrap">
                  {{ attendance.name }}
                </span>
              </div>
            </td>
            <td class="text-secondary text-nowrap">
              {{ formatDate(attendance.attendanceDate) }}
            </td>
            <td class="text-nowrap">
              <span class="text-success">{{ attendance.checkIn }}</span>
              <i class="bi bi-arrow-right-short text-secondary mx-1"></i>
              <span>{{ attendance.checkOut }}</span>
            </td>
            <td>
              <span
                class="badge fw-medium text-nowrap"
                :class="
                  attendance.gender === 'Laki-laki'
                    ? 'text-bg-primary-subtle text-primary'
                    : 'text-bg-danger-subtle text-danger'
                "
              >
                {{ attendance.gender }}
              </span>
            </td>
            <td>
              <span
                class="badge recent-status-badge fw-medium text-nowrap"
                :class="getRecordStatus(attendance).badgeClass"
                :title="getRecordStatus(attendance).description"
              >
                {{ getRecordStatus(attendance).label }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="card-body p-4">
      <EmptyState
        icon="bi-calendar2-x"
        title="Belum ada data absensi."
        message="Tambahkan catatan absensi pertama untuk melihat ringkasan."
        action-text="Tambah Absensi"
        action-to="/attendance/create"
        action-icon="bi-plus-lg"
        compact
      />
    </div>
  </div>
</template>
