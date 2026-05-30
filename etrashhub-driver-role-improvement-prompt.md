# 🚛 Prompt Peningkatan Role Driver/Volunteer — e-TrashHub
## Evaluasi Mendalam + Implementasi Lengkap untuk AI Agent (Antigravity)

> **Kirim prompt ini ke AI Agent di Antigravity sebagai satu kesatuan.**
> Agent wajib baca file existing terlebih dahulu — JANGAN membuat ulang dari nol.
> Modifikasi bersifat additive dan non-breaking terhadap kode yang sudah ada.

---

## 📋 RINGKASAN EVALUASI (Baca Dahulu Sebelum Mengerjakan)

Setelah audit menyeluruh terhadap role driver di e-TrashHub, ditemukan **7 masalah kritis** yang membuat role ini belum siap digunakan secara nyata:

### ❌ Masalah yang Ditemukan

| # | Masalah | Lokasi | Dampak |
|---|---------|--------|--------|
| 1 | **Tidak ada Accept/Reject task** — driver langsung "jemput" tanpa konfirmasi dahulu | `pickup.controller.js`, `TaskDashboard.tsx` | Driver tidak punya kendali; bisa overlap, salah zonasi |
| 2 | **Status `COLLECTED` tidak punya aksi lanjutan** — button mati setelah sampah diambil, driver tidak tahu harus ke mana | `TaskDashboard.tsx` baris status COLLECTED | Driver bingung, UX buntu |
| 3 | **Tidak ada pengecekan duplikasi** — dua driver bisa klik "Jemput Sekarang" pada task yang sama secara bersamaan | `updateStatus()` di `pickup.controller.js` | Race condition, task di-claim dua driver |
| 4 | **Zonasi hardcoded** — "Zona: Balikpapan Barat" di header adalah teks statis, bukan data dari user | `TaskDashboard.tsx` baris 57 | Menyesatkan, tidak fungsional |
| 5 | **RouteOverview pakai koordinat mock** — `getMockCoordinate()` menghasilkan titik acak di sekitar Balikpapan, bukan alamat asli | `RouteOverview.tsx` | Navigasi tidak akurat sama sekali |
| 6 | **DriverProfile hardcoded** — kendaraan "Pickup Bak L300 (KT 1234 AB)" dan zona "Balikpapan Barat" adalah string statis | `DriverProfile.tsx` | Profil tidak mencerminkan data nyata |
| 7 | **Expedition hanya untuk MITRA_TPS3R** — Driver FREELANCE tidak punya alur kerja setelah COLLECTED, tidak ada bridge ke TPS3R | `ExpeditionList.tsx`, `expedition.controller.js` | Freelance driver tidak punya end-to-end flow |

### ✅ Yang Sudah Baik (Jangan Diubah)
- Struktur navigasi DriverLayout (Tugas → Rute → Ekspedisi → Selesai → Profil)
- Timeline visual di ExpeditionDetail
- Logic Expedition (ASSIGNED → ON_THE_WAY → ARRIVED → CONFIRMED)
- Manifest display di ExpeditionDetail
- Bonus poin claim mechanism
- CSS styling di Expedition.css (pertahankan semua class yang ada)

---

## 🏗️ ARSITEKTUR PERBAIKAN

### Flow Baru yang Diinginkan

```
DRIVER FREELANCE:
  Dashboard → Lihat task PENDING
    → [Terima Tugas] → status: ACCEPTED (driver terkunci ke task ini)
    → [Jemput Sekarang] → status: ON_THE_WAY
    → [Sampah Sudah Diambil] → status: COLLECTED
    → [Setor ke TPS3R] → pilih TPS3R terdekat → status: DELIVERED_TO_TPS3R
    → Selesai ✅

DRIVER MITRA_TPS3R:
  Dashboard → Lihat task PENDING
    → [Terima Tugas] → status: ACCEPTED
    → [Jemput Sekarang] → status: ON_THE_WAY
    → [Sampah Sudah Diambil] → status: COLLECTED
    → [Antar ke TPS3R] → otomatis trigger ekspedisi → status: DELIVERING
    → Ekspedisi selesai → status: COMPLETED ✅
```

---

## 📁 FILE YANG PERLU DIMODIFIKASI

### Daftar file yang wajib dibaca SEBELUM mengerjakan:
1. `backend/prisma/schema.prisma`
2. `backend/src/controllers/pickup.controller.js`
3. `backend/src/routes/pickup.routes.js`
4. `src/pages/driver/TaskDashboard.tsx`
5. `src/pages/driver/RouteOverview.tsx`
6. `src/pages/driver/DriverProfile.tsx`
7. `src/pages/driver/CompletedTasks.tsx`
8. `src/pages/driver/DriverLayout.tsx`
9. `src/App.tsx` (untuk tambah route baru)

