# 🔧 Prompt Perbaikan Full — e-TrashHub
## Berdasarkan audit kode aktual di repository

> Kirim ke AI Agent (Claude Sonnet/Opus di Antigravity) sebagai satu prompt.
> Agent harus membaca file yang disebutkan dulu sebelum menulis kode.

---

## KONTEKS & TEMUAN AUDIT

Setelah audit menyeluruh terhadap seluruh kodebase, ditemukan masalah-masalah berikut
yang menyebabkan banyak error backend dan halaman 404 di frontend. Perbaiki semua
masalah ini secara menyeluruh dan sistematis.

---

## MASALAH 1 — TYPE MISMATCH: ID integer vs string di Expedition controller

**File:** `backend/src/controllers/expedition.controller.js`

**Masalah:** Schema Prisma menggunakan `Int @id @default(autoincrement())` untuk semua
model termasuk `Expedition`, tapi seluruh fungsi di expedition controller mencari
dengan `{ where: { id } }` menggunakan string dari `req.params.id` tanpa parsing.
Ini menyebabkan Prisma error "Expected Int, got String" di setiap endpoint expedition.

**Perbaikan:** Tambahkan `parseInt()` di semua operasi expedition yang menggunakan
`req.params.id`. Hal yang sama juga berlaku untuk `driverId`, `destinationId`,
`inventoryId` yang dikirim dari request body — semua harus diparse ke integer.

Juga di `superadmin.controller.js`: `verificationQueue` menggunakan id integer tapi
controller melakukan `findUnique({ where: { id } })` dengan string.

**Fix semua file berikut:**
- `backend/src/controllers/expedition.controller.js` — parseInt pada semua id params dan body
- `backend/src/controllers/superadmin.controller.js` — parseInt pada semua id params
- `backend/src/controllers/inventory.controller.js` — sudah ada parseInt tapi periksa konsistensinya

---

## MASALAH 2 — ROLE CASE MISMATCH antara routes dan middleware

**File:** `backend/src/routes/pickup.routes.js`, `expedition.routes.js`, `superadmin.routes.js`

**Masalah kritis:** Ada inkonsistensi huruf besar/kecil antara role di routes dan
role yang di-inject oleh mock middleware:

- `pickup.routes.js` menggunakan: `authorizeRole('rumah_tangga')`, `authorizeRole('driver')`,
  `authorizeRole('admin_tps3r')`, `authorizeRole('pemda')` → **huruf kecil dengan underscore**
- `expedition.routes.js` menggunakan: `authorizeRole('DRIVER')`, `authorizeRole('ADMIN_TPS3R')` → **HURUF BESAR**
- `superadmin.routes.js` menggunakan: `authorizeRole('SUPER_ADMIN')` → **HURUF BESAR**
- Mock middleware di `auth.js` meng-inject: `role: 'RUMAH_TANGGA'`, `role: 'DRIVER'` → **HURUF BESAR**
- `AuthContext.tsx` menyimpan: `role: 'rumah_tangga' as Role` → **huruf kecil**
- `types/index.ts` mendefinisikan Role sebagai: `'rumah_tangga' | 'driver' | ...` → **huruf kecil**

Akibatnya semua `authorizeRole` check di pickup routes selalu GAGAL karena
role yang masuk 'RUMAH_TANGGA' tidak cocok dengan check 'rumah_tangga'.
Tapi karena middleware sedang di-bypass, ini tidak terdeteksi sekarang —
namun akan langsung meledak saat auth di-restore.

**Perbaikan standarisasi SEMUA ke HURUF BESAR:**

1. `backend/src/routes/pickup.routes.js` — ganti semua role string ke uppercase:
   `'RUMAH_TANGGA'`, `'DRIVER'`, `'ADMIN_TPS3R'`, `'PEMDA'`

2. `backend/src/routes/inventory.routes.js` — ganti ke uppercase:
   `'MITRA_B2B'`, `'PEMDA'`, `'ADMIN_TPS3R'`

