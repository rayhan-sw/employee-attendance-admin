<script setup>
// Lightweight action feedback with a resettable auto-close timer.
import { computed, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) =>
      ['success', 'danger', 'warning', 'info'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 4000,
  },
})

const emit = defineEmits(['close'])
let closeTimer

const iconClass = computed(
  () =>
    ({
      success: 'bi-check-circle-fill',
      danger: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill',
    })[props.type],
)

function clearCloseTimer() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = undefined
  }
}

watch(
  [() => props.show, () => props.message],
  ([show]) => {
    // Restart the timer when consecutive actions reuse the same toast.
    clearCloseTimer()

    if (show && props.duration > 0 && typeof window !== 'undefined') {
      closeTimer = window.setTimeout(() => emit('close'), props.duration)
    }
  },
  { immediate: true },
)

onBeforeUnmount(clearCloseTimer)
</script>

<template>
  <Transition name="toast-slide">
    <div
      v-if="show"
      class="admin-toast"
      :class="`admin-toast-${type}`"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="admin-toast-icon" :class="`text-${type}`">
        <i :class="`bi ${iconClass}`"></i>
      </span>
      <div class="flex-grow-1">
        <strong v-if="title" class="d-block mb-1">{{ title }}</strong>
        <p class="text-secondary small mb-0">{{ message }}</p>
      </div>
      <button
        class="btn-close"
        type="button"
        aria-label="Tutup notifikasi"
        @click="emit('close')"
      ></button>
    </div>
  </Transition>
</template>