---

## BAGIAN 1 — DATABASE SCHEMA

### FILE: `backend/prisma/schema.prisma`

**Aksi: TAMBAHKAN field baru pada model `PickupRequest` dan model `User`. Jangan hapus field lama.**

Pada model `PickupRequest`, tambahkan field berikut setelah baris `updatedAt`:

```prisma
  acceptedAt      DateTime?
  collectedAt     DateTime?
  deliveredAt     DateTime?
  tps3rTargetId   Int?       // FK ke User (role ADMIN_TPS3R) yang dituju driver
  cancelReason    String?    // alasan jika dibatalkan driver
```

Pada model `User`, tambahkan field berikut setelah baris `domicile`:

```prisma
  vehicleType     String?   // Jenis kendaraan, contoh: "Motor", "Pickup Bak"
  vehiclePlate    String?   // Plat nomor kendaraan
  isOnDuty        Boolean   @default(false)  // apakah sedang aktif bertugas
```

Setelah menambahkan field di schema, jalankan:
```bash
npx prisma migrate dev --name add_driver_workflow_fields
npx prisma generate
```

---

## BAGIAN 2 — BACKEND CONTROLLER

### FILE: `backend/src/controllers/pickup.controller.js`

**Aksi: TAMBAHKAN fungsi-fungsi baru di bawah fungsi `getDriverPickups` yang sudah ada. Jangan ubah fungsi existing.**

Tambahkan tepat setelah fungsi `getDriverPickups` (sebelum `updateStatus`):

```javascript
// PATCH /pickup/:id/accept — driver mengklaim/menerima task (atomic, mencegah race condition)
export const acceptPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickupId = parseInt(id);
    const driverId = req.user.id;

    // Atomic update: hanya berhasil jika status masih PENDING dan belum ada driver
    const pickup = await prisma.pickupRequest.updateMany({
      where: {
        id: pickupId,
        status: 'PENDING',
        driverId: null  // belum diklaim siapapun
      },
      data: {
        status: 'ACCEPTED',
        driverId: driverId,
        acceptedAt: new Date()
      }
    });

    // updateMany mengembalikan { count }, bukan objek pickup
    if (pickup.count === 0) {
      // Task sudah diklaim driver lain atau tidak ada
      return res.status(409).json({
        error: 'Task ini sudah diambil oleh driver lain atau tidak tersedia.',
        code: 'ALREADY_CLAIMED'
      });
    }

    const updatedPickup = await prisma.pickupRequest.findUnique({
      where: { id: pickupId },
      include: { user: { select: { name: true, phone: true, address: true } } }
    });

    res.json({ success: true, pickup: parsePickup(updatedPickup) });
  } catch (error) {
    console.error('acceptPickup error:', error);
    res.status(500).json({ error: 'Gagal menerima task' });
  }
};

// PATCH /pickup/:id/cancel-accept — driver membatalkan penerimaan (kembali ke PENDING)
export const cancelAcceptPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const pickupId = parseInt(id);

    const existing = await prisma.pickupRequest.findUnique({ where: { id: pickupId } });
    if (!existing) return res.status(404).json({ error: 'Pickup tidak ditemukan' });
    if (existing.driverId !== req.user.id) return res.status(403).json({ error: 'Bukan tugas Anda' });
    if (!['ACCEPTED'].includes(existing.status)) {
      return res.status(400).json({ error: 'Hanya task berstatus ACCEPTED yang bisa dibatalkan' });
    }

    const updated = await prisma.pickupRequest.update({
      where: { id: pickupId },
      data: {
        status: 'PENDING',
        driverId: null,
        acceptedAt: null,
        cancelReason: reason || 'Dibatalkan oleh driver'
      }
    });

    res.json({ success: true, pickup: parsePickup(updated) });
  } catch (error) {
    console.error('cancelAcceptPickup error:', error);
    res.status(500).json({ error: 'Gagal membatalkan penerimaan task' });
  }
};

// PATCH /pickup/:id/deliver — driver melapor telah menyetor ke TPS3R (khusus FREELANCE)
export const deliverToTPS3R = async (req, res) => {
  try {
    const { id } = req.params;
    const { tps3rTargetId, driverNote } = req.body;
    const pickupId = parseInt(id);

    const existing = await prisma.pickupRequest.findUnique({ where: { id: pickupId } });
    if (!existing) return res.status(404).json({ error: 'Pickup tidak ditemukan' });
    if (existing.driverId !== req.user.id) return res.status(403).json({ error: 'Bukan tugas Anda' });
    if (existing.status !== 'COLLECTED') {
      return res.status(400).json({ error: 'Pickup harus berstatus COLLECTED sebelum disetor' });
    }

    // Validasi tps3rTargetId adalah user dengan role ADMIN_TPS3R
    if (tps3rTargetId) {
      const tps3r = await prisma.user.findFirst({
        where: { id: parseInt(tps3rTargetId), role: 'ADMIN_TPS3R', verificationStatus: 'ACTIVE' }
      });
      if (!tps3r) return res.status(400).json({ error: 'TPS3R tujuan tidak valid' });
    }

    const updated = await prisma.pickupRequest.update({
      where: { id: pickupId },
      data: {
        status: 'DELIVERED_TO_TPS3R',
        tps3rTargetId: tps3rTargetId ? parseInt(tps3rTargetId) : null,
        deliveredAt: new Date(),
        note: driverNote ? `${existing.note || ''}\n[Driver]: ${driverNote}`.trim() : existing.note
      }
    });

    res.json({ success: true, pickup: parsePickup(updated) });
  } catch (error) {
    console.error('deliverToTPS3R error:', error);
    res.status(500).json({ error: 'Gagal memperbarui status setoran' });
  }
};

// GET /pickup/driver/active — driver lihat task yang sedang aktif miliknya
export const getDriverActiveTask = async (req, res) => {
  try {
    const pickup = await prisma.pickupRequest.findFirst({
      where: {
        driverId: req.user.id,
        status: { in: ['ACCEPTED', 'ON_THE_WAY', 'COLLECTED', 'DELIVERED_TO_TPS3R'] }
      },
      include: {
        user: { select: { name: true, phone: true, address: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ success: true, activeTask: pickup ? parsePickup(pickup) : null });
  } catch (error) {
    console.error('getDriverActiveTask error:', error);
    res.status(500).json({ error: 'Gagal mengambil task aktif' });
  }
};

// GET /pickup/driver/tps3r-list — ambil daftar TPS3R aktif untuk pilihan setor
export const getActiveTPS3RList = async (req, res) => {
  try {
    const tps3rList = await prisma.user.findMany({
      where: { role: 'ADMIN_TPS3R', verificationStatus: 'ACTIVE' },
      select: { id: true, name: true, tpsName: true, tpsAddress: true, zone: true }
    });

    res.json({ success: true, tps3rList });
  } catch (error) {
    console.error('getActiveTPS3RList error:', error);
    res.status(500).json({ error: 'Gagal mengambil daftar TPS3R' });
  }
};
```

