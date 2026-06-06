<script setup>
// Dashboard insight is derived on render and never persisted separately.
import { computed } from 'vue'
import EmptyState from '../components/common/EmptyState.vue'
import RecentAttendanceList from '../components/common/RecentAttendanceList.vue'
import StatCard from '../components/common/StatCard.vue'
import { useAttendance } from '../composables/useAttendance'
import { useWorkSchedule } from '../composables/useWorkSchedule'
import { getAttendanceAnalytics } from '../utils/attendanceAnalytics'
import { minutesToTime } from '../utils/attendanceStatus.js'

const { attendances } = useAttendance()
const { workSchedule, getLateThresholdMinutes } = useWorkSchedule()

const today = new Date()
const formattedToday = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(today)
// Any attendance or schedule change immediately recalculates every insight.
const analytics = computed(() =>
  getAttendanceAnalytics(attendances.value, today, workSchedule.value),
)
const lateThreshold = computed(() =>
  minutesToTime(getLateThresholdMinutes()),
)
const summaryCards = computed(() => [
  {
    title: 'Tingkat Ketepatan Waktu',
    value: `${analytics.value.punctualityRate}%`,
    icon: 'bi-check2-circle',
    variant: 'success',
    description: `${analytics.value.onTimeCount} dari ${analytics.value.validStatusCount} absensi tepat waktu`,
  },
  {
    title: 'Rata-rata Jam Masuk',
    value: analytics.value.averageCheckIn,
    icon: 'bi-clock-history',
    variant: 'primary',
    description: `${analytics.value.averageCheckInCount} data jam masuk valid`,
  },
  {
    title: 'Rata-rata Durasi Kerja',
    value: analytics.value.averageWorkDuration,
    icon: 'bi-hourglass-split',
    variant: 'info',
    description: `${analytics.value.averageWorkDurationCount} data durasi valid`,
  },
  {
    title: 'Total Keterlambatan',
    value: `${analytics.value.lateCount} data`,
    icon: 'bi-alarm',
    variant: 'warning',
    description: `${analytics.value.lateRate}% dari absensi valid`,
  },
])

function formatTrendDay(date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
  }).format(date)
}

function formatTrendDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}
</script>

