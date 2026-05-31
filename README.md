# e-TrashHub

e-TrashHub adalah platform pengelolaan sampah terpadu yang menjembatani rumah tangga, pengepul/driver, TPS3R, mitra industri (B2B), dan pemerintah daerah, di bawah pengawasan langsung sistem verifikasi terpusat oleh Super Admin.

## 🚀 Fitur Utama
- **Katalog Publik**: Cek harga sampah terkini.
- **Request Pickup**: Pesan jemputan sampah rumah tangga secara praktis.
- **Real-time Tracking**: Pelacakan posisi supir (driver) secara real-time.
- **Sistem Poin**: Dapatkan poin dari hasil penimbangan sampah yang dapat ditukar.
- **Manajemen TPS3R**: Manajemen stok, sortasi, dan publikasi komoditas sampah.
- **Dashboard Super Admin**: Pusat verifikasi dan pengelolaan seluruh entitas.

## 🛠️ Teknologi yang Digunakan
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Framer Motion, React Leaflet, Recharts.
- **Backend**: Node.js, Express, Prisma ORM, JWT Authentication.

## 📦 Panduan Instalasi dan Menjalankan Proyek

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/alvhayen/E-TrashHub.git
   cd E-TrashHub
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Buat file `.env` di folder root serta di backend/frontend jika diperlukan, dengan merujuk ke file `.env.example`.
   Isikan variabel yang dibutuhkan seperti `DATABASE_URL` untuk Prisma dan *secret key* untuk JWT.

4. **Jalankan Prisma Generate:**
   Jika postinstall tidak berjalan otomatis, eksekusi perintah:
   ```bash
   npm run postinstall
   ```

5. **Jalankan Aplikasi:**
   Untuk *development* (client & server secara bersamaan via tsx & vite):
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui http://localhost:3000

## 🔑 Daftar Akun Demo (Seed Data)
| Peran | Email | Kata Sandi | Status |
|-------|-------|------------|--------|
| Super Admin | `superadmin@etrashhub.id` | `superadmin123` | ACTIVE |
| Rumah Tangga | `sari@email.com` | `password123` | ACTIVE |
| Rumah Tangga | `budi.rt@email.com` | `password123` | ACTIVE |
| Driver Freelance | `driver.freelance@email.com` | `password123` | ACTIVE |
| Driver Mitra TPS3R | `driver.mitra@email.com` | `password123` | ACTIVE |
| Admin TPS3R | `admin.tps3r@email.com` | `password123` | ACTIVE |
| Admin TPS3R | `admin.tps3r2@email.com` | `password123` | ACTIVE |
| Admin TPS3R | `pending.tps3r@email.com` | `password123` | PENDING |
| Mitra Industri | `mitra@industri.com` | `password123` | ACTIVE |
| Pemda | `dinas@surabaya.go.id` | `password123` | ACTIVE |
| Pemda | `pending.pemda@email.com` | `password123` | PENDING |

## 🔄 User Flow Utama

1. **Rumah Tangga Flow**
   * Melihat **Katalog Publik** tanpa login untuk mengecek harga sampah saat ini.
   * Melakukan registrasi, kemudian memutar form pemesanan jemputan (*Request Pickup*) menggunakan kartu gambar visual.
   * Melacak perjalanan supir secara *real-time* hingga sampah ditimbang.
   * Mendapatkan poin berdasarkan berat dan jenis komoditas.

2. **Driver Mitra Flow**
   * Berbeda dengan Driver Freelance yang hanya menjemput dari nasabah (RT).
   * Driver Mitra memegang kapabilitas untuk melacak dan menjalankan **Ekspedisi**.
   * Memulai perjalanan ekspedisi antar-TPS3R atau ke Mitra Industri, memantau *manifest* muatan, dan menyelesaikan *dropping* di tujuan.

3. **Admin TPS3R Flow**
   * Mendaftar dan masuk ke **Antrian Verifikasi** (status PENDING).
   * Setelah diverifikasi, dapat memantau kedatangan **Penjemputan Masuk**.
   * Menimbang muatan sampah, lalu masuk ke **Manajemen Stok** untuk menyortir persediaan.
   * Membuka komoditas menjadi mode publik agar dilirik oleh Mitra Industri.
   * Menugaskan Driver Mitra untuk memulai Ekspedisi pengantaran skala tonase.

4. **Super Admin Flow**
   * Mengamankan integritas sistem di *dashboard* khusus level sistem.
   * Melihat antrian calon Admin TPS3R atau perwakilan Pemda.
   * Mengevaluasi data instansi, lalu menyetujui (**Approve**) atau menolak pendaftaran dengan **wajib menyertakan alasan** penolakan agar langsung terkirim ke *email* pendaftar.
