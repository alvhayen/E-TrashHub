import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDriverStats = async (req, res) => {
  try {
    const totalDrivers = await prisma.user.count({
      where: { role: 'DRIVER' }
    });

    const activeToday = await prisma.pickupRequest.count({
      where: {
        driverId: { not: null },
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    res.json({ totalDrivers, activeToday });
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
        points: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(drivers);
  } catch (error) {
    console.error('Error in getDriverList:', error);
    res.status(500).json({ error: 'Failed to fetch driver list' });
  }
};
