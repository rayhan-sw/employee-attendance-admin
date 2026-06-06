<script setup>
// Responsive navigation that behaves as a fixed sidebar or mobile offcanvas.
import { Offcanvas } from 'bootstrap'
import { useRoute } from 'vue-router'

const route = useRoute()

function closeMobileSidebar() {
  // Desktop navigation stays open; only dismiss the Bootstrap offcanvas.
  if (!window.matchMedia('(max-width: 991.98px)').matches) {
    return
  }

  const sidebar = document.getElementById('adminSidebar')

  if (sidebar?.classList.contains('show')) {
    Offcanvas.getOrCreateInstance(sidebar).hide()
  }
}
</script>

<template>
  <aside
    id="adminSidebar"
    class="offcanvas-lg offcanvas-start admin-sidebar"
    tabindex="-1"
    aria-labelledby="adminSidebarLabel"
  >
    <!-- Brand -->
    <div class="offcanvas-header sidebar-brand">
      <RouterLink
        id="adminSidebarLabel"
        class="sidebar-brand-link text-decoration-none"
        to="/dashboard"
        @click="closeMobileSidebar"
      >
        <img
          class="sidebar-logo"
          src="/app-logo.png"
          alt="Logo Employee Attendance Admin"
        />
        <span class="sidebar-brand-subtitle">Attendance Admin</span>
      </RouterLink>

      <button
        type="button"
        class="btn-close d-lg-none"
        aria-label="Tutup menu"
        @click="closeMobileSidebar"
      ></button>
    </div>

    <div class="offcanvas-body d-flex flex-column p-3">
      <p class="sidebar-section-label">Menu Utama</p>

      <!-- Primary navigation -->
      <nav
        class="nav nav-pills flex-column gap-2 sidebar-navigation"
        aria-label="Navigasi utama"
      >
        <RouterLink
          class="nav-link sidebar-link"
          :class="{ active: route.name === 'dashboard' }"
          to="/dashboard"
          @click="closeMobileSidebar"
        >
          <i class="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </RouterLink>

        <RouterLink
          class="nav-link sidebar-link"
          :class="{
            active:
              route.name === 'attendance-list' || route.name === 'attendance-edit',
          }"
          to="/attendance"
          @click="closeMobileSidebar"
        >
          <i class="bi bi-table"></i>
          <span>Data Absensi</span>
        </RouterLink>

        <RouterLink
          class="nav-link sidebar-link"
          :class="{ active: route.name === 'attendance-create' }"
          to="/attendance/create"
          @click="closeMobileSidebar"
        >
          <i class="bi bi-person-plus-fill"></i>
          <span>Tambah Absensi</span>
        </RouterLink>
      </nav>

      <!-- Project credit -->
      <div class="sidebar-footer mt-auto">
        <span>Made with</span>
        <i class="bi bi-heart-fill" aria-hidden="true"></i>
        <span>by</span>
        <a
          class="sidebar-credit"
          href="https://rayhansw.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Rayhan
        </a>
      </div>
    </div>
  </aside>
</template>
