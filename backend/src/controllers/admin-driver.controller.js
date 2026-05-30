import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDriverStats = async (req, res) => {
  try {
    const totalDrivers = await prisma.user.count({
      where: { role: 'DRIVER' }
    });

    const activeDrivers = await prisma.user.count({
      where: { role: 'DRIVER', isOnDuty: true }
    });

    const pickupsToday = await prisma.pickupRequest.count({
      where: {
        driverId: { not: null },
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    res.json({ totalDrivers, activeDrivers, pickupsToday });
  } catch (error) {
    console.error('Error in getDriverStats:', error);
    res.status(500).json({ error: 'Failed to fetch driver stats' });
  }
};

export const getDriverList = async (req, res) => {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: 'DRIVER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        driverType: true,
        domicile: true,
        verificationStatus: true,
        points: true,
        vehicleType: true,
        vehiclePlate: true,
        isOnDuty: true,
        _count: {
          select: { pickupRequestsAsDriver: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(drivers);
  } catch (error) {
    console.error('Error in getDriverList:', error);
    res.status(500).json({ error: 'Failed to fetch driver list' });
  }
};

export const updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['ACTIVE', 'SUSPENDED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { verificationStatus: status }
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const getDriverActivity = async (req, res) => {
  try {
    const activePickups = await prisma.pickupRequest.findMany({
      where: {
        status: { in: ['ACCEPTED', 'ON_THE_WAY', 'COLLECTED'] }
      },
      include: {
        user: { select: { name: true, phone: true } },
        driver: { select: { name: true, vehiclePlate: true, isOnDuty: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ activePickups });
  } catch (error) {
    console.error('Error in getDriverActivity:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};
