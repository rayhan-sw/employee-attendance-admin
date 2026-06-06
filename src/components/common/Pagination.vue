<script setup>
// Presentational pagination; page bounds remain controlled by the parent.
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  startItem: {
    type: Number,
    required: true,
  },
  endItem: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:currentPage'])
const pages = computed(() =>
  Array.from({ length: props.totalPages }, (_, index) => index + 1),
)

function changePage(page) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div
    v-if="totalItems > 0"
    class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
  >
    <p class="text-secondary small mb-0">
      Menampilkan {{ startItem }}-{{ endItem }} dari {{ totalItems }} data
    </p>

    <nav aria-label="Navigasi halaman data absensi">
      <ul class="pagination pagination-sm flex-wrap mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            type="button"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>
        </li>
        <li
          v-for="page in pages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button
            class="page-link"
            type="button"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </li>
        <li
          class="page-item"
          :class="{ disabled: currentPage === totalPages }"
        >
          <button
            class="page-link"
            type="button"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>