Selanjutnya, **MODIFIKASI** fungsi `updateStatus` yang sudah ada — tambahkan status `ACCEPTED` dan `DELIVERED_TO_TPS3R` ke dalam validasi:

Cari baris ini di `updateStatus`:
```javascript
if (!['ON_THE_WAY', 'COLLECTED'].includes(status)) {
  return res.status(400).json({ error: 'Invalid status update for driver' });
}
```

Ganti dengan:
```javascript
if (!['ON_THE_WAY', 'COLLECTED'].includes(status)) {
  return res.status(400).json({ error: 'Invalid status update for driver' });
}

// Validasi: hanya driver yang sudah ACCEPT yang boleh update ke ON_THE_WAY
if (status === 'ON_THE_WAY') {
  const currentPickup = await prisma.pickupRequest.findUnique({ where: { id: parseInt(id) } });
  if (!currentPickup) return res.status(404).json({ error: 'Pickup tidak ditemukan' });
  if (currentPickup.driverId !== req.user.id) return res.status(403).json({ error: 'Bukan tugas Anda' });
  if (currentPickup.status !== 'ACCEPTED') {
    return res.status(400).json({ error: 'Harus ACCEPT task sebelum berangkat' });
  }
}
```

**MODIFIKASI** fungsi `getDriverPickups` — ubah query agar mengambil status yang lebih lengkap:

Cari:
```javascript
const pickups = await prisma.pickupRequest.findMany({
  where: {
    OR: [
      { status: 'PENDING' },
      { driverId: req.user.id, status: 'ON_THE_WAY' }
    ]
  },
```

Ganti dengan:
```javascript
const pickups = await prisma.pickupRequest.findMany({
  where: {
    OR: [
      { status: 'PENDING', driverId: null },   // task tersedia (belum diklaim)
      { driverId: req.user.id, status: { in: ['ACCEPTED', 'ON_THE_WAY', 'COLLECTED', 'DELIVERED_TO_TPS3R'] } }
    ]
  },
```