3. `backend/src/middleware/auth.js` — mock users sudah uppercase, pertahankan.

4. `src/types/index.ts` — update Role type ke uppercase:
   ```typescript
   export type Role = 'RUMAH_TANGGA' | 'DRIVER' | 'ADMIN_TPS3R' | 'MITRA_B2B' | 'PEMDA' | 'SUPER_ADMIN';
   ```

5. `src/context/AuthContext.tsx` — update semua mock user role casting ke uppercase.

6. Cari dan ganti semua perbandingan `user.role === 'rumah_tangga'` di frontend
   menjadi `user.role === 'RUMAH_TANGGA'` (dan seterusnya untuk semua role).
   Cek file: `DriverLayout.tsx`, `RoleSwitcher.tsx`, `Dashboard.tsx`, semua Layout files.

---

## MASALAH 3 — FIELD `estimatedWeight` TIPE DATA TIDAK KONSISTEN

**File:** `backend/src/controllers/pickup.controller.js`, `backend/prisma/schema.prisma`,
`backend/src/seed.js`

**Masalah:** 
- Schema Prisma mendefinisikan `estimatedWeight String` (string seperti "Ringan", "Sedang", "Berat")
- `createPickup` controller melakukan `parseFloat(estimatedWeight)` — ini akan menghasilkan `NaN`
  karena input dari frontend adalah string "Ringan"/"Sedang"/"Berat"
- `seed.js` mengisi `estimatedWeight` dengan angka float langsung, bukan string label

**Perbaikan di `pickup.controller.js`:**
```javascript
// createPickup — JANGAN parseFloat, simpan sebagai string label
data: {
  userId: req.user.id,
  wasteTypes: JSON.stringify(wasteTypes || []),
  estimatedWeight: estimatedWeight, // simpan "Ringan"/"Sedang"/"Berat" as-is
  address,
  note,
  status: 'PENDING'
}
```

**Perbaikan di `seed.js`:** Ganti nilai estimatedWeight yang numeric menjadi
string label yang valid: `"Ringan"`, `"Sedang"`, `"Berat"`.

---

## MASALAH 4 — FIELD `wasteTypes` TIDAK ADA DI SCHEMA (tapi dipakai di controller)

**File:** `backend/src/controllers/pickup.controller.js`, `backend/src/seed.js`

**Masalah:** Schema Prisma mendefinisikan `wasteTypes String?` sebagai legacy field
di `PickupRequest`, tapi model juga punya relasi `items PickupItem[]`. Controller
`createPickup` menulis ke `wasteTypes` (string JSON), tapi tidak membuat `PickupItem`.
Frontend `RequestPickup.tsx` mengirim `wasteTypes` sebagai array. Ini menyebabkan
data tersimpan di field legacy dan relasi `items` selalu kosong.

**Perbaikan di `createPickup`:** Ubah agar:
1. Pertahankan simpan ke `wasteTypes` (untuk backward compat dengan seed data lama)
2. Jika ada `wasteCategoryIds` atau bisa resolve category dari nama, buat juga PickupItem
3. Untuk sekarang: minimal pastikan `wasteTypes` tersimpan sebagai JSON string dengan benar
   dan response-nya sudah di-parse kembali ke array

**Perbaikan di `getHouseholdPickups` dan `getDriverPickups`:**
Tambahkan null check sebelum JSON.parse:
```javascript
wasteTypes: (() => {
  try { return JSON.parse(p.wasteTypes || '[]'); }
  catch { return p.wasteTypes ? [p.wasteTypes] : []; }
})()
```

---

## MASALAH 5 — `manifest` FIELD: JSON object vs JSON string

**File:** `backend/src/controllers/expedition.controller.js`

**Masalah:** Schema mendefinisikan `manifest String?` (SQLite tidak support JSON native),
tapi `createExpedition` menulis `manifest: { items: manifestItems }` sebagai object
langsung — ini akan crash di SQLite karena mengharapkan string.

