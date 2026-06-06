# Employee Attendance Admin

## Ringkasan

Employee Attendance Admin adalah aplikasi web untuk mencatat, mengelola, dan
menganalisis data absensi karyawan. Aplikasi berjalan sepenuhnya di sisi
frontend dan menyimpan data di LocalStorage browser.

Project ini cocok digunakan sebagai demo, prototype, atau aplikasi admin
sederhana pada satu browser. Antarmuka dibangun dengan Bootstrap 5 dan custom
admin dashboard styling yang responsif.

## Tech Stack

- Vue 3
- Vite
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Vue Router
- LocalStorage

## Fitur

### Fitur Utama

- Dashboard absensi
- Daftar dan manajemen data absensi
- Tambah data absensi
- Edit data absensi
- Hapus data dengan modal konfirmasi
- Pencarian berdasarkan nama, alamat, jenis kelamin, atau tanggal
- Filter berdasarkan tanggal absensi
- Pengurutan berdasarkan tanggal, nama, dan jam masuk
- Pagination dengan pilihan 5, 10, atau 15 data per halaman
- Penyimpanan data menggunakan LocalStorage

### Fitur Pendukung

- Statistik dashboard berbasis data absensi
- Pengaturan jam kerja global dan toleransi keterlambatan
- Status Tepat Waktu, Terlambat, dan pengamanan untuk data waktu tidak valid
- Custom radial time picker 24 jam dengan dukungan input manual
- Input nama depan dan nama belakang
- Input alamat terpisah
- Toast notification untuk aksi tambah, edit, hapus, dan pengaturan jam kerja
- Empty state untuk data kosong dan hasil pencarian yang tidak ditemukan
- Layout admin responsif
- Sidebar dan topbar admin
- Data awal untuk menampilkan contoh penggunaan aplikasi

## Insight Dashboard

Dashboard mengolah data absensi menjadi beberapa insight:

- Tingkat ketepatan waktu
- Rata-rata jam masuk
- Rata-rata durasi kerja
- Total keterlambatan
- Ringkasan absensi hari ini
- Tren absensi tujuh hari terakhir
- Karyawan dengan catatan keterlambatan terbanyak
- Daftar absensi terbaru
- Distribusi gender sebagai insight pendukung

Seluruh insight dihitung langsung dari data absensi dan pengaturan jam kerja
yang aktif. Hasil perhitungan tidak disimpan sebagai data terpisah.

## Pengaturan Jam Kerja

Admin dapat mengatur:

- Jam masuk standar
- Jam pulang standar
- Toleransi keterlambatan dalam menit

Batas tepat waktu dihitung dari jam masuk standar ditambah toleransi
keterlambatan. Data dengan jam masuk setelah batas tersebut akan berstatus
Terlambat. Pengaturan jam kerja disimpan di LocalStorage dan berlaku untuk
status pada tabel, daftar absensi terbaru, serta analytics dashboard.

Pengaturan bawaan adalah `08:00` sampai `17:00` dengan toleransi `0` menit.

## Field Form Absensi

Form absensi menyediakan field berikut:

- Nama Depan
- Nama Belakang
- Nama Jalan / Detail Alamat
- Kota
- Provinsi
- Kode Pos
- Jenis Kelamin
- Tanggal Absen
- Jam Masuk
- Jam Keluar

Data utama tetap disimpan dalam bentuk:

```text
name
address
gender
attendanceDate
checkIn
checkOut
```

Setiap record juga memiliki `id`, `createdAt`, dan `updatedAt` untuk mendukung
operasi CRUD. Field `nameDetail` dan `addressDetail` menyimpan bagian form yang
sudah dipisahkan agar data mudah dimuat kembali saat diedit. Aplikasi tetap
dapat membaca record lama yang hanya memiliki `name` dan `address`.

## Validasi Form

