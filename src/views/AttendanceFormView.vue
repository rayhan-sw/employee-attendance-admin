<script setup>
// Route-driven wrapper that shares one form between create and edit modes.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AttendanceForm from '../components/common/AttendanceForm.vue'
import EmptyState from '../components/common/EmptyState.vue'
import { useAttendance } from '../composables/useAttendance'

const route = useRoute()
const router = useRouter()
const { getAttendanceById, addAttendance, updateAttendance } = useAttendance()

const emptyFormValues = {
  firstName: '',
  lastName: '',
  addressStreet: '',
  addressCity: '',
  addressProvince: '',
  addressPostalCode: '',
  gender: '',
  attendanceDate: '',
  checkIn: '',
  checkOut: '',
}

const attendanceId = computed(() =>
  route.params.id ? String(route.params.id) : '',
)
const isEditMode = computed(() => Boolean(attendanceId.value))
const attendanceRecord = computed(() =>
  isEditMode.value ? getAttendanceById(attendanceId.value) : null,
)
const isRecordMissing = computed(
  () => isEditMode.value && !attendanceRecord.value,
)

// Existing records may predate split name and address fields.
const initialValues = computed(() => {
  if (!attendanceRecord.value) {
    return emptyFormValues
  }

  const addressDetail =
    attendanceRecord.value.addressDetail &&
    typeof attendanceRecord.value.addressDetail === 'object'
      ? attendanceRecord.value.addressDetail
      : {}
  const rawName = String(attendanceRecord.value.name || '').trim()
  const [legacyFirstName = '', ...legacyLastNameParts] = rawName
    ? rawName.split(/\s+/)
    : []
  const nameDetail =
    attendanceRecord.value.nameDetail &&
    typeof attendanceRecord.value.nameDetail === 'object'
      ? attendanceRecord.value.nameDetail
      : {}

  return {
    firstName: nameDetail.firstName ?? legacyFirstName,
    lastName: nameDetail.lastName ?? legacyLastNameParts.join(' '),
    addressStreet:
      addressDetail.street || attendanceRecord.value.address || '',
    addressCity: addressDetail.city || '',
    addressProvince: addressDetail.province || '',
    addressPostalCode: addressDetail.postalCode || '',
    gender: attendanceRecord.value.gender,
    attendanceDate: attendanceRecord.value.attendanceDate,
    checkIn: attendanceRecord.value.checkIn,
    checkOut: attendanceRecord.value.checkOut,
  }
})

function returnToAttendanceList() {
  router.push('/attendance')
}

function handleSubmit(payload) {
  // The composable owns timestamps and persistence; this view owns navigation.
  let success

  if (isEditMode.value) {
    const updatedRecord = updateAttendance(attendanceId.value, payload)

    if (!updatedRecord) {
      return
    }

    success = 'updated'
  } else {
    addAttendance(payload)
    success = 'created'
  }

  router.push({
    path: '/attendance',
    query: { success },
  })
}
</script>

<template>
  <section>
    <!-- Page header -->
    <div
      class="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4"
    >
      <div>
        <p class="text-uppercase text-primary fw-semibold small mb-1">
          Form Absensi
        </p>
        <h2 class="h3 fw-bold mb-1">
          {{ isEditMode ? 'Edit Data Absensi' : 'Tambah Data Absensi' }}
        </h2>
        <p class="text-secondary mb-0">
          {{
            isEditMode
              ? 'Perbarui informasi kehadiran karyawan.'
              : 'Lengkapi informasi kehadiran karyawan.'
          }}
        </p>
      </div>

      <button
        class="btn btn-light border px-3 page-secondary-action"
        type="button"
        @click="returnToAttendanceList"
      >
        <i class="bi bi-arrow-left me-2"></i>
        Kembali ke Data Absensi
      </button>
    </div>

    <!-- Invalid edit route -->
    <div v-if="isRecordMissing" class="card content-card border-0">
      <div class="card-body p-4">
        <EmptyState
          icon="bi-exclamation-triangle"
          title="Data absensi tidak ditemukan."
          message="Data mungkin telah dihapus atau ID pada alamat halaman tidak valid."
          action-text="Kembali ke Data Absensi"
          action-to="/attendance"
          action-icon="bi-arrow-left"
        />
      </div>
    </div>

    <!-- Shared create/edit form -->
    <div v-else class="card content-card attendance-form-card border-0">
      <div class="card-header bg-white border-bottom p-4">
        <div class="d-flex align-items-center gap-3">
          <span class="form-header-icon">
            <i
              :class="
                isEditMode ? 'bi bi-pencil-square' : 'bi bi-person-plus-fill'
              "
            ></i>
          </span>
          <div>
            <h3 class="h5 fw-semibold mb-1">
              {{ isEditMode ? 'Perbarui Data Absensi' : 'Data Absensi Baru' }}
            </h3>
            <p class="text-secondary small mb-0">
              Field bertanda <span class="text-danger">*</span> wajib diisi.
            </p>
          </div>
        </div>
      </div>

      <div class="card-body p-4">
        <AttendanceForm
          :initial-values="initialValues"
          :is-edit-mode="isEditMode"
          :submit-label="isEditMode ? 'Update Data' : 'Simpan Data'"
          @submit="handleSubmit"
          @cancel="returnToAttendanceList"
        />
      </div>
    </div>
  </section>
</template>