---

## BAGIAN 3 — BACKEND ROUTES

### FILE: `backend/src/routes/pickup.routes.js`

**Aksi: TAMBAHKAN route baru. Jangan hapus route existing.**

Tambahkan setelah baris `router.patch('/:id/status', authorizeRole('DRIVER'), updateStatus);`:

```javascript
// Tambahkan import fungsi baru di bagian atas file (setelah import existing)
// import { ..., acceptPickup, cancelAcceptPickup, deliverToTPS3R, getDriverActiveTask, getActiveTPS3RList } from '../controllers/pickup.controller.js';

router.get('/driver/active', authorizeRole('DRIVER'), getDriverActiveTask);
router.get('/driver/tps3r-list', authorizeRole('DRIVER'), getActiveTPS3RList);
router.patch('/:id/accept', authorizeRole('DRIVER'), acceptPickup);
router.patch('/:id/cancel-accept', authorizeRole('DRIVER'), cancelAcceptPickup);
router.patch('/:id/deliver', authorizeRole('DRIVER'), deliverToTPS3R);
```

**PENTING:** Update juga baris import di bagian atas file agar memasukkan fungsi baru:
```javascript
import { 
  createPickup, 
  getHouseholdPickups, 
  getDriverPickups, 
  updateStatus,
  acceptPickup,
  cancelAcceptPickup,
  deliverToTPS3R,
  getDriverActiveTask,
  getActiveTPS3RList,
  getAdminPickups, 
  verifyPickup, 
  getPickupAnalytics 
} from '../controllers/pickup.controller.js';
```

---

## BAGIAN 4 — FRONTEND: TaskDashboard.tsx

### FILE: `src/pages/driver/TaskDashboard.tsx`

**Aksi: GANTI SELURUH ISI FILE dengan kode berikut.**

```tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { MapPin, Navigation, Phone, ChevronDown, ChevronUp, X, Truck, CheckCircle2 } from 'lucide-react';

// Status label mapping
const STATUS_STEPS: Record<string, { label: string; next: string | null; nextLabel: string | null; color: string }> = {
  PENDING:              { label: 'Tersedia',          next: 'ACCEPT',   nextLabel: '✋ Terima Tugas',       color: '#64748b' },
  ACCEPTED:             { label: 'Diterima',          next: 'ON_THE_WAY', nextLabel: '🚛 Mulai Jemput',    color: '#0ea5e9' },
  ON_THE_WAY:           { label: 'Dalam Perjalanan',  next: 'COLLECTED', nextLabel: '✅ Sampah Diambil',  color: '#8b5cf6' },
  COLLECTED:            { label: 'Dikumpulkan',       next: 'DELIVER',  nextLabel: '🏭 Setor ke TPS3R',    color: '#f59e0b' },
  DELIVERED_TO_TPS3R:   { label: 'Disetor ke TPS3R',  next: null,       nextLabel: null,                   color: '#10b981' },
};

type PickupTask = {
  id: number;
  status: string;
  address: string;
  estimatedWeight: string;
  wasteTypes: string[];
  note?: string;
  user?: { name: string; phone?: string };
  acceptedAt?: string;
};

type TPS3R = {
  id: number;
  tpsName: string;
  tpsAddress: string;
};

export default function TaskDashboard() {
  const { user, updateUser } = useAuth();
  const { request, loading } = useApi();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [showTPS3RModal, setShowTPS3RModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [tps3rList, setTps3rList] = useState<TPS3R[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPickups = useCallback(async () => {
    try {
      const data = await request('GET', '/api/pickup/driver');
      setTasks(data.pickups || []);
    } catch (err) {
      console.error(err);
    }
  }, [request]);

  const fetchTPS3RList = useCallback(async () => {
    try {
      const data = await request('GET', '/api/pickup/driver/tps3r-list');
      setTps3rList(data.tps3rList || []);
    } catch (err) {
      console.error(err);
    }
  }, [request]);

  useEffect(() => {
    fetchPickups();
    fetchTPS3RList();
  }, [fetchPickups, fetchTPS3RList]);

  // Accept task (atomic claim)
  const handleAccept = async (id: number) => {
    setProcessingId(id);
    try {
      await request('PATCH', `/api/pickup/${id}/accept`);
      success('Tugas berhasil diterima! Segera berangkat.');
      fetchPickups();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Gagal menerima tugas';
      if (err.response?.data?.code === 'ALREADY_CLAIMED') {
        error('Tugas ini sudah diambil driver lain. Memuat ulang daftar...');
        fetchPickups();
      } else {
        error(msg);
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Cancel accepted task (return to pool)
  const handleCancelAccept = async (id: number) => {
    if (!window.confirm('Batalkan penerimaan tugas ini? Task akan kembali ke daftar tersedia.')) return;
    setProcessingId(id);
    try {
      await request('PATCH', `/api/pickup/${id}/cancel-accept`, { reason: 'Driver membatalkan' });
      success('Penerimaan tugas dibatalkan.');
      fetchPickups();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal membatalkan');
    } finally {
      setProcessingId(null);
    }
  };

  // Update status to ON_THE_WAY or COLLECTED
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setProcessingId(id);
    try {
      await request('PATCH', `/api/pickup/${id}/status`, { status: newStatus });
      success('Status berhasil diperbarui!');
      fetchPickups();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal memperbarui status');
      fetchPickups();
    } finally {
      setProcessingId(null);
    }
  };

  // Open TPS3R selector modal for DELIVER step
  const handleDeliverIntent = (id: number) => {
    setSelectedTaskId(id);
    setShowTPS3RModal(true);
  };

  // Confirm delivery to selected TPS3R
  const handleConfirmDeliver = async (tps3rId: number) => {
    if (!selectedTaskId) return;
    setProcessingId(selectedTaskId);
    setShowTPS3RModal(false);
    try {
      await request('PATCH', `/api/pickup/${selectedTaskId}/deliver`, { tps3rTargetId: tps3rId });
      success('Setoran ke TPS3R berhasil dicatat! Tunggu verifikasi dari admin TPS3R.');
      fetchPickups();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal mencatat setoran');
    } finally {
      setProcessingId(null);
      setSelectedTaskId(null);
    }
  };

  const handleClaimBonus = async () => {
    try {
      const res = await request('POST', '/api/auth/claim-bonus');
      if (res?.user) {
        updateUser(res.user);
        success(res.message || 'Bonus 100 Poin berhasil diklaim!');
        setBonusClaimed(true);
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal mengklaim bonus');
    }
  };

  // Separate active tasks from available tasks
  const myActiveTasks = tasks.filter(t => t.status !== 'PENDING');
  const availableTasks = tasks.filter(t => t.status === 'PENDING');
  const completedCount = tasks.filter(t => t.status === 'DELIVERED_TO_TPS3R').length;
  const totalCount = tasks.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* HEADER */}
      <header style={{ padding: '1.5rem', backgroundColor: 'var(--role-driver)', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}
        className="driver-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tugas Hari Ini</h1>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Zona: {user?.domicile || user?.zone || 'Belum diset'} &bull; {totalCount} titik tersedia
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Total Poin</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.points || 0} Pds</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', textAlign: 'right', marginBottom: '0.25rem', fontWeight: 600, color: '#fef08a' }}>
            ✨ Selesaikan semua untuk +100 Poin bonus
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <span>Progres Selesai</span>
            <span>{completedCount}/{totalCount} selesai</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`, height: '100%', backgroundColor: '#fff', borderRadius: '3px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </header>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>

        {/* Bonus claim banner */}
        {completedCount === totalCount && totalCount > 0 && !bonusClaimed && (
          <Card variant="elevated" padding="md" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>Target Tercapai!</h3>
              <p style={{ color: '#15803d', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Anda telah menyelesaikan semua {totalCount} titik penjemputan. Klaim bonus Anda sekarang!
              </p>
              <Button fullWidth onClick={handleClaimBonus} disabled={loading} style={{ backgroundColor: '#16a34a' }}>
                {loading ? 'Mengklaim...' : 'Klaim 100 Poin Bonus'}
              </Button>
            </div>
          </Card>
        )}

        {/* MY ACTIVE TASKS — tasks yang sudah di-accept driver ini */}
        {myActiveTasks.length > 0 && (
          <section>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📋 Tugas Aktif Saya ({myActiveTasks.length})
            </h2>
            <div className="task-grid">
              {myActiveTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedId === task.id}
                  onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  onAction={(action) => {
                    if (action === 'ON_THE_WAY') handleUpdateStatus(task.id, 'ON_THE_WAY');
                    if (action === 'COLLECTED') handleUpdateStatus(task.id, 'COLLECTED');
                    if (action === 'DELIVER') handleDeliverIntent(task.id);
                    if (action === 'CANCEL_ACCEPT') handleCancelAccept(task.id);
                  }}
                  isProcessing={processingId === task.id}
                  accentColor="var(--role-driver)"
                />
              ))}
            </div>
          </section>
        )}

        {/* AVAILABLE TASKS — task PENDING yang bisa diambil */}
        <section>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🟢 Tersedia untuk Diambil ({availableTasks.length})
          </h2>
          {loading && tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Memuat tugas...</div>
          ) : availableTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Tidak ada task tersedia saat ini</h3>
              <p style={{ fontSize: '0.875rem' }}>Semua task sudah diambil atau belum ada permintaan baru.</p>
            </div>
          ) : (
            <div className="task-grid">
              {availableTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedId === task.id}
                  onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  onAction={(action) => {
                    if (action === 'ACCEPT') handleAccept(task.id);
                  }}
                  isProcessing={processingId === task.id}
                  accentColor="#64748b"
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* TPS3R SELECTOR MODAL */}
      {showTPS3RModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '1rem 1rem 0 0',
            width: '100%', maxWidth: '480px', padding: '1.5rem',
            maxHeight: '70vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pilih TPS3R Tujuan</h3>
              <button onClick={() => setShowTPS3RModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Pilih TPS3R tempat Anda akan menyetorkan sampah yang sudah terkumpul.
            </p>
            {tps3rList.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '1rem' }}>
                Tidak ada TPS3R aktif yang tersedia.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tps3rList.map((tps) => (
                  <button
                    key={tps.id}
                    onClick={() => handleConfirmDeliver(tps.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '1rem', border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      backgroundColor: '#fff', textAlign: 'left',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--role-driver)')}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>🏭 {tps.tpsName || tps.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{tps.tpsAddress}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .task-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 1024px) {
          .task-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
          .driver-header { padding: 1.5rem 2.5rem !important; }
        }
      `}</style>
    </div>
  );
}

// ─── SUB-COMPONENT: TaskCard ────────────────────────────────────────────
interface TaskCardProps {
  task: PickupTask;
  isExpanded: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
  isProcessing: boolean;
  accentColor: string;
}

function TaskCard({ task, isExpanded, onToggle, onAction, isProcessing, accentColor }: TaskCardProps) {
  const statusInfo = STATUS_STEPS[task.status] || STATUS_STEPS.PENDING;

  return (
    <Card variant="elevated" padding="md" style={{ borderLeft: `6px solid ${accentColor}` }}>
      {/* Card header — always visible */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
            {task.user?.name || 'Rumah Tangga'}
          </h3>
          <span style={{
            display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
            padding: '0.125rem 0.5rem', borderRadius: '999px',
            backgroundColor: `${accentColor}18`, color: accentColor,
          }}>
            ● {statusInfo.label}
          </span>
        </div>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '0.25rem' }}>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Address — clickable to maps */}
      <div
        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(task.address)}`, '_blank')}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}
      >
        <MapPin size={15} color="var(--color-text-secondary)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textDecoration: 'underline', lineHeight: 1.4 }}>
          {task.address}
        </span>
      </div>

      {/* Waste tags + weight */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {task.wasteTypes?.map((type) => (
          <span key={type} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: 'var(--radius-sm)' }}>
            {type}
          </span>
        ))}
        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: 'var(--radius-sm)' }}>
          Est: {task.estimatedWeight}
        </span>
      </div>

      {/* Expandable detail */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
          {task.user?.phone && (
            <a href={`tel:${task.user.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '0.5rem' }}>
              <Phone size={15} /> Hubungi: {task.user.phone}
            </a>
          )}
          {task.note && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              Catatan: "{task.note}"
            </p>
          )}
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(task.address)}`, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--role-driver)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0', fontWeight: 600 }}
          >
            <Navigation size={15} /> Buka Navigasi Google Maps
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {task.status === 'PENDING' && (
          <Button fullWidth size="lg" onClick={() => onAction('ACCEPT')} disabled={isProcessing}
            style={{ backgroundColor: 'var(--role-driver)', fontSize: '0.9375rem' }}>
            {isProcessing ? 'Memproses...' : '✋ Terima Tugas'}
          </Button>
        )}
        {task.status === 'ACCEPTED' && (
          <>
            <Button fullWidth size="lg" onClick={() => onAction('ON_THE_WAY')} disabled={isProcessing}
              style={{ backgroundColor: '#8b5cf6', fontSize: '0.9375rem' }}>
              {isProcessing ? 'Memproses...' : '🚛 Mulai Berangkat'}
            </Button>
            <Button fullWidth size="sm" variant="ghost" onClick={() => onAction('CANCEL_ACCEPT')} disabled={isProcessing}
              style={{ color: '#ef4444', fontSize: '0.8125rem' }}>
              Batalkan Penerimaan
            </Button>
          </>
        )}
        {task.status === 'ON_THE_WAY' && (
          <Button fullWidth size="lg" onClick={() => onAction('COLLECTED')} disabled={isProcessing}
            style={{ backgroundColor: 'var(--color-primary)', fontSize: '0.9375rem' }}>
            {isProcessing ? 'Memproses...' : '✅ Sampah Sudah Diambil'}
          </Button>
        )}
        {task.status === 'COLLECTED' && (
          <Button fullWidth size="lg" onClick={() => onAction('DELIVER')} disabled={isProcessing}
            style={{ backgroundColor: '#f59e0b', fontSize: '0.9375rem', color: '#fff' }}>
            {isProcessing ? 'Memproses...' : '🏭 Setor ke TPS3R'}
          </Button>
        )}
        {task.status === 'DELIVERED_TO_TPS3R' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', color: '#15803d', fontSize: '0.875rem', fontWeight: 600 }}>
            <CheckCircle2 size={18} /> Disetor ke TPS3R — Menunggu verifikasi admin
          </div>
        )}
      </div>
    </Card>
  );
}
```

---

## BAGIAN 5 — FRONTEND: RouteOverview.tsx

### FILE: `src/pages/driver/RouteOverview.tsx`

**Aksi: MODIFIKASI bagian `getMockCoordinate` dan tambahkan geocoding sederhana.**

Cari dan GANTI fungsi `getMockCoordinate`:

```tsx
// GANTI fungsi getMockCoordinate dengan hook geocoding asli
// Tambahkan state untuk koordinat hasil geocoding
const [coordsMap, setCoordsMap] = useState<Record<number, [number, number]>>({});

