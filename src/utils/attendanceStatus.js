// Attendance status is derived at render time and never stored on a record.
export const DEFAULT_WORK_SCHEDULE = Object.freeze({
  startTime: '08:00',
  endTime: '17:00',
  lateToleranceMinutes: 0,
})

const STATUS_CONFIG = {
  onTime: {
    key: 'on-time',
    label: 'Tepat Waktu',
    badgeClass: 'text-bg-success',
    description: 'Masuk sesuai jam kerja',
  },
  late: {
    key: 'late',
    label: 'Terlambat',
    badgeClass: 'text-bg-warning',
    description: 'Masuk melewati jam kerja',
  },
  invalidTime: {
    key: 'invalid',
    label: 'Invalid',
    badgeClass: 'text-bg-danger',
    description: 'Jam masuk atau jam keluar tidak valid',
  },
  invalidOrder: {
    key: 'invalid',
    label: 'Invalid',
    badgeClass: 'text-bg-danger',
    description: 'Jam keluar lebih awal dari jam masuk',
  },
}

export function timeToMinutes(time) {
  if (typeof time !== 'string') {
    return null
  }

  const match = /^(\d{2}):(\d{2})$/.exec(time)

  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) {
    return null
  }

  return hours * 60 + minutes
}

export function minutesToTime(minutes) {
  if (!Number.isInteger(minutes) || minutes < 0) {
    return ''
  }

  const safeMinutes = Math.min(minutes, 23 * 60 + 59)
  const hours = Math.floor(safeMinutes / 60)
  const remainingMinutes = safeMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`
}

export function isValidWorkSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') {
    return false
  }

  const startTime = timeToMinutes(schedule.startTime)
  const endTime = timeToMinutes(schedule.endTime)
  const tolerance = schedule.lateToleranceMinutes

  return (
    startTime !== null &&
    endTime !== null &&
    endTime > startTime &&
    typeof tolerance === 'number' &&
    Number.isInteger(tolerance) &&
    tolerance >= 0 &&
    tolerance <= 120
  )
}

export function normalizeWorkSchedule(schedule) {
  // Invalid persisted settings safely fall back to the application default.
  if (!isValidWorkSchedule(schedule)) {
    return { ...DEFAULT_WORK_SCHEDULE }
  }

  return {
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    lateToleranceMinutes: schedule.lateToleranceMinutes,
  }
}

export function getLateThresholdMinutes(schedule = DEFAULT_WORK_SCHEDULE) {
  const normalizedSchedule = normalizeWorkSchedule(schedule)
  const startTimeMinutes = timeToMinutes(normalizedSchedule.startTime)

  // Tolerance extends the latest on-time check-in beyond the start time.
  return Math.min(
    startTimeMinutes + normalizedSchedule.lateToleranceMinutes,
    23 * 60 + 59,
  )
}

export function isCheckOutBeforeCheckIn(checkIn, checkOut) {
  const checkInMinutes = timeToMinutes(checkIn)
  const checkOutMinutes = timeToMinutes(checkOut)

  if (checkInMinutes === null || checkOutMinutes === null) {
    return false
  }

  return checkOutMinutes < checkInMinutes
}

export function getAttendanceStatus(
  record = {},
  workSchedule = DEFAULT_WORK_SCHEDULE,
) {
  const checkInMinutes = timeToMinutes(record.checkIn)
  const checkOutMinutes = timeToMinutes(record.checkOut)

  if (checkInMinutes === null || checkOutMinutes === null) {
    return { ...STATUS_CONFIG.invalidTime }
  }

  if (isCheckOutBeforeCheckIn(record.checkIn, record.checkOut)) {
    return { ...STATUS_CONFIG.invalidOrder }
  }

  // Supplying no schedule remains backward-compatible with the 08:00 default.
  if (checkInMinutes <= getLateThresholdMinutes(workSchedule)) {
    return { ...STATUS_CONFIG.onTime }
  }

  return { ...STATUS_CONFIG.late }
}