**Perbaikan di `createExpedition`:**
```javascript
manifest: JSON.stringify({ items: manifestItems }),
```

**Perbaikan di semua `findMany`/`findUnique` yang return expedition:**
Parse manifest sebelum dikirim ke client:
```javascript
// Helper untuk parse expedition manifest
function parseExpedition(exp) {
  return {
    ...exp,
    manifest: (() => {
      try { return typeof exp.manifest === 'string' ? JSON.parse(exp.manifest) : exp.manifest; }
      catch { return null; }
    })()
  };
}
```
Terapkan helper ini di `getExpeditionsForDriver`, `getExpeditionById`, `getExpeditionsForAdmin`.

---

## MASALAH 6 — `environmentalImpact` FIELD: JSON string di SQLite

**File:** `backend/src/controllers/pickup.controller.js`

**Masalah:** `environmentalImpact String?` di schema tapi `verifyPickup` tidak mengisi
field ini sama sekali. Frontend `PickupDetail.tsx` kemungkinan mengharapkan data ini.

**Perbaikan di `verifyPickup`:** Tambahkan kalkulasi dan simpan sebagai JSON string:
```javascript
const environmentalImpact = JSON.stringify({
  co2Offset: (weightInfo * 2.5).toFixed(2),
  waterSaved: Math.round(weightInfo * 15),
  energySaved: Math.round(weightInfo * 5.8),
  treesEquivalent: (weightInfo / 10).toFixed(1)
});

// Tambahkan ke update data:
data: {
  actualWeight: weightInfo,
  status: 'COMPLETED',
  points: pointsEarned,
  environmentalImpact,
  note: note ? note : existingPickup.note
}
```

Di response yang mengembalikan pickup, parse environmentalImpact:
```javascript
const parsePickup = (p) => ({
  ...p,
  wasteTypes: (() => { try { return JSON.parse(p.wasteTypes || '[]'); } catch { return []; } })(),
  environmentalImpact: (() => { try { return p.environmentalImpact ? JSON.parse(p.environmentalImpact) : null; } catch { return null; } })()
});
```

---

## MASALAH 7 — SEED DATA: WasteCategory BELUM ADA tapi dipakai di public endpoint

**File:** `backend/src/seed.js`

**Masalah:** `seed.js` tidak membuat record `WasteCategory` sama sekali, tapi
`GET /api/public/waste-categories` query ke tabel ini. Hasilnya selalu return
array kosong, menyebabkan `RequestPickup.tsx` fallback ke hardcoded data
dan gambar tidak muncul di katalog publik.

**Perbaikan:** Tambahkan seed WasteCategory di awal fungsi `main()` sebelum
membuat user, karena PickupItem memerlukan wasteCategoryId:

