import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPemdaStats = async (req, res) => {
  try {
    const totalPemda = await prisma.user.count({
      where: { role: 'PEMDA' }
    });

    // Count unique regions among pemdas
    const pemdas = await prisma.user.findMany({
      where: { role: 'PEMDA', region: { not: null } },
      select: { region: true }
    });
    
    const uniqueRegions = new Set(pemdas.map(p => p.region)).size;

    res.json({ totalPemda, totalRegions: uniqueRegions });
  } catch (error) {
    console.error('Error in getPemdaStats:', error);
    res.status(500).json({ error: 'Failed to fetch pemda stats' });
  }
};

export const getPemdaList = async (req, res) => {
  try {
    const pemdas = await prisma.user.findMany({
      where: { role: 'PEMDA' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        region: true,
        officeAddress: true,
        verificationStatus: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pemdas);
  } catch (error) {
    console.error('Error in getPemdaList:', error);
    res.status(500).json({ error: 'Failed to fetch pemda list' });
  }
};
