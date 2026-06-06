<script setup>
// Shared admin shell used by every routed page.
import Sidebar from '../components/layout/Sidebar.vue'
import Topbar from '../components/layout/Topbar.vue'
</script>

<template>
  <div class="admin-shell">
    <!-- Persistent navigation -->
    <Sidebar />

    <div class="admin-workspace">
      <Topbar />

      <!-- Active child route -->
      <main class="admin-content">
        <div class="container-fluid px-3 px-md-4 py-4">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
