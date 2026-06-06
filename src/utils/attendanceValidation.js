// Central validation for split identity, address, and attendance time fields.
export function validateAttendance(values) {
  const errors = {}
  // Legacy callers may still provide one flat name instead of nameDetail.
  const hasSplitName = Object.prototype.hasOwnProperty.call(values, 'firstName')
  const legacyName = values.name?.trim() || ''
  const [legacyFirstName = '', ...legacyLastNameParts] = legacyName
    ? legacyName.split(/\s+/)
    : []
  const firstName = hasSplitName
    ? values.firstName?.trim() || ''
    : legacyFirstName
  const lastName = hasSplitName
    ? values.lastName?.trim() || ''
    : legacyLastNameParts.join(' ')
  // Flat address remains a safe fallback for records created before the split.
  const addressStreet =
    values.addressStreet?.trim() || values.address?.trim() || ''
  const addressCity = values.addressCity?.trim() || ''
  const addressProvince = values.addressProvince?.trim() || ''
  const addressPostalCode = values.addressPostalCode?.trim() || ''

  if (!firstName) {
    errors.firstName = 'Nama depan wajib diisi.'
  } else if (firstName.length < 2) {
    errors.firstName = 'Nama depan minimal 2 karakter.'
  }

  if (lastName && lastName.length < 2) {
    errors.lastName = 'Nama belakang minimal 2 karakter jika diisi.'
  }

  if (!addressStreet) {
    errors.addressStreet = 'Nama jalan/detail alamat wajib diisi.'
  } else if (addressStreet.length < 5) {
    errors.addressStreet = 'Nama jalan/detail alamat minimal 5 karakter.'
  }

  if (!addressCity) {
    errors.addressCity = 'Kota wajib diisi.'
  }

  if (!addressProvince) {
    errors.addressProvince = 'Provinsi wajib diisi.'
  }

  if (!addressPostalCode) {
    errors.addressPostalCode = 'Kode pos wajib diisi.'
  } else if (!/^\d{5,}$/.test(addressPostalCode)) {
    errors.addressPostalCode = 'Kode pos harus berupa angka minimal 5 digit.'
  }

  if (!values.gender) {
    errors.gender = 'Jenis kelamin wajib dipilih.'
  }

  if (!values.attendanceDate) {
    errors.attendanceDate = 'Tanggal absen wajib diisi.'
  }

  if (!values.checkIn) {
    errors.checkIn = 'Jam masuk wajib diisi.'
  }

  // HH:mm strings are lexically ordered, so this catches negative durations.
  if (!values.checkOut) {
    errors.checkOut = 'Jam keluar wajib diisi.'
  } else if (values.checkIn && values.checkOut < values.checkIn) {
    errors.checkOut = 'Jam keluar tidak boleh lebih awal dari jam masuk.'
  }

  return errors
}
