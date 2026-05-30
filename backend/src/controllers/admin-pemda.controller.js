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
        verificationStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pemdas);
  } catch (error) {
    console.error('Error in getPemdaList:', error);
    res.status(500).json({ error: 'Failed to fetch pemda list' });
  }
};

export const updatePemdaStatus = async (req, res) => {
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
    console.error('Error updating pemda status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const getPemdaRegions = async (req, res) => {
  try {
    // Group by region to get count of pemdas per region
    const regions = await prisma.user.groupBy({
      by: ['region'],
      where: { role: 'PEMDA', region: { not: null } },
      _count: { id: true }
    });

    const formattedRegions = regions.map(r => ({
      name: r.region,
      pemdaCount: r._count.id
    }));

    res.json(formattedRegions);
  } catch (error) {
    console.error('Error in getPemdaRegions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
};
