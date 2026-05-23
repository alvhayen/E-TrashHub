import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const usersData = [
    { email: 'sari@email.com', name: 'Sari', role: 'RUMAH_TANGGA' },
    { email: 'budi.driver@email.com', name: 'Budi', role: 'DRIVER' },
    { email: 'admin.tps3r@email.com', name: 'Admin TPS3R', role: 'ADMIN_TPS3R' },
    { email: 'mitra@industri.com', name: 'Mitra Industri', role: 'MITRA_B2B' },
    { email: 'dinas@balikpapan.go.id', name: 'Dinas LH', role: 'PEMDA' }
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        password: passwordHash,
        points: u.role === 'RUMAH_TANGGA' ? 1200 : 0
      }
    });
    console.log(`Created user: ${user.name} (${user.role})`);
  }

  // Find IDs for relations
  const household = await prisma.user.findUnique({ where: { email: 'sari@email.com' } });
  const driver = await prisma.user.findUnique({ where: { email: 'budi.driver@email.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin.tps3r@email.com' } });

  // 2. Create Pickup Requests
  const pickupData = [
    { status: 'COMPLETED', weight: 5.2, points: 520, types: ['Botol Plastik'] },
    { status: 'VERIFIED', weight: 3.0, points: 300, types: ['Kertas/Kardus'] },
    { status: 'COLLECTED', weight: 2.5, points: 250, types: ['Logam/Kaleng'] },
    { status: 'ON_THE_WAY', weight: 4.0, points: 0, types: ['Botol Plastik', 'Gelas Plastik'] },
    { status: 'PENDING', weight: 1.5, points: 0, types: ['Tutup Botol'] }
  ];

  for (let i = 0; i < 10; i++) {
    const data = pickupData[i % pickupData.length];
    const pickup = await prisma.pickupRequest.create({
      data: {
        userId: household.id,
        driverId: data.status !== 'PENDING' ? driver.id : null,
        wasteTypes: JSON.stringify(data.types),
        estimatedWeight: data.weight,
        actualWeight: data.status === 'COMPLETED' || data.status === 'VERIFIED' ? data.weight : null,
        status: data.status,
        address: 'Jl. Jenderal Sudirman No. 45, Balikpapan Kota',
        points: data.points
      }
    });
    console.log(`Created pickup request: ID ${pickup.id} - ${pickup.status}`);
  }

  // 3. Create Inventory Items for TPS3R
  const inventoryData = [
    { commodity: 'Botol Plastik (PET)', stockKg: 1540.5, pricePerKg: 3500 },
    { commodity: 'Gelas Plastik (PP)', stockKg: 820.0, pricePerKg: 2000 },
    { commodity: 'Kardus Bekas', stockKg: 2150.0, pricePerKg: 1500 },
    { commodity: 'Kaleng Aluminium', stockKg: 450.5, pricePerKg: 12000 },
    { commodity: 'Besi Tua', stockKg: 3200.0, pricePerKg: 4500 }
  ];

  for (const item of inventoryData) {
    const inventory = await prisma.inventory.create({
      data: {
        tps3rId: admin.id,
        ...item
      }
    });
    console.log(`Created inventory: ${inventory.commodity}`);
  }

  // 4. Create Transactions
  const tx = await prisma.transaction.create({
    data: {
      userId: household.id,
      points: 520,
      type: 'EARN',
      description: 'Pickup ID #1 Completed'
    }
  });
  console.log(`Created transaction: ${tx.description}`);

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
