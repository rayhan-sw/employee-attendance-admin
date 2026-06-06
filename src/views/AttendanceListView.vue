<script setup>
// Attendance management page coordinates table controls, modals, and feedback.
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AttendanceTable from '../components/common/AttendanceTable.vue'
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal.vue'
import Pagination from '../components/common/Pagination.vue'
import ToastNotification from '../components/common/ToastNotification.vue'
import WorkScheduleModal from '../components/common/WorkScheduleModal.vue'
import { useAttendance } from '../composables/useAttendance'
import { useAttendanceTable } from '../composables/useAttendanceTable'
import { useWorkSchedule } from '../composables/useWorkSchedule'
import { minutesToTime } from '../utils/attendanceStatus.js'

const route = useRoute()
const router = useRouter()
const { attendances, deleteAttendance } = useAttendance()
const {
  workSchedule,
  saveWorkSchedule,
  resetWorkSchedule,
  getLateThresholdMinutes,
} = useWorkSchedule()
const {
  searchQuery,
  selectedDate,
  sortBy,
  currentPage,
  itemsPerPage,
  filteredAttendances,
  paginatedAttendances,
  totalItems,
  totalPages,
  startItem,
  endItem,
  hasActiveFilters,
  resetFilters,
  goToPage,
} = useAttendanceTable(attendances)

const selectedAttendance = ref(null)
const showWorkScheduleModal = ref(false)

// One toast state handles route feedback, deletion, and schedule updates.
const toast = reactive({
  show: false,
  type: 'success',
  title: '',
  message: '',
})

const successMessages = {
  created: 'Data absensi berhasil ditambahkan.',
  updated: 'Data absensi berhasil diperbarui.',
}
const lateThreshold = computed(() =>
  minutesToTime(getLateThresholdMinutes()),
)

function showToast(type, title, message) {
  toast.show = false
  toast.type = type
  toast.title = title
  toast.message = message
  toast.show = true
}

function closeToast() {
  toast.show = false
}

function openWorkScheduleModal() {
  showWorkScheduleModal.value = true
}

function closeWorkScheduleModal() {
  showWorkScheduleModal.value = false
}

function handleWorkScheduleSave(payload) {
  // Shared schedule state makes table badges update without reloading records.
  saveWorkSchedule(payload)
  closeWorkScheduleModal()
  showToast(
    'success',
    'Pengaturan berhasil disimpan',
    'Pengaturan jam kerja berhasil disimpan.',
  )
}

function handleWorkScheduleReset() {
  resetWorkSchedule()
  closeWorkScheduleModal()
  showToast(
    'success',
    'Pengaturan dikembalikan',
    'Pengaturan jam kerja berhasil dikembalikan ke default.',
  )
}

function handleDeleteRequest(id) {
  // Keep the selected record until the confirmation modal resolves.
  selectedAttendance.value =
    attendances.value.find((attendance) => attendance.id === id) || null
}

function closeDeleteModal() {
  selectedAttendance.value = null
}

function confirmDelete() {
  if (!selectedAttendance.value) {
    return
  }

  const employeeName = selectedAttendance.value.name
  const wasDeleted = deleteAttendance(selectedAttendance.value.id)

  closeDeleteModal()

  if (wasDeleted) {
    showToast(
      'success',
      'Data berhasil dihapus',
      `Data absensi ${employeeName} telah dihapus.`,
    )
  } else {
    showToast(
      'danger',
      'Gagal menghapus data',
      'Data absensi tidak ditemukan atau sudah dihapus.',
    )
  }
}

watch(
  () => route.query.success,
  (success) => {
    if (typeof success !== 'string' || !successMessages[success]) {
      return
    }

    showToast('success', 'Berhasil', successMessages[success])

    // Remove one-time feedback so refresh does not replay the toast.
    const query = { ...route.query }
    delete query.success
    router.replace({
      path: route.path,
      query,
      hash: route.hash,
    })
  },
  { immediate: true },
)
</script>

