<script setup>
// Custom 24-hour picker combining radial selection with manual keyboard input.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Pilih jam',
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// Temporary picker state is committed only by Clear or Pilih.
const pickerRoot = ref(null)
const triggerButton = ref(null)
const minuteInput = ref(null)
const isOpen = ref(false)
const activeMode = ref('hour')
const selectedHour = ref('')
const selectedMinute = ref('')
const hasInputError = ref(false)

const hours = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0'),
)
const minutes = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, '0'),
)

// Hours use two rings; radial minutes intentionally stay on five-minute steps.
const hourOptions = hours.map((value, index) => ({
  value,
  angle: (index % 12) * 30,
  radius: index < 12 ? 98 : 64,
}))
const minuteOptions = minutes.map((value, index) => ({
  value,
  angle: index * 30,
  radius: 98,
}))

const displayValue = computed(() => props.modelValue || props.placeholder)
const temporaryValue = computed(
  () => `${selectedHour.value || '--'}:${selectedMinute.value || '--'}`,
)
const canConfirm = computed(
  () => /^\d{1,2}$/.test(selectedHour.value),
)
const activeOptions = computed(() =>
  activeMode.value === 'hour' ? hourOptions : minuteOptions,
)
const selectedOption = computed(() => {
  const selectedValue =
    activeMode.value === 'hour'
      ? selectedHour.value
      : selectedMinute.value

  if (!/^\d{1,2}$/.test(selectedValue)) {
    return undefined
  }

  return activeOptions.value.find(
    (option) => Number(option.value) === Number(selectedValue),
  )
})
const handStyle = computed(() => {
  if (!selectedOption.value) {
    return {}
  }

  return {
    '--clock-angle': `${selectedOption.value.angle}deg`,
    '--clock-radius': `${selectedOption.value.radius}px`,
  }
})
const errorId = computed(() => `${props.id}Error`)
const panelId = computed(() => `${props.id}Panel`)

function optionStyle(option) {
  return {
    '--clock-angle': `${option.angle}deg`,
    '--clock-radius': `${option.radius}px`,
  }
}

function sanitizeTimePart(value) {
  return String(value).replace(/\D/g, '').slice(0, 2)
}

function normalizeTimePart(value, maximum) {
  const sanitizedValue = sanitizeTimePart(value)

  if (!sanitizedValue) {
    return ''
  }

  return String(Math.min(Number(sanitizedValue), maximum)).padStart(2, '0')
}

function isOptionSelected(option) {
  const selectedValue =
    activeMode.value === 'hour'
      ? selectedHour.value
      : selectedMinute.value

  return (
    /^\d{1,2}$/.test(selectedValue) &&
    Number(option.value) === Number(selectedValue)
  )
}

function syncSelection() {
  // Manual minute values such as 17:03 remain valid even without a radial mark.
  const match = /^(\d{2}):(\d{2})$/.exec(props.modelValue)

  selectedHour.value = match && hours.includes(match[1]) ? match[1] : ''
  selectedMinute.value =
    match && /^([0-5]\d)$/.test(match[2]) ? match[2] : ''
  hasInputError.value = false
}

function openPicker() {
  syncSelection()
  activeMode.value = 'hour'
  isOpen.value = true
}

function closePicker({ restoreFocus = false } = {}) {
  isOpen.value = false

  if (restoreFocus) {
    nextTick(() => triggerButton.value?.focus())
  }
}

function selectHour(hour) {
  selectedHour.value = hour
  hasInputError.value = false
  activeMode.value = 'minute'
}

function selectMinute(minute) {
  selectedMinute.value = minute
  hasInputError.value = false
}

function handleHourInput(event) {
  // Sanitize immediately while deferring clamp and zero-padding until blur.
  const sanitizedValue = sanitizeTimePart(event.target.value)

  event.target.value = sanitizedValue
  selectedHour.value = sanitizedValue
  activeMode.value = 'hour'
  hasInputError.value = Boolean(selectedMinute.value && !sanitizedValue)
}

function handleMinuteInput(event) {
  const sanitizedValue = sanitizeTimePart(event.target.value)

  event.target.value = sanitizedValue
  selectedMinute.value = sanitizedValue
  activeMode.value = 'minute'
  hasInputError.value = Boolean(sanitizedValue && !selectedHour.value)
}

function normalizeHour() {
  selectedHour.value = normalizeTimePart(selectedHour.value, 23)
}

function normalizeMinute() {
  selectedMinute.value = normalizeTimePart(selectedMinute.value, 59)
}

function focusMinuteInput() {
  normalizeHour()
  activeMode.value = 'minute'
  nextTick(() => minuteInput.value?.focus())
}

function clearSelection() {
  // Clear is an immediate committed action, unlike Batal.
  selectedHour.value = ''
  selectedMinute.value = ''
  hasInputError.value = false
  emit('update:modelValue', '')
  closePicker({ restoreFocus: true })
}

function confirmSelection() {
  // A missing minute defaults to 00; a missing hour cannot be committed.
  const normalizedHour = normalizeTimePart(selectedHour.value, 23)

  if (!normalizedHour) {
    hasInputError.value = true
    return
  }

  const normalizedMinute =
    normalizeTimePart(selectedMinute.value, 59) || '00'

  selectedHour.value = normalizedHour
  selectedMinute.value = normalizedMinute
  hasInputError.value = false
  emit('update:modelValue', `${normalizedHour}:${normalizedMinute}`)
  closePicker({ restoreFocus: true })
}