```javascript
// Seed WasteCategory
const wasteCategories = [
  {
    name: 'Botol Plastik',
    slug: 'botol-plastik',
    imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
    priceEstMin: 1500, priceEstMax: 3000,
    description: 'Botol plastik bekas minuman (PET/HDPE). Bersihkan dari sisa cairan sebelum dikumpulkan.',
    sortingTips: 'Lepas tutup botol, pipihkan agar hemat tempat, pisahkan dari plastik jenis lain.',
    sortOrder: 1
  },
  {
    name: 'Gelas Plastik',
    slug: 'gelas-plastik',
    imageUrl: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=400&q=80',
    priceEstMin: 1000, priceEstMax: 2000,
    description: 'Gelas plastik bekas minuman cup. Kumpulkan dalam jumlah banyak karena ringan.',
    sortingTips: 'Cuci bersih, susun bertumpuk agar tidak memakan banyak ruang.',
    sortOrder: 2
  },
  {
    name: 'Kertas & Kardus',
    slug: 'kertas-kardus',
    imageUrl: 'https://images.unsplash.com/photo-1588515724527-074a7a56616c?w=400&q=80',
    priceEstMin: 1200, priceEstMax: 2500,
    description: 'Kertas koran, majalah, kardus bekas packaging. Hindari yang basah atau berminyak.',
    sortingTips: 'Lipat kardus agar pipih, ikat dengan tali, jauhkan dari air.',
    sortOrder: 3
  },
  {
    name: 'Logam & Kaleng',
    slug: 'logam-kaleng',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    priceEstMin: 3000, priceEstMax: 12000,
    description: 'Kaleng aluminium, besi tua, tembaga. Nilai jual tinggi terutama aluminium.',
    sortingTips: 'Pisahkan jenis logam (aluminium vs besi). Bersihkan dari sisa makanan/minuman.',
    sortOrder: 4
  },
  {
    name: 'Tutup Botol',
    slug: 'tutup-botol',
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
    priceEstMin: 500, priceEstMax: 1500,
    description: 'Tutup botol plastik dari berbagai jenis minuman. Dikumpulkan terpisah dari botolnya.',
    sortingTips: 'Kumpulkan dalam wadah terpisah. Tidak perlu dicuci, cukup dikeringkan.',
    sortOrder: 5
  },
  {
    name: 'Kain & Tekstil',
    slug: 'kain-tekstil',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80',
    priceEstMin: 800, priceEstMax: 2000,
    description: 'Pakaian bekas, kain perca, tekstil sisa produksi. Bisa untuk upcycling atau daur ulang.',
    sortingTips: 'Pisahkan yang masih layak pakai untuk donasi. Yang sudah rusak untuk daur ulang.',
    sortOrder: 6
  }
];

for (const cat of wasteCategories) {
  await prisma.wasteCategory.upsert({
    where: { slug: cat.slug },
    update: {},
    create: cat
  });
  console.log(`Created waste category: ${cat.name}`);
}
```

Juga tambahkan seed untuk Super Admin yang belum ada:
```javascript
await prisma.user.upsert({
  where: { email: 'superadmin@etrashhub.id' },
  update: {},
  create: {
    email: 'superadmin@etrashhub.id',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    password: passwordHash,
    verificationStatus: 'ACTIVE'
  }
});
```

---

## MASALAH 8 — FRONTEND: HALAMAN 404 karena route tidak terdaftar

**File:** `src/App.tsx`

**Masalah:** Beberapa halaman yang di-import dan digunakan di navigasi tidak punya
route yang terdaftar di `App.tsx`:

1. `/admin/faq` — `AdminFAQ` di-import tapi tidak ada `<Route path="faq">` di admin routes
2. `/mitra/faq` — `MitraFAQ` di-import tapi tidak ada route
3. `/pemda/faq` — `PemdaFAQ` di-import tapi tidak ada route
4. `/admin/inventory` — `AdminDashboard.tsx` navigates ke `/admin/inventory` tapi
   route yang ada adalah `/admin/stock` (pakai `StockManager`, bukan `InventoryManager`)
5. `/superadmin/users` — tidak ada route terdaftar
6. `/superadmin/settings` — tidak ada route terdaftar (dan halamannya belum ada)

**Perbaikan di `src/App.tsx`:** Tambahkan route yang missing:

```tsx
// Dalam <Route path="/admin" element={<AdminLayout />}>:
<Route path="faq" element={<AdminFAQ />} />
<Route path="inventory" element={<Navigate to="stock" replace />} /> {/* redirect lama ke baru */}

// Dalam <Route path="/mitra" element={<MitraLayout />}>:
<Route path="faq" element={<MitraFAQ />} />

// Dalam <Route path="/pemda" element={<PemdaLayout />}>:
<Route path="faq" element={<PemdaFAQ />} />

// Dalam <Route path="/superadmin" element={<SuperAdminLayout />}>:
<Route path="users" element={<VerificationQueue />} /> {/* gunakan komponen yang ada dulu */}
<Route path="settings" element={<SuperAdminOverview />} /> {/* placeholder */}
```

---

## MASALAH 9 — FRONTEND: `user.id` TYPE MISMATCH (string vs number)

