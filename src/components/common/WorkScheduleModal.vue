<script setup>
// Global work schedule editor backed by the parent composable.
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { timeToMinutes } from '../../utils/attendanceStatus.js'
import TimePicker from './TimePicker.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  schedule: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['save', 'reset', 'close'])
const hasSubmitted = ref(false)
const form = reactive({
  startTime: '',
  endTime: '',
  lateToleranceMinutes: 0,
})

const errors = computed(() => {
  // Schedule times must form one forward-moving workday.
  const validationErrors = {}
  const startTime = timeToMinutes(form.startTime)
  const endTime = timeToMinutes(form.endTime)
  const tolerance = form.lateToleranceMinutes

  if (startTime === null) {
    validationErrors.startTime = 'Jam masuk standar wajib diisi.'
  }

  if (endTime === null) {
    validationErrors.endTime = 'Jam pulang standar wajib diisi.'
  } else if (startTime !== null && endTime <= startTime) {
    validationErrors.endTime =
      'Jam pulang harus lebih akhir dari jam masuk.'
  }

  if (
    !Number.isInteger(tolerance) ||
    tolerance < 0 ||
    tolerance > 120
  ) {
    validationErrors.lateToleranceMinutes =
      'Toleransi harus berupa angka antara 0 sampai 120 menit.'
  }

  return validationErrors
})

function fieldError(field) {
  return hasSubmitted.value ? errors.value[field] : ''
}

function closeModal() {
  emit('close')
}

function submitSchedule() {
  hasSubmitted.value = true

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('save', {
    startTime: form.startTime,
    endTime: form.endTime,
    lateToleranceMinutes: form.lateToleranceMinutes,
  })
}

function resetSchedule() {
  hasSubmitted.value = false
  emit('reset')
}

function handleKeydown(event) {
  if (!props.show || event.key !== 'Escape') {
    return
  }

  // Let the nested TimePicker consume Escape before closing the parent modal.
  if (document.querySelector('.work-schedule-modal .time-picker-panel')) {
    return
  }

  closeModal()
}

watch(
  [() => props.show, () => props.schedule],
  ([show, schedule]) => {
    if (!show) {
      return
    }

    // Each open starts from the last persisted schedule.
    Object.assign(form, {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      lateToleranceMinutes: schedule.lateToleranceMinutes,
    })
    hasSubmitted.value = false
  },
  {
    immediate: true,
    deep: true,
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- Controlled modal keeps persistence and toast behavior in the list view. -->
  <div
    v-if="show"
    class="confirm-modal-backdrop work-schedule-modal"
    role="presentation"
    @click.self="closeModal"
  >
    <div
      class="confirm-modal-dialog work-schedule-modal-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workScheduleTitle"
      aria-describedby="workScheduleDescription"
    >
      <div class="card work-schedule-modal-card border-0 shadow-lg">
        <div
          class="card-header bg-white border-bottom d-flex align-items-center justify-content-between gap-3 p-4"
        >
          <div class="d-flex align-items-center gap-3">
            <span class="work-schedule-modal-icon">
              <i class="bi bi-clock-history"></i>
            </span>
            <div>
              <h2 id="workScheduleTitle" class="h5 fw-semibold mb-1">
                Pengaturan Jam Kerja
              </h2>
              <p
                id="workScheduleDescription"
                class="text-secondary small mb-0"
              >
                Atur batas ketepatan waktu untuk seluruh data absensi.
              </p>
            </div>
          </div>
          <button
            class="btn-close"
            type="button"
            aria-label="Tutup modal"
            @click="closeModal"
          ></button>
        </div>

        <form novalidate @submit.prevent="submitSchedule">
          <div class="card-body p-4">
            <div class="row g-4">
              <div class="col-12 col-md-6">
                <label for="workStartTime" class="form-label fw-semibold">
                  Jam Masuk Standar <span class="text-danger">*</span>
                </label>
                <TimePicker
                  id="workStartTime"
                  v-model="form.startTime"
                  placeholder="Pilih jam masuk"
                  :invalid="Boolean(fieldError('startTime'))"
                  :error="fieldError('startTime')"
                />
              </div>

              <div class="col-12 col-md-6">
                <label for="workEndTime" class="form-label fw-semibold">
                  Jam Pulang Standar <span class="text-danger">*</span>
                </label>
                <TimePicker
                  id="workEndTime"
                  v-model="form.endTime"
                  placeholder="Pilih jam pulang"
                  :invalid="Boolean(fieldError('endTime'))"
                  :error="fieldError('endTime')"
                />
              </div>

              <div class="col-12">
                <label
                  for="lateToleranceMinutes"
                  class="form-label fw-semibold"
                >
                  Toleransi Keterlambatan
                </label>
                <div class="input-group">
                  <input
                    id="lateToleranceMinutes"
                    v-model.number="form.lateToleranceMinutes"
                    class="form-control"
                    :class="{
                      'is-invalid': fieldError('lateToleranceMinutes'),
                    }"
                    type="number"
                    min="0"
                    max="120"
                    step="1"
                    inputmode="numeric"
                  />
                  <span class="input-group-text">menit</span>
                  <div class="invalid-feedback">
                    {{ fieldError('lateToleranceMinutes') }}
                  </div>
                </div>
                <p class="form-text mb-0">
                  Karyawan tetap dianggap tepat waktu sampai batas toleransi
                  berakhir.
                </p>
              </div>
            </div>
          </div>

          <div
            class="card-footer bg-light border-top d-flex flex-column-reverse flex-sm-row justify-content-between gap-2 p-3 px-4"
          >
            <button
              class="btn btn-light border"
              type="button"
              @click="resetSchedule"
            >
              <i class="bi bi-arrow-counterclockwise me-2"></i>
              Reset Default
            </button>

            <div class="d-flex flex-column-reverse flex-sm-row gap-2">
              <button
                class="btn btn-light border px-4"
                type="button"
                @click="closeModal"
              >
                Batal
              </button>
              <button class="btn btn-primary px-4" type="submit">
                <i class="bi bi-check2-circle me-2"></i>
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
