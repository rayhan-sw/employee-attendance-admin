// Shared attendance repository for every view in this frontend-only app.
import { ref } from 'vue'
import { attendanceSeed } from '../data/attendanceSeed'
import { generateId } from '../utils/idGenerator'
import { ATTENDANCE_STORAGE_KEY } from '../utils/storageKey'

const attendances = ref([])
let isInitialized = false

function canUseLocalStorage() {
  return typeof localStorage !== 'undefined'
}

function cloneSeedData() {
  // Avoid sharing mutable seed objects with runtime state.
  return attendanceSeed.map((attendance) => ({ ...attendance }))
}

export function useAttendance() {
  // Update reactive consumers and browser persistence through one path.
  function saveAttendances(records) {
    attendances.value = records

    if (canUseLocalStorage()) {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records))
    }

    return attendances.value
  }

  function seedInitialData() {
    isInitialized = true
    return saveAttendances(cloneSeedData())
  }

  function loadAttendances() {
    if (!canUseLocalStorage()) {
      if (!isInitialized) {
        attendances.value = cloneSeedData()
      }

      isInitialized = true
      return attendances.value
    }

    const storedRecords = localStorage.getItem(ATTENDANCE_STORAGE_KEY)

    // Seed only when the key has never existed; a valid empty array stays empty.
    if (storedRecords === null) {
      isInitialized = true
      return seedInitialData()
    }

    try {
      const parsedRecords = JSON.parse(storedRecords)

      if (!Array.isArray(parsedRecords)) {
        return seedInitialData()
      }

      attendances.value = parsedRecords
    } catch {
      return seedInitialData()
    }

    isInitialized = true
    return attendances.value
  }

  function getAttendances() {
    return attendances.value
  }

  function getAttendanceById(id) {
    return attendances.value.find((attendance) => attendance.id === id)
  }

  function addAttendance(payload) {
    const timestamp = new Date().toISOString()
    const newAttendance = {
      ...payload,
      id: generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    saveAttendances([...attendances.value, newAttendance])
    return newAttendance
  }

  function updateAttendance(id, payload) {
    const attendanceIndex = attendances.value.findIndex(
      (attendance) => attendance.id === id,
    )

    if (attendanceIndex === -1) {
      return null
    }

    const currentAttendance = attendances.value[attendanceIndex]
    const updatedAttendance = {
      ...currentAttendance,
      ...payload,
      id: currentAttendance.id,
      // Preserve creation history while marking the latest edit.
      createdAt: currentAttendance.createdAt,
      updatedAt: new Date().toISOString(),
    }
    const updatedRecords = [...attendances.value]

    updatedRecords[attendanceIndex] = updatedAttendance
    saveAttendances(updatedRecords)

    return updatedAttendance
  }

  function deleteAttendance(id) {
    const recordsAfterDelete = attendances.value.filter(
      (attendance) => attendance.id !== id,
    )

    if (recordsAfterDelete.length === attendances.value.length) {
      return false
    }

    saveAttendances(recordsAfterDelete)
    return true
  }

  // The first consumer initializes the singleton state for all later consumers.
  if (!isInitialized) {
    loadAttendances()
  }

  return {
    attendances,
    loadAttendances,
    getAttendances,
    getAttendanceById,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    seedInitialData,
    saveAttendances,
  }
}
