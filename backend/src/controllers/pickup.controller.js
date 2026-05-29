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
        estimatedWeight: estimatedWeight, // Store as string label: "Ringan"/"Sedang"/"Berat"
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
          { status: 'PENDING' },
          { driverId: req.user.id, status: 'ON_THE_WAY' }
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

// PATCH /pickup/:id/status — driver updates status (DRIVER)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ON_THE_WAY', 'COLLECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status update for driver' });
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
      where: { status: 'COLLECTED' },
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
