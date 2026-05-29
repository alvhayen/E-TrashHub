import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 0. Seed WasteCategory (must come before PickupItem references)
  const wasteCategories = [
    {
      name: 'Botol Plastik',
      slug: 'botol-plastik',
      imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
      priceEstMin: 1500, priceEstMax: 3000,
      description: 'Botol plastik bekas minuman (PET/HDPE). Bersihkan dari sisa cairan sebelum dikumpulkan.',
      sortingTips: 'Lepas tutup botol, pipihkan agar hemat tempat, pisahkan dari plastik jenis lain.',
      sortOrder: 1
    },
    {
      name: 'Gelas Plastik',
      slug: 'gelas-plastik',
      imageUrl: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=400&q=80',
      priceEstMin: 1000, priceEstMax: 2000,
      description: 'Gelas plastik bekas minuman cup. Kumpulkan dalam jumlah banyak karena ringan.',
      sortingTips: 'Cuci bersih, susun bertumpuk agar tidak memakan banyak ruang.',
      sortOrder: 2
    },
    {
      name: 'Kertas & Kardus',
      slug: 'kertas-kardus',
      imageUrl: 'https://images.unsplash.com/photo-1588515724527-074a7a56616c?w=400&q=80',
      priceEstMin: 1200, priceEstMax: 2500,
      description: 'Kertas koran, majalah, kardus bekas packaging. Hindari yang basah atau berminyak.',
      sortingTips: 'Lipat kardus agar pipih, ikat dengan tali, jauhkan dari air.',
      sortOrder: 3
    },
    {
      name: 'Logam & Kaleng',
      slug: 'logam-kaleng',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      priceEstMin: 3000, priceEstMax: 12000,
      description: 'Kaleng aluminium, besi tua, tembaga. Nilai jual tinggi terutama aluminium.',
      sortingTips: 'Pisahkan jenis logam (aluminium vs besi). Bersihkan dari sisa makanan/minuman.',
      sortOrder: 4
    },
    {
      name: 'Tutup Botol',
      slug: 'tutup-botol',
      imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
      priceEstMin: 500, priceEstMax: 1500,
      description: 'Tutup botol plastik dari berbagai jenis minuman. Dikumpulkan terpisah dari botolnya.',
      sortingTips: 'Kumpulkan dalam wadah terpisah. Tidak perlu dicuci, cukup dikeringkan.',
      sortOrder: 5
    },
    {
      name: 'Kain & Tekstil',
      slug: 'kain-tekstil',
      imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80',
      priceEstMin: 800, priceEstMax: 2000,
      description: 'Pakaian bekas, kain perca, tekstil sisa produksi. Bisa untuk upcycling atau daur ulang.',
      sortingTips: 'Pisahkan yang masih layak pakai untuk donasi. Yang sudah rusak untuk daur ulang.',
      sortOrder: 6
    }
  ];

  for (const cat of wasteCategories) {
    await prisma.wasteCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
    console.log(`Created waste category: ${cat.name}`);
  }

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

  // Super Admin user
  await prisma.user.upsert({
    where: { email: 'superadmin@etrashhub.id' },
    update: {},
    create: {
      email: 'superadmin@etrashhub.id',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      password: passwordHash,
      verificationStatus: 'ACTIVE'
    }
  });
  console.log('Created user: Super Admin (SUPER_ADMIN)');

  // Find IDs for relations
  const household = await prisma.user.findUnique({ where: { email: 'sari@email.com' } });
  const driver = await prisma.user.findUnique({ where: { email: 'budi.driver@email.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin.tps3r@email.com' } });

  // 2. Create Pickup Requests
  // estimatedWeight is String in schema — use "Ringan"/"Sedang"/"Berat" labels
  const pickupData = [
    { status: 'COMPLETED', weight: 5.2, points: 520, types: ['Botol Plastik'], estLabel: 'Berat' },
    { status: 'VERIFIED', weight: 3.0, points: 300, types: ['Kertas/Kardus'], estLabel: 'Sedang' },
    { status: 'COLLECTED', weight: 2.5, points: 250, types: ['Logam/Kaleng'], estLabel: 'Sedang' },
    { status: 'ON_THE_WAY', weight: 4.0, points: 0, types: ['Botol Plastik', 'Gelas Plastik'], estLabel: 'Berat' },
    { status: 'PENDING', weight: 1.5, points: 0, types: ['Tutup Botol'], estLabel: 'Ringan' }
  ];

  for (let i = 0; i < 10; i++) {
    const data = pickupData[i % pickupData.length];
    const pickup = await prisma.pickupRequest.create({
      data: {
        userId: household.id,
        driverId: data.status !== 'PENDING' ? driver.id : null,
        wasteTypes: JSON.stringify(data.types),
        estimatedWeight: data.estLabel,
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
