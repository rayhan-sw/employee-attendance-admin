<script setup>
// Renders the processed page slice and derives status from the active schedule.
import EmptyState from './EmptyState.vue'
import { getAttendanceStatus } from '../../utils/attendanceStatus'

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  startNumber: {
    type: Number,
    default: 1,
  },
  hasAttendances: {
    type: Boolean,
    default: false,
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
  workSchedule: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete', 'reset'])

function formatAttendanceDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getRecordStatus(record) {
  // Status is never stored on the attendance record.
  return getAttendanceStatus(record, props.workSchedule)
}
</script>

<template>
  <!-- Horizontal scrolling keeps all admin columns available on small screens. -->
  <div class="table-responsive">
    <table class="table admin-table align-middle mb-0">
      <thead>
        <tr>
          <th scope="col" class="number-column">No</th>
          <th scope="col">Nama</th>
          <th scope="col">Alamat</th>
          <th scope="col">Jenis Kelamin</th>
          <th scope="col">Tanggal Absen</th>
          <th scope="col">Jam Masuk</th>
          <th scope="col">Jam Keluar</th>
          <th scope="col">Status</th>
          <th scope="col" class="text-end">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(attendance, index) in records" :key="attendance.id">
          <td class="text-secondary">{{ startNumber + index }}</td>
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
          <td class="address-cell text-secondary">
            {{ attendance.address }}
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
          <td class="text-nowrap">
            {{ formatAttendanceDate(attendance.attendanceDate) }}
          </td>
          <td class="text-nowrap">
            <i class="bi bi-box-arrow-in-right text-success me-1"></i>
            {{ attendance.checkIn }}
          </td>
          <td class="text-nowrap">
            <i class="bi bi-box-arrow-right text-secondary me-1"></i>
            {{ attendance.checkOut }}
          </td>
          <td>
            <span
              class="badge fw-medium text-nowrap"
              :class="getRecordStatus(attendance).badgeClass"
              :title="getRecordStatus(attendance).description"
            >
              {{ getRecordStatus(attendance).label }}
            </span>
          </td>
          <td>
            <div class="table-action-buttons d-flex justify-content-end gap-2">
              <RouterLink
                class="btn btn-sm btn-outline-primary"
                :to="`/attendance/${attendance.id}/edit`"
                :aria-label="`Edit data ${attendance.name}`"
              >
                <i class="bi bi-pencil-square"></i>
                <span class="d-none d-xxl-inline ms-1">Edit</span>
              </RouterLink>
              <button
                class="btn btn-sm btn-outline-danger"
                type="button"
                :aria-label="`Hapus data ${attendance.name}`"
                @click="emit('delete', attendance.id)"
              >
                <i class="bi bi-trash3"></i>
                <span class="d-none d-xxl-inline ms-1">Delete</span>
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="records.length === 0">
          <td colspan="9">
            <EmptyState
              v-if="hasAttendances"
              icon="bi-search"
              title="Data absensi tidak ditemukan."
              message="Coba ubah kata pencarian atau filter tanggal."
              :action-text="hasActiveFilters ? 'Reset Filter' : ''"
              action-icon="bi-arrow-counterclockwise"
              action-variant="light border"
              @action="emit('reset')"
            />
            <EmptyState
              v-else
              icon="bi-calendar2-x"
              title="Belum ada data absensi."
              message="Tambahkan data baru untuk mulai mengisi daftar absensi."
              action-text="Tambah Absensi"
              action-to="/attendance/create"
              action-icon="bi-plus-lg"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