<template>
  <section>
    <!-- Page header and primary actions -->
    <div
      class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4"
    >
      <div>
        <p class="text-uppercase text-primary fw-semibold small mb-1">
          Manajemen Data
        </p>
        <h2 class="h3 fw-bold mb-1">Data Absensi</h2>
        <p class="text-secondary mb-0">Kelola data absensi karyawan.</p>
      </div>

      <div
        class="attendance-page-actions d-flex flex-column flex-sm-row gap-2"
      >
        <button
          class="btn btn-light border px-3"
          type="button"
          @click="openWorkScheduleModal"
        >
          <i class="bi bi-clock-history me-2"></i>
          Atur Jam Kerja
        </button>
        <RouterLink
          class="btn btn-primary px-3 page-primary-action"
          to="/attendance/create"
        >
          <i class="bi bi-plus-lg me-2"></i>
          Tambah Absensi
        </RouterLink>
      </div>
    </div>

    <!-- Filterable attendance table -->
    <div class="card content-card border-0">
      <div
        class="card-header bg-white border-bottom d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 p-4"
      >
        <div>
          <h3 class="h5 fw-semibold mb-1">Daftar Kehadiran</h3>
          <p class="text-secondary small mb-0">
            Cari, filter, dan urutkan data yang tersimpan di browser.
          </p>
          <p class="attendance-schedule-summary mb-0 mt-2">
            <i class="bi bi-clock me-1"></i>
            Jam kerja {{ workSchedule.startTime }}–{{ workSchedule.endTime }},
            toleransi {{ workSchedule.lateToleranceMinutes }} menit · Batas
            tepat waktu {{ lateThreshold }}
          </p>
        </div>
        <span class="badge rounded-pill text-bg-light border text-secondary">
          {{ filteredAttendances.length }} dari {{ attendances.length }} data
        </span>
      </div>

      <!-- Search, date, sort, and page-size controls -->
      <div class="attendance-toolbar border-bottom p-4">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-xl-4">
            <label for="attendanceSearch" class="form-label small fw-semibold">
              Pencarian
            </label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-secondary"></i>
              </span>
              <input
                id="attendanceSearch"
                v-model="searchQuery"
                class="form-control border-start-0 ps-0"
                type="search"
                placeholder="Cari nama, alamat, jenis kelamin, atau tanggal..."
              />
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-2">
            <label for="attendanceDateFilter" class="form-label small fw-semibold">
              Filter Tanggal
            </label>
            <input
              id="attendanceDateFilter"
              v-model="selectedDate"
              class="form-control"
              type="date"
            />
          </div>

          <div class="col-12 col-sm-6 col-xl-2">
            <label for="attendanceSort" class="form-label small fw-semibold">
              Urutkan
            </label>
            <select id="attendanceSort" v-model="sortBy" class="form-select">
              <option value="date-desc">Tanggal terbaru</option>
              <option value="date-asc">Tanggal terlama</option>
              <option value="name-asc">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="check-in-asc">Jam masuk paling awal</option>
              <option value="check-in-desc">Jam masuk paling akhir</option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-xl-2">
            <label for="attendancePerPage" class="form-label small fw-semibold">
              Data per halaman
            </label>
            <select
              id="attendancePerPage"
              v-model.number="itemsPerPage"
              class="form-select"
            >
              <option :value="5">5 data</option>
              <option :value="10">10 data</option>
              <option :value="15">15 data</option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-xl-2 d-grid">
            <button
              class="btn btn-light border"
              type="button"
              :disabled="!hasActiveFilters"
              @click="resetFilters"
            >
              <i class="bi bi-arrow-counterclockwise me-1"></i>
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      <AttendanceTable
        :records="paginatedAttendances"
        :start-number="startItem"
        :has-attendances="attendances.length > 0"
        :has-active-filters="hasActiveFilters"
        :work-schedule="workSchedule"
        @delete="handleDeleteRequest"
        @reset="resetFilters"
      />

      <div v-if="totalItems > 0" class="card-footer bg-white border-top p-4">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :start-item="startItem"
          :end-item="endItem"
          @update:current-page="goToPage"
        />
      </div>
    </div>
  </section>

  <!-- Page overlays -->
  <ConfirmDeleteModal
    :show="Boolean(selectedAttendance)"
    :item-name="selectedAttendance?.name || ''"
    @confirm="confirmDelete"
    @cancel="closeDeleteModal"
    @close="closeDeleteModal"
  />

  <WorkScheduleModal
    :show="showWorkScheduleModal"
    :schedule="workSchedule"
    @save="handleWorkScheduleSave"
    @reset="handleWorkScheduleReset"
    @close="closeWorkScheduleModal"
  />

  <ToastNotification
    :show="toast.show"
    :type="toast.type"
    :title="toast.title"
    :message="toast.message"
    @close="closeToast"
  />
</template>
