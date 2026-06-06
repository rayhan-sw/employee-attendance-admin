// Shared global schedule used by table status and dashboard analytics.
import { ref } from 'vue'
import {
  DEFAULT_WORK_SCHEDULE,
  getLateThresholdMinutes as calculateLateThresholdMinutes,
  normalizeWorkSchedule,
} from '../utils/attendanceStatus.js'

export const WORK_SCHEDULE_STORAGE_KEY = 'juru_work_schedule_settings'

// Module state keeps every consumer synchronized without a store library.
const workSchedule = ref({ ...DEFAULT_WORK_SCHEDULE })
let isInitialized = false

function canUseLocalStorage() {
  return typeof localStorage !== 'undefined'
}

export function useWorkSchedule() {
  // Normalize before persisting so malformed values never enter shared state.
  function persistWorkSchedule(schedule) {
    workSchedule.value = normalizeWorkSchedule(schedule)

    if (canUseLocalStorage()) {
      localStorage.setItem(
        WORK_SCHEDULE_STORAGE_KEY,
        JSON.stringify(workSchedule.value),
      )
    }

    return workSchedule.value
  }

  function loadWorkSchedule() {
    if (!canUseLocalStorage()) {
      workSchedule.value = { ...DEFAULT_WORK_SCHEDULE }
      isInitialized = true
      return workSchedule.value
    }

    const storedSchedule = localStorage.getItem(WORK_SCHEDULE_STORAGE_KEY)

    // A missing setting uses defaults without writing until the admin saves.
    if (storedSchedule === null) {
      workSchedule.value = { ...DEFAULT_WORK_SCHEDULE }
      isInitialized = true
      return workSchedule.value
    }

    try {
      workSchedule.value = normalizeWorkSchedule(JSON.parse(storedSchedule))
    } catch {
      workSchedule.value = { ...DEFAULT_WORK_SCHEDULE }
    }

    isInitialized = true
    return workSchedule.value
  }

  function saveWorkSchedule(payload) {
    return persistWorkSchedule(payload)
  }

  function resetWorkSchedule() {
    // Reset is persisted immediately so refresh keeps the default schedule.
    return persistWorkSchedule(DEFAULT_WORK_SCHEDULE)
  }

  function getLateThresholdMinutes() {
    return calculateLateThresholdMinutes(workSchedule.value)
  }

  if (!isInitialized) {
    loadWorkSchedule()
  }

  return {
    workSchedule,
    loadWorkSchedule,
    saveWorkSchedule,
    resetWorkSchedule,
    getLateThresholdMinutes,
  }
}
