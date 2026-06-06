<script setup>
// Reusable empty state with an optional route link or emitted action.
defineProps({
  icon: {
    type: String,
    default: 'bi-inbox',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
  actionTo: {
    type: String,
    default: '',
  },
  actionIcon: {
    type: String,
    default: '',
  },
  actionVariant: {
    type: String,
    default: 'primary',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="empty-state" :class="compact ? 'py-4' : 'py-5'">
    <span class="empty-state-icon">
      <i :class="`bi ${icon}`"></i>
    </span>
    <h3 class="h6 fw-semibold mt-3 mb-2">{{ title }}</h3>
    <p v-if="message" class="text-secondary small mb-3">{{ message }}</p>

    <RouterLink
      v-if="actionText && actionTo"
      class="btn btn-sm px-3"
      :class="`btn-${actionVariant}`"
      :to="actionTo"
    >
      <i v-if="actionIcon" :class="`bi ${actionIcon} me-1`"></i>
      {{ actionText }}
    </RouterLink>

    <button
      v-else-if="actionText"
      class="btn btn-sm px-3"
      :class="`btn-${actionVariant}`"
      type="button"
      @click="emit('action')"
    >
      <i v-if="actionIcon" :class="`bi ${actionIcon} me-1`"></i>
      {{ actionText }}
    </button>
  </div>
</template>
