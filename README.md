# e-TrashHub (SIPSN-Bridge)

Selamat datang di repositori e-TrashHub, sebuah solusi *Executive Platform* untuk digitalisasi pengelolaan sampah dari hulu ke hilir. Proyek ini dibangun untuk kompetisi **Juara Vibe Coding**.

## 🏗️ Architecture

```ascii
[ Household ]       [ Driver ]       [ TPS3R Admin ]     [ Mitra B2B ]      [ Pemda ]
      |                 |                   |                   |               |
      v                 v                   v                   v               v
+-----------------------------------------------------------------------------------+
|                           Frontend (React 18 + Vite)                              |
+-----------------------------------------------------------------------------------+
                                        | (REST APIs)
+-----------------------------------------------------------------------------------+
|                        Backend (Node.js + Express)                                |
|                                                                                   |
|  [ Auth Auth ]   [ Pickup Engine ]   [ Inventory & B2B ]   [ Analytics Agg ]     |
+-----------------------------------------------------------------------------------+
                                        | (Prisma ORM)
                                        v
                            +-----------------------+
                            |    SQLite Database    |
                            +-----------------------+
```

## 🚀 Quick Start (Development)

Proyek ini telah dikonfigurasi sebagai *full-stack monorepo*. Cukup jalankan perintah berikut di root folder:

```bash
# 1. Install dependencies
npm install

# 2. Setup Database (Prisma)
npx prisma generate
npx prisma db push

# 3. Seed Mock Data
npx tsx backend/src/seed.ts

# 4. Run Development Server (Frontend + Backend in one command)
npm run dev
```

Aplikasi bisa diakses di **http://localhost:3000** 

## 🔐 Demo Accounts

Gunakan salah satu dari akun berikut untuk melihat dashboard masing-masing *role*:

| Role | Username (Email) | Password |
|---|---|---|
| **Rumah Tangga** | `budi@gmail.com` | `password` |
| **Driver / Pengepul** | `driver1@gmail.com` | `password` |
| **Admin TPS3R** | `tps3r_barat@admin.com` | `password` |
| **Mitra B2B/Industri** | `b2b@indofood.com` | `password` |
| **Pemda (Pemerintah)** | `pemda@surabaya.go.id` | `password` |

## 🌟 Feature List per Role

1. **Rumah Tangga**
   - *Pickup Request* material daur ulang
   - History & Tracking request realtime
   - Reward Point System
2. **Driver**
   - Dashboard penjemputan (*Task Queue*)
   - Perubahan status (ON_THE_WAY → COLLECTED)
3. **Admin TPS3R (Fasilitas)**
   - Penerimaan limbah (*Incoming*)
   - Input berat aktual (*Weighing*) & verifikasi poin nasabah
   - Manajemen Stock Inventory (Siap dijual B2B)
4. **Mitra B2B (Industri)**
   - Katalog e-Procurement dari berbagai TPS3R
   - WhatsApp auto-generated Inquiries
5. **Pemda (Pemerintah Daerah)**
   - SIPSN Executive Analytics
   - Real-time Volume & Kepatuhan Zona
   - Rekap Laporan Ekspor

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Node.js, Express, Prisma ORM, SQLite
- **Authentication:** JWT (JSON Web Tokens), bcrypt

---
*Created for **Juara Vibe Coding** using Google AI Studio Agentic Tools.*