**File:** `src/context/AuthContext.tsx`, `src/types/index.ts`

**Masalah:** 
- `types/index.ts` mendefinisikan `User.id` sebagai `number`
- `AuthContext.tsx` mock users menggunakan `id: 1`, `id: 2` (number) — OK
- Tapi `auth.routes.js` di backend mengembalikan mock user dengan `id: 'mock-rt-001'` (string!)
- Ini akan menyebabkan mismatch ketika frontend menerima data dari API /auth/me
  dan mencoba mencocokkan dengan user.id untuk filter data

**Perbaikan di `backend/src/routes/auth.routes.js`:**
Ubah mock user id ke integer yang cocok dengan seed data:
```javascript
const mockUsers = {
  RUMAH_TANGGA: { id: 1, name: 'Sari Dewi', ... },
  DRIVER:       { id: 2, name: 'Budi Santoso', ... },
  ADMIN_TPS3R:  { id: 3, name: 'Admin TPS3R', ... },
  MITRA_B2B:    { id: 4, name: 'Mitra Industri', ... },
  PEMDA:        { id: 5, name: 'Dinas Surabaya', ... },
  SUPER_ADMIN:  { id: 6, name: 'Super Admin', ... },
};
```

---

## MASALAH 10 — BACKEND: Dua server berjalan bersamaan (port conflict)

**File:** `server.ts` (root), `backend/src/server.js`

**Masalah kritis:** Ada DUA server file:
1. `server.ts` di root — dijalankan oleh `npm run dev` (via tsx), berjalan di port 3000,
   sudah include Vite sebagai middleware, mount backend routes dari `./backend/src/routes/`
2. `backend/src/server.js` — server Express terpisah port 5000

`server.ts` sudah mengimpor dari `backend/src/routes/*.js` dan serve Vite sekaligus.
`backend/src/server.js` adalah server standalone yang tidak perlu dijalankan secara terpisah.

Frontend `vite.config.js` di folder `frontend/` proxy ke port 5000, tapi Vite
sudah berjalan sebagai middleware di port 3000 melalui `server.ts`.

Ada juga folder `frontend/` yang punya `package.json` dan `vite.config.js` tersendiri —
ini adalah artefak dari setup lama yang sekarang tidak digunakan karena `vite.config.ts`
di root sudah menangani frontend.

**Perbaikan:**
1. `server.ts` di root adalah SATU-SATUNYA entry point. Jangan jalankan `backend/src/server.js`
   secara terpisah. Ini sudah benar — tidak perlu diubah.
2. Tambahkan komentar di `backend/src/server.js`:
   ```javascript
   // CATATAN: File ini adalah server standalone untuk development terpisah.
   // Dalam setup monorepo ini, gunakan 'npm run dev' di root yang menjalankan server.ts.
   // Jangan jalankan file ini bersamaan dengan server.ts.
   ```
3. Folder `frontend/` dengan package.json terpisah tidak digunakan — biarkan saja,
   jangan hapus karena bisa ada dependensi yang dirujuk.

---

## MASALAH 11 — INVENTORY CONTROLLER: field `name` tidak ada di User model

**File:** `backend/src/controllers/inventory.controller.js`

**Masalah:** `getInventory` melakukan include:
```javascript
tps3r: { select: { name: true, address: true, phone: true } }
```
Tapi User model tidak punya field `address` yang benar untuk TPS3R
(field TPS3R address adalah `tpsAddress`, bukan `address`).

**Perbaikan:**
```javascript
tps3r: {
  select: {
    name: true,
    tpsName: true,    // nama TPS3R
    tpsAddress: true, // alamat TPS3R
    phone: true
  }
}
```

---

## MASALAH 12 — EXPEDITION CONTROLLER: `reviewedBy` type mismatch

**File:** `backend/src/controllers/superadmin.controller.js`

