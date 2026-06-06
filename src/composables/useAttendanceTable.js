// Table pipeline: shared records -> search -> date filter -> sort -> pagination.
import { computed, ref, watch } from 'vue'

export function useAttendanceTable(attendances) {
  const searchQuery = ref('')
  const selectedDate = ref('')
  const sortBy = ref('date-desc')
  const currentPage = ref(1)
  const itemsPerPage = ref(5)

  const searchedAttendances = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase('id-ID')

    if (!query) {
      return attendances.value
    }

    return attendances.value.filter((attendance) => {
      const searchableValues = [
        attendance.name,
        attendance.address,
        attendance.gender,
        attendance.attendanceDate,
      ]

      return searchableValues.some((value) =>
        String(value ?? '')
          .toLocaleLowerCase('id-ID')
          .includes(query),
      )
    })
  })

  const filteredAttendances = computed(() => {
    if (!selectedDate.value) {
      return searchedAttendances.value
    }

    return searchedAttendances.value.filter(
      (attendance) => attendance.attendanceDate === selectedDate.value,
    )
  })

  const sortedAttendances = computed(() => {
    // Sort a copy so LocalStorage order is never mutated by UI controls.
    const records = [...filteredAttendances.value]

    return records.sort((firstRecord, secondRecord) => {
      switch (sortBy.value) {
        case 'date-asc':
          return (
            firstRecord.attendanceDate.localeCompare(
              secondRecord.attendanceDate,
            ) ||
            (firstRecord.createdAt || '').localeCompare(
              secondRecord.createdAt || '',
            )
          )
        case 'name-asc':
          return firstRecord.name.localeCompare(secondRecord.name, 'id-ID', {
            sensitivity: 'base',
          })
        case 'name-desc':
          return secondRecord.name.localeCompare(firstRecord.name, 'id-ID', {
            sensitivity: 'base',
          })
        case 'check-in-asc':
          return firstRecord.checkIn.localeCompare(secondRecord.checkIn)
        case 'check-in-desc':
          return secondRecord.checkIn.localeCompare(firstRecord.checkIn)
        case 'date-desc':
        default:
          return (
            secondRecord.attendanceDate.localeCompare(
              firstRecord.attendanceDate,
            ) ||
            (secondRecord.createdAt || '').localeCompare(
              firstRecord.createdAt || '',
            )
          )
      }
    })
  })

  const totalItems = computed(() => sortedAttendances.value.length)
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)),
  )
  const startItem = computed(() =>
    totalItems.value === 0
      ? 0
      : (currentPage.value - 1) * itemsPerPage.value + 1,
  )
  const endItem = computed(() =>
    Math.min(currentPage.value * itemsPerPage.value, totalItems.value),
  )
  const paginatedAttendances = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value

    return sortedAttendances.value.slice(
      startIndex,
      startIndex + itemsPerPage.value,
    )
  })
  const hasActiveFilters = computed(
    () => Boolean(searchQuery.value.trim()) || Boolean(selectedDate.value),
  )

  function resetFilters() {
    searchQuery.value = ''
    selectedDate.value = ''
    currentPage.value = 1
  }

  function goToPage(page) {
    currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
  }

  watch(
    [searchQuery, selectedDate, sortBy, itemsPerPage],
    () => {
      // A changed result set always starts from its first page.
      currentPage.value = 1
    },
    { flush: 'sync' },
  )

  watch(
    totalPages,
    (pageCount) => {
      // Keep pagination valid after deleting the last item on a page.
      if (currentPage.value > pageCount) {
        currentPage.value = pageCount
      }
    },
    { flush: 'sync' },
  )

  return {
    searchQuery,
    selectedDate,
    sortBy,
    currentPage,
    itemsPerPage,
    filteredAttendances,
    sortedAttendances,
    paginatedAttendances,
    totalItems,
    totalPages,
    startItem,
    endItem,
    hasActiveFilters,
    resetFilters,
    goToPage,
  }
}
