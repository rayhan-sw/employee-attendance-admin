<script setup>
// Reusable dashboard metric card for numeric and formatted values.
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'primary',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <article class="card dashboard-card stat-card border-0 h-100">
    <div class="card-body p-4">
      <div class="d-flex align-items-start justify-content-between gap-3">
        <div>
          <p class="text-secondary small fw-medium mb-2">{{ title }}</p>
          <h3
            class="display-6 fw-bold mb-2"
            :class="{ 'stat-card-value-compact': String(value).length > 8 }"
          >
            {{ value }}
          </h3>
          <p v-if="description" class="text-secondary stat-card-description mb-0">
            {{ description }}
          </p>
        </div>

        <span :class="`stat-card-icon text-bg-${variant}`">
          <i :class="`bi ${icon}`"></i>
        </span>
      </div>
    </div>
  </article>
</template>