<template>
  <section>
    <!-- Page header and quick actions -->
    <div
      class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4"
    >
      <div>
        <p class="text-uppercase text-primary fw-semibold small mb-1">
          Ringkasan
        </p>
        <h2 class="h3 fw-bold mb-1">Dashboard</h2>
        <p class="text-secondary mb-0">
          Insight kehadiran dan ketepatan waktu karyawan.
        </p>
        <p class="dashboard-schedule-note mb-0 mt-2">
          <i class="bi bi-clock-history me-1"></i>
          Status berdasarkan jam kerja {{ workSchedule.startTime }}–{{
            workSchedule.endTime
          }}, batas tepat waktu {{ lateThreshold }}.
        </p>
      </div>

      <div
        class="dashboard-actions d-flex flex-column flex-sm-row align-items-sm-center gap-2"
      >
        <span
          class="badge rounded-pill text-bg-light border text-secondary px-3 py-2 me-sm-1"
        >
          <i class="bi bi-calendar3 me-2"></i>
          {{ formattedToday }}
        </span>
        <RouterLink class="btn btn-light border px-3" to="/attendance">
          <i class="bi bi-table me-2"></i>
          Lihat Data Absensi
        </RouterLink>
        <RouterLink class="btn btn-primary px-3" to="/attendance/create">
          <i class="bi bi-plus-lg me-2"></i>
          Tambah Absensi
        </RouterLink>
      </div>
    </div>

    <!-- Primary analytics -->
    <div class="row g-3 g-xl-4 mb-4">
      <div
        v-for="card in summaryCards"
        :key="card.title"
        class="col-12 col-sm-6 col-xl-3"
      >
        <StatCard
          :title="card.title"
          :value="card.value"
          :icon="card.icon"
          :variant="card.variant"
          :description="card.description"
        />
      </div>
    </div>

    <!-- Empty dashboard -->
    <div
      v-if="analytics.totalAttendances === 0"
      class="card content-card border-0"
    >
      <div class="card-body p-4">
        <EmptyState
          icon="bi-bar-chart"
          title="Belum ada data absensi untuk dianalisis."
          message="Tambahkan data absensi pertama untuk mulai melihat insight dashboard."
          action-text="Tambah Absensi"
          action-to="/attendance/create"
          action-icon="bi-plus-lg"
        />
      </div>
    </div>

    <!-- Detailed insights -->
    <template v-else>
      <div class="row g-4 mb-4">
        <div class="col-12 col-xl-5">
          <div class="card content-card border-0 h-100">
            <div class="card-header bg-white border-bottom p-4">
              <h3 class="h5 fw-semibold mb-1">Ringkasan Hari Ini</h3>
              <p class="text-secondary small mb-0">
                Kehadiran pada {{ formattedToday }}.
              </p>
            </div>

            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-6">
                  <div class="dashboard-mini-stat">
                    <span class="dashboard-mini-stat-icon text-primary">
                      <i class="bi bi-people"></i>
                    </span>
                    <div>
                      <strong>{{ analytics.today.total }}</strong>
                      <span>Total hadir</span>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="dashboard-mini-stat">
                    <span class="dashboard-mini-stat-icon text-success">
                      <i class="bi bi-check2-circle"></i>
                    </span>
                    <div>
                      <strong>{{ analytics.today.onTime }}</strong>
                      <span>Tepat waktu</span>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="dashboard-mini-stat">
                    <span class="dashboard-mini-stat-icon text-warning">
                      <i class="bi bi-alarm"></i>
                    </span>
                    <div>
                      <strong>{{ analytics.today.late }}</strong>
                      <span>Terlambat</span>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="dashboard-mini-stat">
                    <span class="dashboard-mini-stat-icon text-info">
                      <i class="bi bi-clock"></i>
                    </span>
                    <div>
                      <strong>{{ analytics.today.averageCheckIn }}</strong>
                      <span>Rata-rata masuk</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="dashboard-insight mt-4">
                <span class="dashboard-insight-icon">
                  <i class="bi bi-database-check"></i>
                </span>
                <p class="small text-secondary mb-0">
                  {{ analytics.totalAttendances }} catatan absensi tersimpan dan
                  diperbarui otomatis dari LocalStorage.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-7">
          <div class="card content-card border-0 h-100">
            <div class="card-header bg-white border-bottom p-4">
              <h3 class="h5 fw-semibold mb-1">Tren Absensi 7 Hari Terakhir</h3>
              <p class="text-secondary small mb-0">
                Jumlah catatan kehadiran per hari.
              </p>
            </div>

            <div class="card-body p-4">
              <div class="attendance-trend">
                <div
                  v-for="item in analytics.trend"
                  :key="item.dateKey"
                  class="attendance-trend-item"
                  :title="`${formatTrendDate(item.date)}: ${item.count} data`"
                >
                  <span class="attendance-trend-count">{{ item.count }}</span>
                  <div class="attendance-trend-track">
                    <span
                      class="attendance-trend-bar"
                      :style="{
                        height: item.count
                          ? `${Math.max(item.percentage, 8)}%`
                          : '0%',
                      }"
                    ></span>
                  </div>
                  <strong>{{ formatTrendDay(item.date) }}</strong>
                  <small>{{ formatTrendDate(item.date) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-12 col-xl-4">
          <div class="card content-card border-0 h-100">
            <div class="card-header bg-white border-bottom p-4">
              <h3 class="h5 fw-semibold mb-1">
                Karyawan Terlambat Terbanyak
              </h3>
              <p class="text-secondary small mb-0">
                Maksimal lima karyawan berdasarkan catatan terlambat.
              </p>
            </div>

            <div
              v-if="analytics.topLateEmployees.length"
              class="list-group list-group-flush"
            >
              <div
                v-for="(employee, index) in analytics.topLateEmployees"
                :key="employee.name"
                class="list-group-item late-employee-item px-4 py-3"
              >
                <span class="late-employee-rank">{{ index + 1 }}</span>
                <div class="flex-grow-1 min-width-0">
                  <strong class="d-block text-truncate">
                    {{ employee.name }}
                  </strong>
                  <span class="text-secondary small">Catatan keterlambatan</span>
                </div>
                <span class="badge text-bg-warning">
                  {{ employee.count }} kali
                </span>
              </div>
            </div>

            <div v-else class="card-body p-4">
              <div class="dashboard-small-empty text-center py-4">
                <i class="bi bi-check-circle text-success"></i>
                <p class="text-secondary small mb-0 mt-2">
                  Belum ada catatan keterlambatan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-8">
          <RecentAttendanceList
            :records="analytics.recentAttendances"
            :work-schedule="workSchedule"
          />
        </div>
      </div>

      <div class="card content-card border-0">
        <div
          class="card-header bg-white border-bottom d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 p-4"
        >
          <div>
            <h3 class="h5 fw-semibold mb-1">Distribusi Gender</h3>
            <p class="text-secondary small mb-0">
              Insight pendukung dari seluruh catatan absensi.
            </p>
          </div>
          <span class="badge rounded-pill text-bg-light border text-secondary">
            {{ analytics.totalAttendances }} data
          </span>
        </div>

        <div class="card-body p-4">
          <div class="row g-4">
            <div class="col-12 col-md-6">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="gender-dot gender-dot-male"></span>
                  <span class="fw-semibold">Laki-laki</span>
                </div>
                <span class="text-secondary small">
                  {{ analytics.totalMale }} data /
                  {{ analytics.malePercentage }}%
                </span>
              </div>
              <div class="progress dashboard-progress">
                <div
                  class="progress-bar bg-primary"
                  :style="{ width: `${analytics.malePercentage}%` }"
                ></div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="gender-dot gender-dot-female"></span>
                  <span class="fw-semibold">Perempuan</span>
                </div>
                <span class="text-secondary small">
                  {{ analytics.totalFemale }} data /
                  {{ analytics.femalePercentage }}%
                </span>
              </div>
              <div class="progress dashboard-progress">
                <div
                  class="progress-bar bg-danger"
                  :style="{ width: `${analytics.femalePercentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
