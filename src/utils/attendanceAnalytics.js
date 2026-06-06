// Pure dashboard calculations derived from attendance records and work schedule.
import {
  getAttendanceStatus,
  timeToMinutes,
} from './attendanceStatus.js'

function getLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getPercentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

function getAverage(values) {
  if (!values.length) {
    return null
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  )
}

export function formatClockMinutes(minutes) {
  if (minutes === null) {
    return '-'
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`
}

export function formatDurationMinutes(minutes) {
  if (minutes === null) {
    return '-'
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours} jam ${remainingMinutes} menit`
}

export function getAttendanceAnalytics(
  records = [],
  referenceDate = new Date(),
  workSchedule,
) {
  const safeRecords = Array.isArray(records) ? records : []
  const todayKey = getLocalDateKey(referenceDate)
  // Malformed records remain stored but do not affect punctuality insights.
  const statusRecords = safeRecords
    .map((record) => ({
      record,
      status: getAttendanceStatus(record, workSchedule),
    }))
    .filter(({ status }) => ['on-time', 'late'].includes(status.key))
  const onTimeRecords = statusRecords.filter(
    ({ status }) => status.key === 'on-time',
  )
  const lateRecords = statusRecords.filter(
    ({ status }) => status.key === 'late',
  )
  // Average check-in uses every independently valid check-in value.
  const checkInValues = safeRecords
    .map((record) => timeToMinutes(record.checkIn))
    .filter((minutes) => minutes !== null)
  // Incomplete or negative durations are excluded from the work average.
  const durationValues = safeRecords
    .map((record) => {
      const checkIn = timeToMinutes(record.checkIn)
      const checkOut = timeToMinutes(record.checkOut)

      if (checkIn === null || checkOut === null || checkOut < checkIn) {
        return null
      }

      return checkOut - checkIn
    })
    .filter((minutes) => minutes !== null)
  const todayRecords = safeRecords.filter(
    (record) => record.attendanceDate === todayKey,
  )
  const todayStatusRecords = statusRecords.filter(
    ({ record }) => record.attendanceDate === todayKey,
  )
  const todayCheckInValues = todayRecords
    .map((record) => timeToMinutes(record.checkIn))
    .filter((minutes) => minutes !== null)
  // Build a stable seven-day window ending on the supplied reference date.
  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(referenceDate)

    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))

    const dateKey = getLocalDateKey(date)

    return {
      dateKey,
      date,
      count: safeRecords.filter(
        (record) => record.attendanceDate === dateKey,
      ).length,
    }
  })
  const maximumTrendCount = Math.max(...trend.map((item) => item.count), 0)
  // Aggregate late records by display name before selecting the top five.
  const lateByEmployee = lateRecords.reduce((summary, { record }) => {
    const name = String(record.name || '').trim()

    if (name) {
      summary.set(name, (summary.get(name) || 0) + 1)
    }

    return summary
  }, new Map())
  const topLateEmployees = [...lateByEmployee.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(
      (firstEmployee, secondEmployee) =>
        secondEmployee.count - firstEmployee.count ||
        firstEmployee.name.localeCompare(secondEmployee.name, 'id-ID'),
    )
    .slice(0, 5)
  const totalMale = safeRecords.filter(
    (record) => record.gender === 'Laki-laki',
  ).length
  const totalFemale = safeRecords.filter(
    (record) => record.gender === 'Perempuan',
  ).length

  return {
    totalAttendances: safeRecords.length,
    validStatusCount: statusRecords.length,
    onTimeCount: onTimeRecords.length,
    punctualityRate: getPercentage(
      onTimeRecords.length,
      statusRecords.length,
    ),
    lateCount: lateRecords.length,
    lateRate: getPercentage(lateRecords.length, statusRecords.length),
    averageCheckIn: formatClockMinutes(getAverage(checkInValues)),
    averageCheckInCount: checkInValues.length,
    averageWorkDuration: formatDurationMinutes(getAverage(durationValues)),
    averageWorkDurationCount: durationValues.length,
    today: {
      total: todayRecords.length,
      onTime: todayStatusRecords.filter(
        ({ status }) => status.key === 'on-time',
      ).length,
      late: todayStatusRecords.filter(
        ({ status }) => status.key === 'late',
      ).length,
      averageCheckIn: formatClockMinutes(getAverage(todayCheckInValues)),
    },
    trend: trend.map((item) => ({
      ...item,
      percentage: maximumTrendCount
        ? Math.round((item.count / maximumTrendCount) * 100)
        : 0,
    })),
    topLateEmployees,
    totalMale,
    totalFemale,
    malePercentage: getPercentage(totalMale, safeRecords.length),
    femalePercentage: getPercentage(totalFemale, safeRecords.length),
    recentAttendances: statusRecords
      .map(({ record }) => record)
      .sort((firstRecord, secondRecord) => {
        const dateComparison = String(
          secondRecord.attendanceDate || '',
        ).localeCompare(String(firstRecord.attendanceDate || ''))

        if (dateComparison !== 0) {
          return dateComparison
        }

        return String(secondRecord.createdAt || '').localeCompare(
          String(firstRecord.createdAt || ''),
        )
      })
      .slice(0, 5),
  }
}
