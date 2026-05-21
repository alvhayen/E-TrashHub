import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /analytics/overview — Pemda overview (PEMDA)
export const getPemdaOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayPickups, totalHouseholds, completedPickups] = await Promise.all([
      prisma.pickupRequest.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { actualWeight: true, estimatedWeight: true }
      }),
      prisma.user.count({ where: { role: 'RUMAH_TANGGA' } }),
      prisma.pickupRequest.count({ where: { status: 'COMPLETED' } })
    ]);

    const totalVolumeToday = todayPickups._sum.actualWeight || todayPickups._sum.estimatedWeight || 0;
    
    // Some rough metrics
    const totalPickupsCount = await prisma.pickupRequest.count();
    const managedRatio = totalPickupsCount > 0 ? (completedPickups / totalPickupsCount) * 100 : 0;
    const complianceRate = 85; // placeholder logic

    res.json({
      totalVolumeToday,
      managedRatio,
      complianceRate,
      activeHouseholds: totalHouseholds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
};

// GET /analytics/zones — zone ranking by compliance (PEMDA)
export const getPemdaZones = async (req, res) => {
  try {
    // simplified mock-ish data based on available regions
    res.json({
      zones: [
        { name: 'Surabaya Timur', complianceRate: 92, activeHouseholds: 420 },
        { name: 'Surabaya Pusat', complianceRate: 88, activeHouseholds: 380 },
        { name: 'Surabaya Barat', complianceRate: 85, activeHouseholds: 310 },
        { name: 'Surabaya Selatan', complianceRate: 80, activeHouseholds: 450 }
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch zone data' });
  }
};

// GET /analytics/trends — weekly trends data for charts (PEMDA)
export const getPemdaTrends = async (req, res) => {
  try {
    // simplified trends data
    res.json({
      weeklyTrends: [
        { label: 'Senin', organics: 0, anorganics: 45 },
        { label: 'Selasa', organics: 0, anorganics: 55 },
        { label: 'Rabu', organics: 0, anorganics: 80 },
        { label: 'Kamis', organics: 0, anorganics: 42 },
        { label: 'Jumat', organics: 0, anorganics: 95 },
        { label: 'Sabtu', organics: 0, anorganics: 120 },
        { label: 'Minggu', organics: 0, anorganics: 15 }
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
};
