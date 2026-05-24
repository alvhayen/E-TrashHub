import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper for generating waybill number
const generateWaybillNumber = () => {
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `EXP-${dateStr}-${random4}`;
};

export const getExpeditionsForDriver = async (req, res) => {
  try {
    if (req.user.driverType !== 'MITRA_TPS3R') {
      return res.status(403).json({ error: 'Only MITRA_TPS3R drivers can access this' });
    }

    const { status } = req.query;
    const whereClause = { driverId: req.user.id };
    
    if (status && ['ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'CONFIRMED'].includes(status)) {
      whereClause.status = status;
    }

    const expeditions = await prisma.expedition.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            inventory: {
              include: {
                wasteCategory: true
              }
            }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    res.json({ success: true, expeditions });
  } catch (error) {
    console.error('getExpeditionsForDriver error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getExpeditionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expedition = await prisma.expedition.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            inventory: {
              include: {
                wasteCategory: true
              }
            }
          }
        },
        driver: {
          select: { name: true, phone: true }
        }
      }
    });

    if (!expedition) return res.status(404).json({ error: 'Expedition not found' });

    // Role checks
    if (req.user.role === 'DRIVER' && expedition.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Not assigned to you' });
    }
    
    // TPS3R Admin checks
    if (req.user.role === 'ADMIN_TPS3R' && expedition.originId !== req.user.id && expedition.destinationId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: Not relevant to your TPS3R' });
    }

    res.json({ success: true, expedition });
  } catch (error) {
    console.error('getExpeditionById error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const departExpedition = async (req, res) => {
  try {
    const { id } = req.params;
    const expedition = await prisma.expedition.findUnique({ where: { id } });

    if (!expedition) return res.status(404).json({ error: 'Expedition not found' });
    
    if (expedition.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your expedition' });
    }

    if (expedition.status !== 'ASSIGNED') {
      return res.status(400).json({ error: 'Expedition must be ASSIGNED to depart' });
    }

    const updated = await prisma.expedition.update({
      where: { id },
      data: {
        status: 'ON_THE_WAY',
        departedAt: new Date()
      }
    });

    res.json({ success: true, expedition: updated });
  } catch (error) {
    console.error('departExpedition error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const arriveExpedition = async (req, res) => {
  try {
    const { id } = req.params;
    const expedition = await prisma.expedition.findUnique({ where: { id } });

    if (!expedition) return res.status(404).json({ error: 'Expedition not found' });
    
    if (expedition.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your expedition' });
    }

    if (expedition.status !== 'ON_THE_WAY') {
      return res.status(400).json({ error: 'Expedition must be ON_THE_WAY to arrive' });
    }

    const updated = await prisma.expedition.update({
      where: { id },
      data: {
        status: 'ARRIVED',
        arrivedAt: new Date()
      }
    });

    res.json({ success: true, expedition: updated });
  } catch (error) {
    console.error('arriveExpedition error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const confirmExpedition = async (req, res) => {
  try {
    const { id } = req.params;
    const expedition = await prisma.expedition.findUnique({ 
        where: { id },
        include: { items: true }
    });

    if (!expedition) return res.status(404).json({ error: 'Expedition not found' });
    
    if (expedition.destinationId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: you are not the destination' });
    }

    if (expedition.status !== 'ARRIVED') {
      return res.status(400).json({ error: 'Expedition must be ARRIVED to confirm' });
    }

    const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.expedition.update({
            where: { id },
            data: {
                status: 'CONFIRMED',
                confirmedAt: new Date()
            }
        });

        // Update inventory at origin
        for (const item of expedition.items) {
            const inventory = await tx.inventory.findUnique({ where: { id: item.inventoryId }});
            if (inventory) {
                const newStock = inventory.stockKg - item.weightKg;
                await tx.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        stockKg: Math.max(0, newStock),
                        status: newStock <= 0 ? 'SOLD_OUT' : inventory.status
                    }
                });
            }
        }

        return updated;
    });

    res.json({ success: true, expedition: result });
  } catch (error) {
    console.error('confirmExpedition error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createExpedition = async (req, res) => {
  try {
    const { type, driverId, destinationId, items, notes } = req.body;

    if (!type || !driverId || !destinationId || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const originUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    const destinationUser = await prisma.user.findUnique({ where: { id: destinationId } });

    if (!originUser || !destinationUser) {
        return res.status(404).json({ error: 'Origin or Destination user not found' });
    }

    // Generate manifest
    const manifestItems = [];
    for (const item of items) {
        const inv = await prisma.inventory.findUnique({ where: { id: item.inventoryId }});
        if (inv) {
            manifestItems.push({
                name: inv.commodity,
                qty: item.weightKg,
                weight: item.weightKg
            });
        }
    }

    const waybillNumber = generateWaybillNumber();

    const expedition = await prisma.expedition.create({
      data: {
        type,
        driverId,
        originId: req.user.id,
        destinationId,
        originName: originUser.tpsName || originUser.name,
        destinationName: destinationUser.tpsName || destinationUser.name,
        originAddress: originUser.tpsAddress || originUser.address || '',
        destinationAddress: destinationUser.tpsAddress || destinationUser.companyAddress || '',
        notes,
        waybillNumber,
        manifest: { items: manifestItems },
        items: {
          create: items.map(item => ({
            inventoryId: item.inventoryId,
            weightKg: item.weightKg,
            notes: item.notes
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json({ success: true, expedition });
  } catch (error) {
    console.error('createExpedition error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getExpeditionsForAdmin = async (req, res) => {
  try {
    const expeditions = await prisma.expedition.findMany({
      where: { originId: req.user.id },
      include: {
        driver: {
          select: { name: true, phone: true }
        },
        items: {
            include: {
                inventory: {
                    include: { wasteCategory: true }
                }
            }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    res.json({ success: true, expeditions });
  } catch (error) {
    console.error('getExpeditionsForAdmin error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const trackExpedition = async (req, res) => {
  try {
    const { waybillNumber } = req.params;
    
    const expedition = await prisma.expedition.findFirst({
      where: { waybillNumber },
      include: {
          driver: { select: { name: true, phone: true } }
      }
    });

    if (!expedition) return res.status(404).json({ error: 'Expedition not found' });

    // Allowed roles
    if (!['DRIVER', 'ADMIN_TPS3R', 'MITRA_B2B'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ success: true, expedition });
  } catch (error) {
    console.error('trackExpedition error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