**Masalah:** `approveQueue` dan `rejectQueue` menyimpan:
```javascript
reviewedBy: req.user.id  // integer
```
Tapi schema mendefinisikan `reviewedBy String?` (untuk menyimpan nama atau ID sebagai string).

**Perbaikan:**
```javascript
reviewedBy: String(req.user.id)
```

---

## INSTRUKSI EKSEKUSI UNTUK AI AGENT

Lakukan perbaikan dalam urutan berikut:

**STEP 1 — Backend fixes (tidak memerlukan restart Vite):**
1. `backend/src/seed.js` — tambah WasteCategory + Super Admin + perbaiki estimatedWeight
2. `backend/src/controllers/expedition.controller.js` — parseInt semua id + JSON.stringify manifest
3. `backend/src/controllers/pickup.controller.js` — perbaiki estimatedWeight + environmentalImpact + JSON parse safety
4. `backend/src/controllers/superadmin.controller.js` — parseInt id + String(reviewedBy)
5. `backend/src/controllers/inventory.controller.js` — perbaiki field select tps3r
6. `backend/src/routes/pickup.routes.js` — uppercase role strings
7. `backend/src/routes/inventory.routes.js` — uppercase role strings
8. `backend/src/routes/auth.routes.js` — perbaiki mock user id ke integer

**STEP 2 — Frontend fixes:**
9. `src/types/index.ts` — uppercase Role type
10. `src/context/AuthContext.tsx` — uppercase role casting
11. `src/App.tsx` — tambahkan route yang missing (faq, inventory redirect, superadmin/users, superadmin/settings)
12. Cari semua perbandingan role lowercase di frontend dan uppercase-kan

**STEP 3 — Re-seed database:**
Setelah semua file diperbaiki, jalankan:
```bash
node backend/src/seed.js
```
Atau jika menggunakan Prisma:
```bash
npx prisma db push --schema=./backend/prisma/schema.prisma
node backend/src/seed.js
```

**STEP 4 — Verifikasi:**
Test endpoint-endpoint berikut di browser atau curl:
- `GET /api/health` → `{"status":"ok"}`
- `GET /api/public/waste-categories` → array 6 kategori dengan imageUrl
- `GET /api/pickup/household` (dengan header x-mock-role: RUMAH_TANGGA) → array pickups
- `GET /api/pickup/driver` (dengan header x-mock-role: DRIVER) → array pickups
- `GET /api/inventory/admin` (dengan header x-mock-role: ADMIN_TPS3R) → array inventory

Verifikasi halaman frontend:
- `/household/home` → tampil tanpa error
- `/driver/tasks` → tampil, ada data dari API
- `/admin/dashboard` → tampil dengan stat cards
- `/admin/faq` → tidak 404
- `/mitra/faq` → tidak 404
- `/pemda/faq` → tidak 404
- `/catalog` → tampil 6 kategori sampah dengan gambar dari Unsplash

---

## RINGKASAN MASALAH

| # | Masalah | File | Severity |
|---|---------|------|----------|
| 1 | parseInt missing di Expedition | expedition.controller.js | 🔴 Critical |
| 2 | Role case mismatch | routes + types + context | 🔴 Critical |
| 3 | estimatedWeight type conflict | pickup.controller.js + seed.js | 🔴 Critical |
| 4 | wasteTypes JSON parse unsafe | pickup.controller.js | 🟡 High |
| 5 | manifest JSON string di SQLite | expedition.controller.js | 🔴 Critical |
| 6 | environmentalImpact tidak diisi | pickup.controller.js | 🟡 High |
| 7 | WasteCategory tidak di-seed | seed.js | 🔴 Critical |
| 8 | Route 404 (faq, inventory, users) | App.tsx | 🔴 Critical |
| 9 | user.id string vs number | auth.routes.js | 🟡 High |
| 10 | Dua server file (dokumentasi) | backend/src/server.js | 🟢 Info |
| 11 | Wrong field select di inventory | inventory.controller.js | 🟡 High |
| 12 | reviewedBy type mismatch | superadmin.controller.js | 🟡 High |
