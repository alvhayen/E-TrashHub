import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getQueue = async (req, res) => {
  try {
    const queue = await prisma.verificationQueue.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            tpsName: true,
            region: true,
            createdAt: true
          }
        }
      },
      orderBy: { submittedAt: 'asc' }
    });
    res.json({ success: true, queue });
  } catch (error) {
    console.error('getQueue error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const approveQueue = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { notes } = req.body;

    const queueItem = await prisma.verificationQueue.findUnique({ where: { id } });
    if (!queueItem) return res.status(404).json({ error: 'Queue item not found' });

    const result = await prisma.$transaction(async (tx) => {
      const updatedQueue = await tx.verificationQueue.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          reviewedAt: new Date(),
          reviewedBy: String(req.user.id),
          notes: notes || null
        }
      });

      const updatedUser = await tx.user.update({
        where: { id: queueItem.userId },
        data: { verificationStatus: 'ACTIVE' },
        select: { name: true, email: true, role: true }
      });

      return updatedUser;
    });

    res.json({ success: true, user: result });
  } catch (error) {
    console.error('approveQueue error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const rejectQueue = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { notes } = req.body;

    if (!notes) return res.status(400).json({ error: 'Notes (reason for rejection) is required' });

    const queueItem = await prisma.verificationQueue.findUnique({ where: { id } });
    if (!queueItem) return res.status(404).json({ error: 'Queue item not found' });

    const result = await prisma.$transaction(async (tx) => {
      await tx.verificationQueue.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: String(req.user.id),
          notes
        }
      });

      const updatedUser = await tx.user.update({
        where: { id: queueItem.userId },
        data: { verificationStatus: 'REJECTED' },
        select: { name: true, email: true, role: true }
      });

      return updatedUser;
    });

    res.json({ success: true, user: result });
  } catch (error) {
    console.error('rejectQueue error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = role ? { role: role.toUpperCase() } : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const pendingVerification = await prisma.verificationQueue.count({ where: { status: 'PENDING' } });
    
    // Active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Ideally we'd have a lastLogin field, but we can just mock or use createdAt for now or simply return a placeholder
    const activeToday = 0; // Requires tracking session or last login

    const totalPickups = await prisma.pickupRequest.count();

    res.json({ 
      success: true, 
      stats: {
        totalUsers,
        pendingVerification,
        activeToday,
        totalPickups
      }
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
