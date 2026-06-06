<script setup>
// Page title follows route metadata while the admin profile remains static.
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'Admin Absensi')
</script>

<template>
  <header class="navbar admin-topbar bg-white border-bottom px-3 px-md-4">
    <!-- Mobile menu and current page -->
    <div class="d-flex align-items-center gap-3">
      <button
        class="btn btn-light border d-lg-none"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#adminSidebar"
        aria-controls="adminSidebar"
        aria-label="Buka menu"
      >
        <i class="bi bi-list fs-5"></i>
      </button>

      <div>
        <span class="text-secondary small">Admin Panel</span>
        <h1 class="h5 mb-0 fw-semibold">{{ pageTitle }}</h1>
      </div>
    </div>

    <!-- Admin profile -->
    <div class="d-flex align-items-center">
      <div class="d-flex align-items-center gap-2">
        <span class="avatar-placeholder">
          <i class="bi bi-person-fill"></i>
        </span>
        <div class="d-none d-md-block lh-sm">
          <strong class="d-block small">Admin Absensi</strong>
          <span class="text-secondary topbar-role">Frontend Demo</span>
        </div>
      </div>
    </div>
  </header>
</template>