function handleDocumentPointerDown(event) {
  // Desktop drop-up closes when focus moves outside the picker.
  if (isOpen.value && !pickerRoot.value?.contains(event.target)) {
    closePicker()
  }
}

function handleDocumentKeydown(event) {
  if (isOpen.value && event.key === 'Escape') {
    event.preventDefault()
    closePicker({ restoreFocus: true })
  }
}

watch(
  () => props.modelValue,
  () => {
    if (!isOpen.value) {
      syncSelection()
    }
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <div ref="pickerRoot" class="time-picker">
    <!-- Form-facing trigger -->
    <button
      :id="id"
      ref="triggerButton"
      class="form-control time-picker-trigger"
      :class="{
        'is-invalid': invalid,
        'time-picker-placeholder': !modelValue,
      }"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      :aria-invalid="invalid"
      :aria-describedby="error ? errorId : undefined"
      @click="isOpen ? closePicker() : openPicker()"
    >
      <span>{{ displayValue }}</span>
      <i class="bi bi-clock text-secondary" aria-hidden="true"></i>
    </button>

    <!-- Backdrop is visible only for the mobile modal presentation. -->
    <div
      v-if="isOpen"
      class="time-picker-mobile-backdrop"
      aria-hidden="true"
      @click="closePicker()"
    ></div>

    <!-- Picker panel: drop-up on desktop, centered modal on mobile. -->
    <div
      v-if="isOpen"
      :id="panelId"
      class="time-picker-panel"
      role="dialog"
      aria-modal="false"
      :aria-label="`Pilih waktu untuk ${id}`"
    >
      <div class="time-picker-header">
        <small>Gunakan picker atau ketik waktu secara manual</small>
        <div class="time-picker-display" aria-live="polite">
          <input
            class="time-picker-display-segment"
            :class="{
              active: activeMode === 'hour',
              invalid: hasInputError && !selectedHour,
            }"
            :value="selectedHour"
            type="text"
            inputmode="numeric"
            maxlength="2"
            placeholder="--"
            aria-label="Masukkan jam"
            :aria-invalid="hasInputError && !selectedHour"
            @focus="activeMode = 'hour'"
            @input="handleHourInput"
            @blur="normalizeHour"
            @keydown.enter.prevent="focusMinuteInput"
          />
          <span>:</span>
          <input
            ref="minuteInput"
            class="time-picker-display-segment"
            :class="{ active: activeMode === 'minute' }"
            :value="selectedMinute"
            type="text"
            inputmode="numeric"
            maxlength="2"
            placeholder="--"
            aria-label="Masukkan menit"
            @focus="activeMode = 'minute'"
            @input="handleMinuteInput"
            @blur="normalizeMinute"
            @keydown.enter.prevent="confirmSelection"
          />
        </div>
        <span class="time-picker-mode-label">
          {{ activeMode === 'hour' ? 'Pilih Jam' : 'Pilih Menit' }}
        </span>
        <span
          v-if="hasInputError"
          class="time-picker-inline-error"
          role="alert"
        >
          Masukkan jam terlebih dahulu.
        </span>
      </div>

      <!-- Radial clock face -->
      <div class="time-picker-clock">
        <span
          v-if="selectedOption"
          class="time-picker-hand"
          :style="handStyle"
        ></span>
        <span class="time-picker-center-dot"></span>

        <button
          v-for="option in activeOptions"
          :key="`${activeMode}-${option.value}`"
          class="time-picker-number"
          :class="{
            active: isOptionSelected(option),
            'time-picker-number-inner':
              activeMode === 'hour' && option.radius < 100,
          }"
          :style="optionStyle(option)"
          type="button"
          :aria-label="
            activeMode === 'hour'
              ? `Pilih jam ${option.value}`
              : `Pilih menit ${option.value}`
          "
          :aria-pressed="isOptionSelected(option)"
          @click="
            activeMode === 'hour'
              ? selectHour(option.value)
              : selectMinute(option.value)
          "
        >
          {{ option.value }}
        </button>
      </div>

      <!-- Clear commits empty, Batal discards, and Pilih commits temporary time. -->
      <div class="time-picker-actions">
        <button
          class="btn btn-sm btn-link text-secondary text-decoration-none"
          type="button"
          @click="clearSelection"
        >
          Clear
        </button>
        <div class="d-flex gap-2">
          <button
            class="btn btn-sm btn-light border"
            type="button"
            @click="closePicker({ restoreFocus: true })"
          >
            Batal
          </button>
          <button
            class="btn btn-sm btn-primary"
            type="button"
            :disabled="!canConfirm"
            @click="confirmSelection"
          >
            Pilih
          </button>
        </div>
      </div>

      <span class="visually-hidden">Waktu sementara {{ temporaryValue }}</span>
    </div>

    <div v-if="error" :id="errorId" class="invalid-feedback d-block" role="alert">
      {{ error }}
    </div>
  </div>
</template>