- Nama depan wajib diisi dan minimal 2 karakter.
- Nama belakang bersifat opsional, tetapi minimal 2 karakter jika diisi.
- Nama jalan atau detail alamat wajib diisi dan minimal 5 karakter.
- Kota dan provinsi wajib diisi.
- Kode pos wajib berupa angka dengan minimal 5 digit.
- Jenis kelamin wajib dipilih.
- Tanggal absen wajib diisi.
- Jam masuk wajib diisi.
- Jam keluar wajib diisi.
- Jam keluar tidak boleh lebih awal dari jam masuk.

## Penyimpanan Data

Data disimpan pada LocalStorage browser menggunakan key berikut:

| Data | LocalStorage key |
|---|---|
| Record absensi | `juru_attendance_records` |
| Pengaturan jam kerja | `juru_work_schedule_settings` |

Data hanya tersedia pada browser dan perangkat yang digunakan. Menghapus
LocalStorage browser juga akan menghapus data aplikasi. Jika key record absensi
belum pernah dibuat, aplikasi mengisi data awal secara otomatis. Array kosong
yang valid tetap dipertahankan dan tidak diisi ulang.

Aplikasi tidak menggunakan backend atau database, sehingga tidak menyediakan
sinkronisasi data antarbrowser atau antarperangkat.

## Route Aplikasi

| Route | Deskripsi |
|---|---|
| `/` | Mengarahkan pengguna ke dashboard |
| `/dashboard` | Halaman dashboard dan insight absensi |
| `/attendance` | Halaman daftar dan manajemen data absensi |
| `/attendance/create` | Form tambah data absensi |
| `/attendance/:id/edit` | Form edit data absensi berdasarkan ID |

## Struktur Project

```text
public/
|-- app-logo.png
`-- favicon.svg

src/
|-- assets/
|-- components/
|   |-- common/
|   `-- layout/
|-- composables/
|-- data/
|-- layouts/
|-- router/
|-- utils/
|-- views/
|-- App.vue
`-- main.js
```

- `components/common`: komponen UI reusable seperti form, tabel, modal, toast,
  pagination, dan time picker.
- `components/layout`: sidebar dan topbar admin.
- `composables`: state dan logic reusable untuk data absensi, tabel, dan
  pengaturan jam kerja.
- `utils`: validasi, status absensi, analytics, generator ID, dan konstanta.
- `views`: halaman dashboard, daftar absensi, serta form tambah dan edit.
- `data`: seed data absensi awal.
- `router`: konfigurasi route aplikasi.
- `assets`: global styling untuk layout dan komponen.

## Cara Menjalankan Project

Pastikan Node.js dan npm sudah tersedia, lalu jalankan:

```bash
npm install
npm run dev
```

Development server akan menampilkan alamat lokal aplikasi di terminal.

Untuk membuat dan memeriksa production build:

```bash
npm run build
npm run preview
```

## Script yang Tersedia

| Command | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat production build |
| `npm run preview` | Menjalankan preview hasil build |

## Production Build

Hasil production build tersedia di folder `dist/`. Folder tersebut dapat
dideploy ke layanan static hosting seperti Netlify, Vercel, GitHub Pages, atau
Firebase Hosting.

## Catatan Penggunaan

- Aplikasi dirancang untuk kebutuhan frontend sederhana pada satu browser.
- Status absensi dihitung saat aplikasi berjalan dan tidak disimpan pada record.
- Perubahan pengaturan jam kerja akan menghitung ulang status serta insight
  dashboard secara otomatis.
- Data penting sebaiknya tidak hanya mengandalkan LocalStorage untuk penggunaan
  produksi.

## Batasan Project

- Belum menggunakan backend atau database.
- Data hanya tersimpan pada browser yang digunakan.
- Belum mendukung sinkronisasi multi-user.
- Belum tersedia autentikasi admin.
- Belum tersedia fitur export atau import data.

## Pengembangan Selanjutnya

Beberapa pengembangan yang dapat dipertimbangkan:

- Integrasi backend atau API
- Autentikasi admin
- Export data absensi
- Import data absensi
- Role-based access
- Automated testing

## Author

Made with ♥ by Rayhan  
[Rayhan](https://rayhansw.com)