// Tambahkan fungsi geocode setelah state declarations
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    const encoded = encodeURIComponent(address + ', Kalimantan Timur, Indonesia');
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'id' }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (err) {
    console.warn('Geocode failed for:', address);
  }
  return null;
};
```

Kemudian di dalam `useEffect`, setelah `setTasks(data.pickups || [])`, tambahkan:

```tsx
// Geocode semua alamat
const newCoords: Record<number, [number, number]> = {};
for (const task of (data.pickups || [])) {
  if (task.status !== 'PENDING' && task.status !== 'ON_THE_WAY') continue;
  const coords = await geocodeAddress(task.address);
  if (coords) newCoords[task.id] = coords;
  // Rate limit Nominatim: tunggu 300ms antar request
  await new Promise(r => setTimeout(r, 300));
}
setCoordsMap(newCoords);
```

Dan GANTI `const markers = pendingTasks.map(...)` dengan:

```tsx
const markers = pendingTasks
  .filter(t => coordsMap[t.id])
  .map(t => ({ ...t, position: coordsMap[t.id] as [number, number] }));
```

---

## BAGIAN 6 — FRONTEND: DriverProfile.tsx

### FILE: `src/pages/driver/DriverProfile.tsx`

**Aksi: MODIFIKASI bagian yang hardcoded. Ganti nilai statis dengan data dari `user` object.**

Cari baris:
```tsx
<div style={{ fontWeight: 700 }}>Pickup Bak L300 (KT 1234 AB)</div>
```
Ganti dengan:
```tsx
<div style={{ fontWeight: 700 }}>
  {user?.vehicleType && user?.vehiclePlate 
    ? `${user.vehicleType} (${user.vehiclePlate})`
    : <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Belum diisi — edit profil</span>
  }
