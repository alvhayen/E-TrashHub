import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
  try {
    const { inventoryId, quantityKg, deliveryAddress, notes } = req.body;
    const customerId = req.user.id;

    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(inventoryId) },
    });

    if (!inventory) return res.status(404).json({ error: 'Inventory tidak ditemukan' });
    if (inventory.status !== 'READY') return res.status(400).json({ error: 'Inventory tidak tersedia' });
    if (inventory.stockKg < quantityKg) return res.status(400).json({ error: 'Stok tidak mencukupi' });

    const totalPrice = quantityKg * inventory.pricePerKg;

    const order = await prisma.order.create({
      data: {
        customerId,
        tps3rId: inventory.tps3rId,
        inventoryId: inventory.id,
        quantityKg,
        pricePerKgSnapshot: inventory.pricePerKg,
        totalPrice,
        deliveryAddress,
        notes,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: {
        tps3r: { select: { name: true, tpsName: true, phone: true } },
        inventory: { select: { commodity: true } },
        driver: { select: { name: true, vehiclePlate: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { tps3rId: req.user.id },
      include: {
        customer: { select: { name: true, industryType: true, phone: true } },
        inventory: { select: { commodity: true } },
        driver: { select: { name: true, vehiclePlate: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driverId, rejectionReason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { inventory: true }
    });

    if (!order) return res.status(404).json({ error: 'Order tidak ditemukan' });

    // Validate and update
    let updateData = { status };

    if (status === 'CONFIRMED' || status === 'DRIVER_ASSIGNED') {
      if (driverId) updateData.driverId = parseInt(driverId);
      if (status === 'CONFIRMED') {
        updateData.status = 'DRIVER_ASSIGNED'; // flow says CONFIRMED -> DRIVER_ASSIGNED
      }
    } else if (status === 'REJECTED') {
      updateData.rejectionReason = rejectionReason;
    } else if (status === 'COMPLETED') {
      // Deduct stock here
      if (order.inventory.stockKg >= order.quantityKg) {
        await prisma.inventory.update({
          where: { id: order.inventoryId },
          data: { stockKg: { decrement: order.quantityKg } }
        });
      } else {
         return res.status(400).json({ error: 'Stok tidak mencukupi untuk menyelesaikan pesanan ini.' });
      }
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ success: true, order: updated });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const getDriverOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { driverId: req.user.id, status: { in: ['DRIVER_ASSIGNED', 'ON_THE_WAY', 'DELIVERED', 'COMPLETED'] } },
      include: {
        tps3r: { select: { name: true, tpsName: true, tpsAddress: true } },
        customer: { select: { name: true, phone: true } },
        inventory: { select: { commodity: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching driver orders:', error);
    res.status(500).json({ error: 'Failed to fetch driver orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        tps3r: { select: { name: true, tpsName: true, tpsAddress: true } },
        customer: { select: { name: true, phone: true } },
        inventory: { select: { commodity: true } }
      }
    });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};
