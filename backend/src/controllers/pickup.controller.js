import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to safely parse pickup JSON fields for response
const parsePickup = (p) => ({
  ...p,
  wasteTypes: (() => { try { return JSON.parse(p.wasteTypes || '[]'); } catch { return p.wasteTypes ? [p.wasteTypes] : []; } })(),
  environmentalImpact: (() => { try { return p.environmentalImpact ? JSON.parse(p.environmentalImpact) : null; } catch { return null; } })()
});

// POST /pickup — household creates pickup request (requires RUMAH_TANGGA role)
export const createPickup = async (req, res) => {
  try {
    const { wasteTypes, estimatedWeight, address, note } = req.body;
    const pickup = await prisma.pickupRequest.create({
      data: {
        userId: req.user.id,
        wasteTypes: JSON.stringify(wasteTypes || []),
        estimatedWeight: String(estimatedWeight), // Store as string label: "Ringan"/"Sedang"/"Berat"
        address,
        note,
        status: 'PENDING'
      }
    });

    res.status(201).json({ pickup: parsePickup(pickup) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create pickup request' });
  }
};

// GET /pickup/household — household sees their own pickups (RUMAH_TANGGA)
export const getHouseholdPickups = async (req, res) => {
  try {
    const pickups = await prisma.pickupRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedPickups = pickups.map(parsePickup);

    res.json({ pickups: formattedPickups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
};

// GET /pickup/driver — driver sees PENDING pickups in their zone (DRIVER)
export const getDriverPickups = async (req, res) => {
  try {
    const pickups = await prisma.pickupRequest.findMany({
      where: {
        OR: [
          { status: 'PENDING', driverId: null },   // task tersedia (belum diklaim)
          { driverId: req.user.id, status: { in: ['ACCEPTED', 'ON_THE_WAY', 'COLLECTED', 'DELIVERED_TO_TPS3R'] } }
        ]
      },
      include: {
        user: { select: { name: true, phone: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    const formattedPickups = pickups.map(parsePickup);

    res.json({ pickups: formattedPickups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
};

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

// PATCH /pickup/:id/status — driver updates status (DRIVER)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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

    const pickup = await prisma.pickupRequest.update({
      where: { id: parseInt(id) },
      data: {
        status,
        driverId: req.user.id
      }
    });

    res.json({ pickup: parsePickup(pickup) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// GET /pickup/admin — admin sees all pickups coming to TPS3R (ADMIN_TPS3R)
export const getAdminPickups = async (req, res) => {
  try {
    const pickups = await prisma.pickupRequest.findMany({
      where: { 
        status: { in: ['COLLECTED', 'DELIVERED_TO_TPS3R'] },
        // Jika ada tps3rTargetId, hanya tampilkan yang ditujukan ke admin ini
        OR: [
          { tps3rTargetId: null },
          { tps3rTargetId: req.user.id }
        ]
      },
      include: {
        user: { select: { name: true, address: true } },
        driver: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    const formattedPickups = pickups.map(parsePickup);

    res.json({ pickups: formattedPickups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
};

// POST /pickup/:id/verify — admin verifies and weighs (ADMIN_TPS3R)
export const verifyPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualWeight, wasteMatch, note } = req.body;

    const pickupId = parseInt(id);
    const weightInfo = parseFloat(actualWeight);

    const existingPickup = await prisma.pickupRequest.findUnique({ where: { id: pickupId } });
    if (!existingPickup) return res.status(404).json({ error: 'Pickup not found' });
    if (existingPickup.status !== 'COLLECTED') {
      return res.status(400).json({ error: 'Pickup must be COLLECTED before verification' });
    }

    const basePoints = weightInfo * 50;
    const bonusPoints = Math.floor(weightInfo / 5) * 50;
    const pointsEarned = basePoints + bonusPoints;

    // Calculate environmental impact
    const environmentalImpact = JSON.stringify({
      co2Offset: (weightInfo * 2.5).toFixed(2),
      waterSaved: Math.round(weightInfo * 15),
      energySaved: Math.round(weightInfo * 5.8),
      treesEquivalent: (weightInfo / 10).toFixed(1)
    });

    const [pickup, userUpdate, transaction] = await prisma.$transaction([
      prisma.pickupRequest.update({
        where: { id: pickupId },
        data: {
          actualWeight: weightInfo,
          status: 'COMPLETED',
          points: pointsEarned,
          environmentalImpact,
          note: note ? note : existingPickup.note
        }
      }),
      prisma.user.update({
        where: { id: existingPickup.userId },
        data: { points: { increment: pointsEarned } }
      }),
      prisma.transaction.create({
        data: {
          userId: existingPickup.userId,
          pickupId: pickupId,
          points: pointsEarned,
          type: 'EARN',
          description: `Verified ${weightInfo}kg pickup`
        }
      })
    ]);

    res.json({ pickup: parsePickup(pickup), pointsEarned, newTotal: userUpdate.points });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify pickup' });
  }
};

// GET /pickup/analytics — aggregated data for Pemda (PEMDA)
export const getPickupAnalytics = async (req, res) => {
  try {
    const totalPickups = await prisma.pickupRequest.count();
    
    res.json({
      totalPickups,
      statusCounts: await prisma.pickupRequest.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