</div>
```

Cari baris:
```tsx
<div style={{ fontWeight: 700 }}>Balikpapan Barat</div>
```
Ganti dengan:
```tsx
<div style={{ fontWeight: 700 }}>
  {user?.domicile || user?.zone || 
    <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Belum diisi</span>
  }
</div>
```

Cari baris:
```tsx
<div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Pengemudi Armada (Driver)</div>
```
Ganti dengan:
```tsx
<div style={{ opacity: 0.9, fontSize: '0.875rem' }}>
  {user?.driverType === 'MITRA_TPS3R' ? '🏭 Driver Mitra TPS3R' : '🚛 Driver Freelance'}
</div>
```

---

## BAGIAN 7 — FRONTEND: CompletedTasks.tsx

### FILE: `src/pages/driver/CompletedTasks.tsx`

**Aksi: MODIFIKASI filter status agar memasukkan status baru.**

Cari baris:
```tsx
setTasks((data.pickups || []).filter((p: any) => p.status === 'COLLECTED' || p.status === 'VERIFIED' || p.status === 'COMPLETED'));
```

Ganti dengan:
```tsx
setTasks((data.pickups || []).filter((p: any) => 
  ['COLLECTED', 'DELIVERED_TO_TPS3R', 'VERIFIED', 'COMPLETED'].includes(p.status)
));
```

Tambahkan kolom status yang lebih deskriptif. Cari bagian render di dalam `.map(task => (...))`:

Setelah `<Badge status={task.status} />`, tambahkan:
```tsx
{task.status === 'DELIVERED_TO_TPS3R' && (
  <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600, display: 'block' }}>
    ⏳ Menunggu verifikasi TPS3R
  </span>
)}
```

---

## BAGIAN 8 — UPDATE ADMIN TPS3R (Terima Setoran dari Driver Freelance)

### FILE: `backend/src/controllers/pickup.controller.js`

**Aksi: MODIFIKASI fungsi `getAdminPickups` agar juga menampilkan status `DELIVERED_TO_TPS3R`.**

Cari:
```javascript
const pickups = await prisma.pickupRequest.findMany({
  where: { status: 'COLLECTED' },
```

Ganti dengan:
```javascript
const pickups = await prisma.pickupRequest.findMany({
  where: { 
    status: { in: ['COLLECTED', 'DELIVERED_TO_TPS3R'] },
    // Jika ada tps3rTargetId, hanya tampilkan yang ditujukan ke admin ini
    OR: [
      { tps3rTargetId: null },
      { tps3rTargetId: req.user.id }
    ]
  },
```

---

## BAGIAN 9 — SEED DATA UPDATE (Opsional tapi Direkomendasikan)

### FILE: `backend/prisma/seed.js`

**Aksi: TAMBAHKAN field baru ke user driver di seed.**

Cari definisi user driver (driver.freelance dan driver.mitra), tambahkan field:

```javascript
// Untuk driver freelance
vehicleType: 'Motor Roda Tiga',
vehiclePlate: 'KT 5678 CD',
domicile: 'Balikpapan Selatan',

// Untuk driver mitra
vehicleType: 'Pickup Bak L300',
vehiclePlate: 'KT 1234 AB',
domicile: 'Balikpapan Barat',
```

---

## ✅ CHECKLIST VERIFIKASI SETELAH IMPLEMENTASI

Setelah selesai mengerjakan, AI Agent wajib memverifikasi hal-hal berikut:

### Backend
- [ ] `npx prisma migrate dev` berhasil tanpa error
- [ ] `npx prisma generate` berhasil
- [ ] Route `/api/pickup/driver/active` merespons 200 dengan token driver
- [ ] Route `/api/pickup/:id/accept` mengembalikan 409 jika task sudah diklaim
- [ ] Route `/api/pickup/driver/tps3r-list` mengembalikan array TPS3R aktif

### Frontend
- [ ] TaskDashboard memisahkan "Tugas Aktif Saya" dari "Tersedia untuk Diambil"
- [ ] Tombol "Terima Tugas" ada dan berfungsi
- [ ] Modal TPS3R muncul saat klik "Setor ke TPS3R"
- [ ] DriverProfile menampilkan data user dinamis, bukan hardcoded
- [ ] RouteOverview tidak lagi menggunakan `getMockCoordinate`
- [ ] CompletedTasks menampilkan status `DELIVERED_TO_TPS3R`

---

## 🚫 LARANGAN (Jangan Dilakukan)

1. **JANGAN** hapus atau ubah nama fungsi existing di controller
2. **JANGAN** ubah struktur tabel yang sudah ada, hanya tambah field baru
3. **JANGAN** ubah logic expedition yang sudah berjalan
4. **JANGAN** ubah CSS di `Expedition.css` kecuali jika memang diperlukan
5. **JANGAN** ubah schema auth atau JWT
6. **JANGAN** jalankan `prisma migrate reset` — cukup `migrate dev`

---

## 📌 KONTEKS TEKNIS PENTING

- **Stack:** React + TypeScript (Vite), Express.js, Prisma ORM, SQLite (dev)
- **Auth:** JWT Bearer token, role disimpan di token payload
- **State driver:** `user.driverType` bisa `FREELANCE` atau `MITRA_TPS3R`
- **Status PickupRequest saat ini:** `PENDING → ON_THE_WAY → COLLECTED → VERIFIED → COMPLETED`
- **Status PickupRequest setelah implementasi:** `PENDING → ACCEPTED → ON_THE_WAY → COLLECTED → DELIVERED_TO_TPS3R → VERIFIED → COMPLETED`
- **Expedition hanya untuk MITRA_TPS3R** — tidak perlu diubah
- **Geocoding:** Gunakan Nominatim (OpenStreetMap) — gratis, tanpa API key, rate limit 1 req/detik

---

*Prompt ini dibuat berdasarkan audit mendalam terhadap kode aktual E-TrashHub. Implementasikan secara berurutan dari Bagian 1 hingga Bagian 9.*
