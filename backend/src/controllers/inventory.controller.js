import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /inventory — public (Mitra B2B) — list all READY inventory with TPS3R info
export const getInventory = async (req, res) => {
  try {
    const { commodity, minStock } = req.query;

    const whereClause = {
      status: 'READY'
    };

    if (commodity) {
      whereClause.commodity = { contains: commodity, mode: 'insensitive' };
    }
    if (minStock) {
      whereClause.stockKg = { gte: parseFloat(minStock) };
    }

    const inventory = await prisma.inventory.findMany({
      where: whereClause,
      include: {
        tps3r: {
          select: { name: true, address: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

// POST /inventory — admin creates inventory (ADMIN_TPS3R)
export const createInventoryItem = async (req, res) => {
  try {
    const { commodity, stockKg, pricePerKg } = req.body;
    const inventory = await prisma.inventory.create({
      data: {
        tps3rId: req.user.id,
        commodity,
        stockKg: parseFloat(stockKg),
        pricePerKg: parseFloat(pricePerKg),
        status: 'READY'
      }
    });
    res.status(201).json({ inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
};

// PATCH /inventory/:id — admin updates (ADMIN_TPS3R)
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { commodity, stockKg, pricePerKg, status } = req.body;
    
    // Ensure item belongs to THIS admin
    const existing = await prisma.inventory.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    if (existing.tps3rId !== req.user.id) return res.status(403).json({ error: 'Not authorized for this item' });

    const updateData = {};
    if (commodity !== undefined) updateData.commodity = commodity;
    if (stockKg !== undefined) updateData.stockKg = parseFloat(stockKg);
    if (pricePerKg !== undefined) updateData.pricePerKg = parseFloat(pricePerKg);
    if (status !== undefined) updateData.status = status;

    const inventory = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json({ inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

// DELETE /inventory/:id — admin deletes (ADMIN_TPS3R)
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.inventory.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    if (existing.tps3rId !== req.user.id) return res.status(403).json({ error: 'Not authorized for this item' });

    await prisma.inventory.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};

// GET /inventory/admin — admin sees only their TPS3R's inventory (ADMIN_TPS3R)
export const getAdminInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      where: { tps3rId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};
