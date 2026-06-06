<script setup>
// Reusable attendance form shared by create and edit routes.
import { computed, reactive, ref, watch } from 'vue'
import TimePicker from './TimePicker.vue'
import { validateAttendance } from '../../utils/attendanceValidation'

const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: 'Simpan Data',
  },
})

const emit = defineEmits(['submit', 'cancel'])

// Local form state mirrors the split fields shown in the UI.
const emptyValues = {
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

const form = reactive({ ...emptyValues })
const hasSubmitted = ref(false)
const errors = computed(() => validateAttendance(form))

function fieldError(field) {
  // Delay feedback until submit so an untouched form stays quiet.
  return hasSubmitted.value ? errors.value[field] : ''
}

// Keep normalized fields for editing while preserving the flat legacy fields.
function buildAddress() {
  const street = form.addressStreet.trim()
  const city = form.addressCity.trim()
  const province = form.addressProvince.trim()
  const postalCode = form.addressPostalCode.trim()

  return [street, city, `${province} ${postalCode}`.trim()]
    .filter(Boolean)
    .join(', ')
}

function buildName() {
  return [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ')
}

function handleSubmit() {
  hasSubmitted.value = true

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('submit', {
    name: buildName(),
    nameDetail: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    },
    address: buildAddress(),
    addressDetail: {
      street: form.addressStreet.trim(),
      city: form.addressCity.trim(),
      province: form.addressProvince.trim(),
      postalCode: form.addressPostalCode.trim(),
    },
    gender: form.gender,
    attendanceDate: form.attendanceDate,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
  })
}

watch(
  () => props.initialValues,
  (values) => {
    // Route changes and edit records can replace the form source in place.
    Object.assign(form, emptyValues, values)
    hasSubmitted.value = false
  },
  {
    immediate: true,
    deep: true,
  },
)
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <!-- Employee identity -->
    <div class="form-section">
      <div class="form-section-heading">
        <span class="form-section-icon">
          <i class="bi bi-person-vcard"></i>
        </span>
        <div>
          <h3 class="h6 fw-semibold mb-1">Informasi Karyawan</h3>
          <p class="text-secondary small mb-0">
            Lengkapi identitas dasar karyawan.
          </p>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-md-6 col-lg-5">
          <label for="employeeFirstName" class="form-label fw-semibold">
            Nama Depan <span class="text-danger">*</span>
          </label>
          <input
            id="employeeFirstName"
            v-model="form.firstName"
            class="form-control"
            :class="{ 'is-invalid': fieldError('firstName') }"
            type="text"
            autocomplete="given-name"
            placeholder="Masukkan nama depan"
          />
          <div class="invalid-feedback">{{ fieldError('firstName') }}</div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <label for="employeeLastName" class="form-label fw-semibold">
            Nama Belakang
          </label>
          <input
            id="employeeLastName"
            v-model="form.lastName"
            class="form-control"
            :class="{ 'is-invalid': fieldError('lastName') }"
            type="text"
            autocomplete="family-name"
            placeholder="Masukkan nama belakang"
          />
          <div class="invalid-feedback">{{ fieldError('lastName') }}</div>
        </div>

        <div class="col-12 col-lg-3">
          <label for="employeeGender" class="form-label fw-semibold">
            Jenis Kelamin <span class="text-danger">*</span>
          </label>
          <select
            id="employeeGender"
            v-model="form.gender"
            class="form-select"
            :class="{ 'is-invalid': fieldError('gender') }"
          >
            <option value="" disabled>Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          <div class="invalid-feedback">{{ fieldError('gender') }}</div>
        </div>

        <div class="col-12">
          <label for="addressStreet" class="form-label fw-semibold">
            Nama Jalan / Detail Alamat <span class="text-danger">*</span>
          </label>
          <textarea
            id="addressStreet"
            v-model="form.addressStreet"
            class="form-control"
            :class="{ 'is-invalid': fieldError('addressStreet') }"
            rows="3"
            placeholder="Contoh: Jl. Pemuda No. 10"
          ></textarea>
          <div class="invalid-feedback">
            {{ fieldError('addressStreet') }}
          </div>
        </div>

        <div class="col-12 col-md-4">
          <label for="addressCity" class="form-label fw-semibold">
            Kota <span class="text-danger">*</span>
          </label>
          <input
            id="addressCity"
            v-model="form.addressCity"
            class="form-control"
            :class="{ 'is-invalid': fieldError('addressCity') }"
            type="text"
            placeholder="Contoh: Semarang"
          />
          <div class="invalid-feedback">{{ fieldError('addressCity') }}</div>
        </div>

        <div class="col-12 col-md-4">
          <label for="addressProvince" class="form-label fw-semibold">
            Provinsi <span class="text-danger">*</span>
          </label>
          <input
            id="addressProvince"
            v-model="form.addressProvince"
            class="form-control"
            :class="{ 'is-invalid': fieldError('addressProvince') }"
            type="text"
            placeholder="Contoh: Jawa Tengah"
          />
          <div class="invalid-feedback">
            {{ fieldError('addressProvince') }}
          </div>
        </div>

        <div class="col-12 col-md-4">
          <label for="addressPostalCode" class="form-label fw-semibold">
            Kode Pos <span class="text-danger">*</span>
          </label>
          <input
            id="addressPostalCode"
            v-model="form.addressPostalCode"
            class="form-control"
            :class="{ 'is-invalid': fieldError('addressPostalCode') }"
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            placeholder="Contoh: 50132"
          />
          <div class="invalid-feedback">
            {{ fieldError('addressPostalCode') }}
          </div>
        </div>
      </div>
    </div>

    <hr class="form-divider" />

    <!-- Attendance date and times -->
    <div class="form-section">
      <div class="form-section-heading">
        <span class="form-section-icon">
          <i class="bi bi-calendar2-check"></i>
        </span>
        <div>
          <h3 class="h6 fw-semibold mb-1">Informasi Absensi</h3>
          <p class="text-secondary small mb-0">
            Tentukan tanggal dan waktu kehadiran.
          </p>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-md-4">
          <label for="attendanceDate" class="form-label fw-semibold">
            Tanggal Absen <span class="text-danger">*</span>
          </label>
          <input
            id="attendanceDate"
            v-model="form.attendanceDate"
            class="form-control"
            :class="{ 'is-invalid': fieldError('attendanceDate') }"
            type="date"
          />
          <div class="invalid-feedback">
            {{ fieldError('attendanceDate') }}
          </div>
        </div>

        <div class="col-12 col-md-4">
          <label for="checkInTime" class="form-label fw-semibold">
            Jam Masuk <span class="text-danger">*</span>
          </label>
          <TimePicker
            id="checkInTime"
            v-model="form.checkIn"
            placeholder="Pilih jam masuk"
            :invalid="Boolean(fieldError('checkIn'))"
            :error="fieldError('checkIn')"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="checkOutTime" class="form-label fw-semibold">
            Jam Keluar <span class="text-danger">*</span>
          </label>
          <TimePicker
            id="checkOutTime"
            v-model="form.checkOut"
            placeholder="Pilih jam keluar"
            :invalid="Boolean(fieldError('checkOut'))"
            :error="fieldError('checkOut')"
          />
        </div>
      </div>
    </div>

    <!-- Form actions -->
    <div
      class="form-actions d-flex flex-column-reverse flex-sm-row justify-content-end gap-2"
    >
      <button
        class="btn btn-light border px-4"
        type="button"
        @click="emit('cancel')"
      >
        Batal
      </button>
      <button class="btn btn-primary px-4" type="submit">
        <i :class="isEditMode ? 'bi bi-check2-circle' : 'bi bi-floppy'"></i>
        <span class="ms-2">{{ submitLabel }}</span>
      </button>
    </div>
  </form>
</template>
