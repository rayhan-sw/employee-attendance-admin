<script setup>
// Controlled confirmation modal; deletion remains owned by the parent view.
import { onBeforeUnmount, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Hapus Data Absensi',
  },
  message: {
    type: String,
    default: 'Apakah Anda yakin ingin menghapus data absensi ini?',
  },
  itemName: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Ya, Hapus',
  },
  cancelText: {
    type: String,
    default: 'Batal',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

function handleKeydown(event) {
  // Ignore Escape while a destructive action is already being processed.
  if (props.show && event.key === 'Escape' && !props.loading) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="show"
    class="confirm-modal-backdrop"
    role="presentation"
    @click.self="!loading && emit('close')"
  >
    <div
      class="confirm-modal-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmDeleteTitle"
      aria-describedby="confirmDeleteMessage"
    >
      <div class="card border-0 shadow-lg">
        <div
          class="card-header bg-white border-bottom d-flex align-items-center justify-content-between gap-3 p-4"
        >
          <div class="d-flex align-items-center gap-3">
            <span class="confirm-modal-icon">
              <i class="bi bi-trash3"></i>
            </span>
            <h2 id="confirmDeleteTitle" class="h5 fw-semibold mb-0">
              {{ title }}
            </h2>
          </div>
          <button
            class="btn-close"
            type="button"
            :disabled="loading"
            aria-label="Tutup modal"
            @click="emit('close')"
          ></button>
        </div>

        <div class="card-body p-4">
          <p id="confirmDeleteMessage" class="text-secondary mb-3">
            {{ message }}
          </p>
          <div v-if="itemName" class="delete-item-preview">
            <span class="delete-item-avatar">
              {{ itemName.charAt(0).toUpperCase() }}
            </span>
            <div>
              <small class="d-block text-secondary">Data karyawan</small>
              <strong>{{ itemName }}</strong>
            </div>
          </div>
        </div>

        <div
          class="card-footer bg-light border-top d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 p-3 px-4"
        >
          <button
            class="btn btn-light border px-4"
            type="button"
            :disabled="loading"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </button>
          <button
            class="btn btn-danger px-4"
            type="button"
            :disabled="loading"
            @click="emit('confirm')"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
              aria-hidden="true"
            ></span>
            <i v-else class="bi bi-trash3 me-2"></i>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
