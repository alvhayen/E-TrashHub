import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /pickup — household creates pickup request (requires RUMAH_TANGGA role)
export const createPickup = async (req, res) => {
  try {
    const { wasteTypes, estimatedWeight, address, note } = req.body;
    const pickup = await prisma.pickupRequest.create({
      data: {
        userId: req.user.id,
        wasteTypes,
        estimatedWeight: parseFloat(estimatedWeight),
        address,
        note,
        status: 'PENDING'
      }
    });
    res.status(201).json({ pickup });
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
    res.json({ pickups });
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
    res.json({ pickups });
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

    res.json({ pickup });
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
    res.json({ pickups });
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

    const [pickup, userUpdate, transaction] = await prisma.$transaction([
      prisma.pickupRequest.update({
        where: { id: pickupId },
        data: {
          actualWeight: weightInfo,
          status: 'COMPLETED',
          points: pointsEarned,
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

    res.json({ pickup, pointsEarned, newTotal: userUpdate.points });
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
